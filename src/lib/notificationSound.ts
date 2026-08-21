let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioContext) audioContext = new Ctor()
  return audioContext
}

/**
 * AudioContext starts suspended until the page has seen a user gesture. Call this once from
 * any early pointerdown/click so the context is already unlocked by the time a notification
 * needs to chime — notifications can fire from a background timer with no gesture of its own.
 */
export function warmUpNotificationSound(): void {
  const unlock = () => {
    void getAudioContext()?.resume()
    window.removeEventListener('pointerdown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { once: true })
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
export function playNotificationChime(): void {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()

  const now = ctx.currentTime
  playTone(ctx, now, 880, 0.14, 0.22) // A5
  playTone(ctx, now + 0.1, 1318.5, 0.22, 0.22) // E6
}
