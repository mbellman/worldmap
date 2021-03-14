import AbstractGameScene from './AbstractGameScene';
import AudioFile from '../AudioFile';
import Soundtrack from '../Soundtrack';
import { Duration, Point } from '../types';

export default class GscGameScene extends AbstractGameScene {
  private offset: Point = { x: 0, y: 0 };
  
  private soundtrack = new Soundtrack({
    route30: {
      audio: new AudioFile('./assets/route-30.mp3'),
      loop: { start: 5.6722, end: 34.335 }
    }
  });

  public initialize(): void {
    this.worldMap.getTileSet().onload(() => {
      this.streamableMap.renderInitialView(this.offset);
      this.streamableMap.renderToCanvas(this.canvas);
    });

    this.soundtrack.play('route30');
  }
}