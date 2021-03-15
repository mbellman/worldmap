import AbstractGameScene from './AbstractGameScene';
import AudioFile from '../AudioFile';
import Soundtrack from '../Soundtrack';
import Sprite from '../Sprite';
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
  private character = new Sprite('./assets/gsc/ethan.png', {
    up1: { x: 107, y: 4, width: 14, height: 16 },
    up2: { x: 123, y: 3, width: 14, height: 16 },
    up3: { x: 138, y: 3, width: 14, height: 16 },
    down1: { x: 58, y: 4, width: 14, height: 16 },
    down2: { x: 74, y: 3, width: 14, height: 16 },
    down3: { x: 90, y: 3, width: 14, height: 16 },
    left1: { x: 29, y: 4, width:13, height: 16 },
    left2: { x: 44, y: 3, width:13, height: 16 },
    right1: { x: 1, y: 4, width: 13, height: 16 },
    right2: { x: 15, y: 3, width: 13, height: 16 }
  });

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
      this.direction = directionMap[event.key] ?? null;
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

  private getCharacterFrame(): string {
    const direction = this.getMovementDirection();
    const isHalfStep = Math.floor(this.remainingMoves / 8) % 2 === 0;
    const isAlternateYStep = Math.floor(this.offset.y / 16) % 2 === 0;

    if (direction === Direction.UP) {
      return this.isMoving && isHalfStep ? (isAlternateYStep ? 'up2' : 'up3') : 'up1';
    } else if (direction === Direction.DOWN) {
      return this.isMoving && isHalfStep ? (isAlternateYStep ? 'down2' : 'down3') : 'down1';
    } else if (direction === Direction.LEFT) {
      return this.isMoving && isHalfStep ? 'left2' : 'left1';
    } else if (direction === Direction.RIGHT) {
      return this.isMoving && isHalfStep ? 'right2' : 'right1';
    } else {
      return 'down1';
    }
  }

  private getMovementDirection(): Direction {
    if (this.movement.x < 0) {
      return Direction.LEFT;
    } else if (this.movement.x > 0) {
      return Direction.RIGHT;
    } else if (this.movement.y < 0) {
      return Direction.UP;
    } else {
      return Direction.DOWN;
    }
  }

  private update = () => {
    requestAnimationFrame(this.update);

    if (this.isMoving) {
      this.offset.x += this.movement.x;
      this.offset.y += this.movement.y;

      this.streamableMap.renderNextView(this.offset);
      this.streamableMap.renderToCanvas(this.canvas);

      this.remainingMoves--;

      this.character.renderToCanvas(this.canvas, { x: 350, y: 350 }, this.getCharacterFrame());
    } else if (this.direction !== null) {
      this.movement = movementMap[this.direction];
      this.remainingMoves = 16;
    }
  };
}