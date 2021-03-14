import AbstractGameScene from './AbstractGameScene';
import AudioFile from '../AudioFile';
import Soundtrack from '../Soundtrack';
import { Direction, Point } from '../types';

/**
 * @internal
 */
const directionMap = {
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  ArrowRight: Direction.RIGHT
};

/**
 * @internal
 */
const movementMap = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 }
};

export default class GscGameScene extends AbstractGameScene {
  private direction: Direction = null;
  private movement: Point = { x: 0, y: 0 };
  private offset: Point = { x: 0, y: 0 };
  private remainingMoves: number = 0;
  
  private soundtrack = new Soundtrack({
    route30: {
      audio: new AudioFile('./assets/gsc/route-30.mp3'),
      loop: { start: 5.6722, end: 34.335 }
    }
  });

  public initialize(): void {
    this.worldMap.getTileSet().onload(() => {
      this.streamableMap.renderInitialView(this.offset);
      this.streamableMap.renderToCanvas(this.canvas);
    });

    this.soundtrack.play('route30');

    document.addEventListener('keydown', event => {
      this.direction = directionMap[event.key];
    });

    document.addEventListener('keyup', event => {
      if (this.direction === directionMap[event.key]) {
        this.direction = null;
      }
    });

    this.update();
  }

  private get isMoving(): boolean {
    return this.remainingMoves > 0;
  }

  private update = () => {
    requestAnimationFrame(this.update);

    if (this.isMoving) {
      this.offset.x += this.movement.x;
      this.offset.y += this.movement.y;

      this.streamableMap.renderNextView(this.offset);
      this.streamableMap.renderToCanvas(this.canvas);

      this.remainingMoves--;
    } else if (this.direction !== null) {
      this.movement = movementMap[this.direction];
      this.remainingMoves = 16;
    }
  };
}