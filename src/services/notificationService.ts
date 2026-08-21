import { getSettings } from '@/services/settingsService'
import { canPlayNotificationChime, playNotificationChime } from '@/lib/notificationSound'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
}

export function getNotificationPermission(): NotificationPermission {
  return isNotificationSupported() ? Notification.permission : 'denied'
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  return Notification.requestPermission()
}

export interface NotifyOptions {
  body?: string
  /** Notifications sharing a tag replace each other instead of stacking. */
  tag?: string
}

/**
 * Shows a local notification through the service worker, so it can appear even while the
 * app is backgrounded or the tab isn't focused. Everything here is client-side — no server
 * ever sees these, in keeping with Spendly's local-first, nothing-leaves-the-device design.
 * No-ops silently if unsupported, permission isn't granted, or the user hasn't opted in.
 */
export async function notify(title: string, options: NotifyOptions = {}): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return

  const settings = await getSettings()
  if (!settings.notificationsEnabled) return

  // Plays our own chime instead of the OS default — but only once we know it can actually be
  // heard. Browsers block all audio output until the page has seen a user gesture, which a
  // notification can easily fire before (e.g. the "Welcome back" notification on app launch).
  // Suppressing the OS sound in that case would trade a working default sound for true silence,
  // so `silent` only kicks in once our chime is actually able to play. Fired without awaiting:
  // the chime is a nice-to-have and must never delay or block the notification from showing.
  const canChime = canPlayNotificationChime()
  if (canChime) void playNotificationChime()

  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(title, {
    body: options.body,
    tag: options.tag,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    silent: canChime,
  })
}
