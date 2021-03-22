import AudioFile from './AudioFile';
import { Duration } from './types';

export interface Track {
  audio: AudioFile;
  loop: Duration;
}

export default class Soundtrack<T extends string> {
  private activeTrack: T = null;
  private trackList: Record<T, Track>;

  public constructor(trackList: Record<T, Track>) {
    this.trackList = trackList;
  }

  public play(trackName: T): void {
    const { audio, loop } = this.trackList[trackName];

    // @todo fade current track out, start playing new track
    this.stopActiveTrack();

    audio.setLoop(loop);
    audio.play();

    this.activeTrack = trackName;
  }

  private stopActiveTrack(): void {
    const track = this.trackList[this.activeTrack];

    track?.audio.stop();
  }
}