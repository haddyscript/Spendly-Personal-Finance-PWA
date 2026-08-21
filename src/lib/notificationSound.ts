let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    if (!audioContext) audioContext = new Ctor()
    return audioContext
  } catch {
    // Construction can throw (hardware limits, restricted contexts) — the chime is a nice-to-have
    // and must never be the reason a notification fails to show.
    return null
  }
}

let hasUserInteracted = false

/**
 * AudioContext starts suspended until the page has seen a user gesture. Call this once from
 * any early pointerdown/click so the context is already unlocked by the time a notification
 * needs to chime — notifications can fire from a background timer with no gesture of its own.
 */
export function warmUpNotificationSound(): void {
  const unlock = () => {
    hasUserInteracted = true
    void getAudioContext()?.resume()
    window.removeEventListener('pointerdown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { once: true })
}

/**
 * Whether the chime is actually able to play. A notification can fire before the page has ever
 * seen a tap — e.g. the "Welcome back" notification on app launch — and browsers categorically
 * block audio output (any audio, not specific to this app) until a user gesture has occurred.
 * Callers should fall back to the OS's own notification sound in that case, rather than ending
 * up with neither.
 */
export function canPlayNotificationChime(): boolean {
  return hasUserInteracted
}

function playTone(ctx: AudioContext, startTime: number, freq: number, duration: number, gainPeak: number): void {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = freq
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.02)
}

/**
 * A bright, snappy two-note ascending chime played alongside local notifications — synthesized
 * rather than a licensed sound file, tuned to feel upbeat like a typical e-commerce app ding
 * rather than a plain OS beep. Works fully offline since nothing is fetched or decoded.
 */
export async function playNotificationChime(): Promise<void> {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    // Browsers can (and do) auto-suspend an AudioContext when the tab is backgrounded, which is
    // exactly when most notifications fire (timers, budget checks). Scheduling tones against a
    // still-suspended context produces no audible output, so the resume must be awaited first —
    // a fire-and-forget resume() races the scheduling below and silently loses.
    await ctx.resume()
    if (ctx.state !== 'running') return

    const now = ctx.currentTime
    playTone(ctx, now, 880, 0.14, 0.22) // A5
    playTone(ctx, now + 0.1, 1318.5, 0.22, 0.22) // E6
  } catch {
    // Never let the chime be the reason a notification fails to show.
  }
}
