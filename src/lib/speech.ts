import { getCachedSettings } from '@/lib/settingsCache'

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/**
 * Nudges the browser to load its voice list ahead of time. Chrome in particular can silently
 * drop the very first speak() call if it fires before voices finish loading.
 */
export function warmUpSpeech(): void {
  if (!isSpeechSupported()) return
  window.speechSynthesis.getVoices()
}

/**
 * Speaks text aloud via the on-device Web Speech Synthesis API. Voices are bundled with the
 * OS/browser rather than fetched from a server, so this works fully offline. Synchronous and
 * reads settings from a pre-warmed cache (rather than awaiting an IndexedDB read) so the call
 * stays in the same tick as the user gesture that triggered it — Safari in particular silently
 * drops speech requests that arrive even one microtask after the interaction that caused them.
 * No-ops silently when unsupported or when the user has turned voice feedback off in Settings.
 */
export function speak(text: string): void {
  if (!isSpeechSupported() || !text.trim()) return

  const settings = getCachedSettings()
  if (settings && !settings.voiceFeedbackEnabled) return

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
}
