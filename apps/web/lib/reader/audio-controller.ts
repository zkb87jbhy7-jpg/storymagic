// Web Audio API controller for narration and SFX

export class AudioController {
  private audioContext: AudioContext | null = null
  private narrationSource: AudioBufferSourceNode | null = null
  private narrationBuffer: AudioBuffer | null = null
  private narrationGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private startTime = 0
  private pauseTime = 0
  private isPlaying = false
  private playbackRate = 1.0
  private onEndCallback: (() => void) | null = null

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  async loadNarration(url: string): Promise<void> {
    const ctx = this.getContext()

    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    this.narrationBuffer = await ctx.decodeAudioData(arrayBuffer)

    // Set up gain nodes
    this.narrationGain = ctx.createGain()
    this.narrationGain.connect(ctx.destination)
    this.narrationGain.gain.value = 1.0

    this.sfxGain = ctx.createGain()
    this.sfxGain.connect(ctx.destination)
    this.sfxGain.gain.value = 0.5
  }

  play(): void {
    if (!this.narrationBuffer || this.isPlaying) return

    const ctx = this.getContext()
    this.narrationSource = ctx.createBufferSource()
    this.narrationSource.buffer = this.narrationBuffer
    this.narrationSource.playbackRate.value = this.playbackRate

    if (this.narrationGain) {
      this.narrationSource.connect(this.narrationGain)
    } else {
      this.narrationSource.connect(ctx.destination)
    }

    this.narrationSource.onended = () => {
      this.isPlaying = false
      this.onEndCallback?.()
    }

    const offset = this.pauseTime
    this.narrationSource.start(0, offset)
    this.startTime = ctx.currentTime - offset
    this.isPlaying = true
  }

  pause(): void {
    if (!this.isPlaying || !this.narrationSource) return

    this.narrationSource.onended = null
    this.narrationSource.stop()
    this.narrationSource.disconnect()
    this.narrationSource = null

    const ctx = this.getContext()
    this.pauseTime = ctx.currentTime - this.startTime
    this.isPlaying = false
  }

  seek(ms: number): void {
    const wasPlaying = this.isPlaying
    if (wasPlaying) {
      this.pause()
    }
    this.pauseTime = ms / 1000
    if (wasPlaying) {
      this.play()
    }
  }

  setSpeed(rate: number): void {
    this.playbackRate = Math.max(0.5, Math.min(2.0, rate))
    if (this.narrationSource) {
      this.narrationSource.playbackRate.value = this.playbackRate
    }
  }

  getPosition(): number {
    if (!this.isPlaying) {
      return this.pauseTime * 1000
    }
    const ctx = this.getContext()
    return (ctx.currentTime - this.startTime) * 1000
  }

  getDuration(): number {
    return this.narrationBuffer ? this.narrationBuffer.duration * 1000 : 0
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }

  setVolume(volume: number): void {
    if (this.narrationGain) {
      this.narrationGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback
  }

  async playSfx(url: string): Promise<void> {
    const ctx = this.getContext()

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = await ctx.decodeAudioData(arrayBuffer)

      const source = ctx.createBufferSource()
      source.buffer = buffer

      if (this.sfxGain) {
        source.connect(this.sfxGain)
      } else {
        source.connect(ctx.destination)
      }

      source.start(0)
    } catch {
      // SFX playback is non-critical
    }
  }

  reset(): void {
    this.pause()
    this.pauseTime = 0
    this.startTime = 0
  }

  destroy(): void {
    this.pause()
    this.narrationBuffer = null
    this.narrationGain?.disconnect()
    this.sfxGain?.disconnect()
    this.narrationGain = null
    this.sfxGain = null
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.onEndCallback = null
  }
}
