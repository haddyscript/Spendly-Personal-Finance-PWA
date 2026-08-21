type HapticPattern = number | number[]

const PATTERNS = {
  light: 10,
  medium: 20,
  heavy: 35,
  success: [10, 40, 15],
  warning: [15, 60, 15],
  error: [25, 50, 25, 50, 25],
} as const satisfies Record<string, HapticPattern>

export type HapticStyle = keyof typeof PATTERNS

/**
 * Fires a short device vibration for tactile feedback.
 * iOS Safari never exposes the Vibration API to web content (even installed
 * PWAs), so this silently no-ops there — only Android/Chromium browsers feel it.
 */
export function haptic(style: HapticStyle = 'light'): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  navigator.vibrate(PATTERNS[style])
}
