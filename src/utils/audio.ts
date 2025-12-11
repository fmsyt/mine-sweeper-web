class AudioManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    return this.audioContext;
  }

  async loadSound(url: string): Promise<AudioBuffer> {
    if (this.audioBuffers.has(url)) {
      return this.audioBuffers.get(url)!;
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer =
      await this.getAudioContext().decodeAudioData(arrayBuffer);

    this.audioBuffers.set(url, audioBuffer);
    return audioBuffer;
  }

  async playSound(url: string, volume = 1.0): Promise<void> {
    try {
      const audioBuffer = await this.loadSound(url);
      const context = this.getAudioContext();

      const source = context.createBufferSource();
      const gainNode = context.createGain();

      source.buffer = audioBuffer;
      gainNode.gain.value = Math.max(0, Math.min(1, volume));

      source.connect(gainNode);
      gainNode.connect(context.destination);

      source.start(0);
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  }

  async preloadSounds(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.loadSound(url)));
  }

  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioBuffers.clear();
  }
}

export const audioManager = new AudioManager();

export async function playClickSound(volume = 1.0): Promise<void> {
  await audioManager.playSound("/click.mp3", volume);
}

export async function preloadClickSound(): Promise<void> {
  await audioManager.preloadSounds(["/click.mp3"]);
}
