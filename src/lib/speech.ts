import { getCachedSettings } from '@/lib/settingsCache'

/** Slightly slower than the browser default (1) so words don't run together. */
const SPEECH_RATE = 0.95
/**
 * Deliberate silence between sentences. Queuing multiple utterances back-to-back isn't enough
 * on its own — some engines leave almost no gap between them, which sounds just as run-on as
 * one long utterance. This makes the pause explicit and consistent everywhere.
 */
const PAUSE_BETWEEN_SENTENCES_MS = 220

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

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

// Incremented on every speak() call so a stale queued continuation (from a speak() call that
// was superseded before it finished) can recognize it's no longer current and stop instead of
// talking over the newer one.
let generation = 0

export interface SpeakOptions {
  onStart?: () => void
  onEnd?: () => void
}

function speakQueue(sentences: string[], myGeneration: number, options?: SpeakOptions): void {
  if (myGeneration !== generation) {
    options?.onEnd?.()
    return
  }
  const [sentence, ...rest] = sentences
  if (!sentence) {
    options?.onEnd?.()
    return
  }

  const utterance = new SpeechSynthesisUtterance(sentence)
  utterance.rate = SPEECH_RATE
  utterance.onend = () => {
    if (myGeneration !== generation || rest.length === 0) {
      options?.onEnd?.()
      return
    }
    window.setTimeout(() => speakQueue(rest, myGeneration, options), PAUSE_BETWEEN_SENTENCES_MS)
  }
  window.speechSynthesis.speak(utterance)
}

/** Cancels any speech in progress (from speak()) and its pending queue continuation. */
export function cancelSpeech(): void {
  if (!isSpeechSupported()) return
  generation++
  window.speechSynthesis.cancel()
}

/**
 * Speaks text aloud via the on-device Web Speech Synthesis API, sentence by sentence with a
 * deliberate pause between each so it reads more like natural speech than one run-on stream.
 * Voices are bundled with the OS/browser rather than fetched from a server, so this works fully
 * offline. Synchronous and reads settings from a pre-warmed cache (rather than awaiting an
 * IndexedDB read) so the call stays in the same tick as the user gesture that triggered it —
 * Safari in particular silently drops speech requests that arrive even one microtask after the
 * interaction that caused them. No-ops silently when unsupported or voice feedback is off.
 */
export function speak(text: string, options?: SpeakOptions): void {
  if (!isSpeechSupported() || !text.trim()) {
    options?.onEnd?.()
    return
  }

  const settings = getCachedSettings()
  if (settings && !settings.voiceFeedbackEnabled) {
    options?.onEnd?.()
    return
  }

  window.speechSynthesis.cancel()
  const myGeneration = ++generation
  options?.onStart?.()
  speakQueue(splitIntoSentences(text), myGeneration, options)
}
