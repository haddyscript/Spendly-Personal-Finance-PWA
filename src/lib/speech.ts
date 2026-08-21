import { getSettings } from '@/services/settingsService'

/**
 * Speaks text aloud via the on-device Web Speech Synthesis API. Voices are bundled with the
 * OS/browser rather than fetched from a server, so this works fully offline. Cancels any
 * utterance already in progress first, so a rapid sequence of toasts/confirmations doesn't
 * talk over itself. No-ops silently when unsupported or when the user has turned voice
 * feedback off in Settings.
 */
export async function speak(text: string): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return

  const settings = await getSettings()
  if (!settings.voiceFeedbackEnabled) return

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
