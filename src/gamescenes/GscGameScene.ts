import AbstractGameScene from './AbstractGameScene';
import AudioFile from '../AudioFile';
import Soundtrack from '../Soundtrack';
import Sprite from '../Sprite';
import { GscTile, isGroundTile, isWalkableTile } from '../worldmaps/GscWorldMap';
import { Direction, Point } from '../types';
import { clamp } from '../utilities';

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

/**
 * @internal
 */
enum MovementState {
  WALKING,
  CYCLING,
  SURFING
}

export default class GscGameScene extends AbstractGameScene {
  private character = new Sprite('./assets/gsc/ethan.png', {
    alphaColor: { r: 255, g: 255, b: 255 },
    frames: {
      up1: { x: 107, y: 4, width: 14, height: 16 },
      up2: { x: 123, y: 3, width: 14, height: 16 },
      up3: { x: 138, y: 3, width: 14, height: 16 },
      down1: { x: 58, y: 4, width: 14, height: 16 },
      down2: { x: 74, y: 3, width: 14, height: 16 },
      down3: { x: 90, y: 3, width: 14, height: 16 },
      left1: { x: 29, y: 4, width: 13, height: 16 },
      left2: { x: 44, y: 3, width: 13, height: 16 },
      right1: { x: 1, y: 4, width: 13, height: 16 },
      right2: { x: 15, y: 3, width: 13, height: 16 }
    }
  });

  private bicycle = new Sprite('./assets/gsc/ethan.png', {
    alphaColor: { r: 255, g: 255, b: 255 },
    frames: {
      up1: { x: 67, y: 52, width: 14, height: 16 },
      up2: { x: 50, y: 52, width: 14, height: 16 },
      up3: { x: 84, y: 52, width: 14, height: 16 },
      down1: { x: 18, y: 52, width: 14, height: 16 },
      down2: { x: 1, y: 52, width: 15, height: 16 },
      down3: { x: 33, y: 52, width: 15, height: 16 },
      left1: { x: 118, y: 52, width: 16, height: 16 },
      left2: { x: 100, y: 52, width: 16, height: 16 },
      right1: { x: 138, y: 52, width: 16, height: 16 },
      right2: { x: 156, y: 52, width: 16, height: 16 }
    }
  });

  private direction: Direction = null;
  private isStopped: boolean = false;
  private movement: Point = { x: 0, y: 0 };
  private movementState: MovementState = MovementState.WALKING;
  private offset: Point = { x: 0, y: 0 };
  private characterPosition: Point = { x: 0, y: 0 };
  private remainingMoves: number = 0;

  private soundFx = {
    bump: new AudioFile('./assets/gsc/bump.mp3')
  };
  
  private soundtrack = new Soundtrack({
    bicycle: {
      audio: new AudioFile('./assets/gsc/bicycle.mp3'),
      loop: { start: 5.0, end: 30.0 }
    },
    route30: {
      audio: new AudioFile('./assets/gsc/route-30.mp3'),
      loop: { start: 5.6722, end: 34.335 }
    }
  });

  public initialize(): void {
    this.setStartingPosition();

    // @todo await tileset + character image loading
    this.worldMap.getTileSet().onload(() => {
      this.streamableMap.renderInitialView(this.offset);
      this.streamableMap.renderToCanvas(this.canvas);

      setTimeout(() => {
        this.character.renderToCanvas(this.canvas, this.getCharacterPixelPosition(), 'down1');
      });
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

    document.addEventListener('keypress', event => {
      if (event.key === ' ' && !this.isMoving()) {
        this.soundtrack.play(this.isCycling() ? 'route30' : 'bicycle');

        this.movementState = this.isCycling()
          ? MovementState.WALKING
          : MovementState.CYCLING;

        this.redrawScene();
      }
    });

    this.update();
  }

  private clampOffset(): void {
    // @todo use correct upper bounds
    this.offset.x = clamp(this.offset.x, 0, 16000);
    this.offset.y = clamp(this.offset.y, 0, 16000);
  }

  // @todo have alternate frame determination for cycling/surfing
  private getCharacterFrame(): string {
    const direction = this.getMovementDirection();
    const isMidStep = this.remainingMoves <= 8;
    const isAlternateYStep = Math.floor(this.offset.y / 16) % 2 === 0;

    if (direction === Direction.UP) {
      return this.isMoving() && isMidStep ? (isAlternateYStep ? 'up2' : 'up3') : 'up1';
    } else if (direction === Direction.DOWN) {
      return this.isMoving() && isMidStep ? (isAlternateYStep ? 'down2' : 'down3') : 'down1';
    } else if (direction === Direction.LEFT) {
      return this.isMoving() && isMidStep ? 'left2' : 'left1';
    } else if (direction === Direction.RIGHT) {
      return this.isMoving() && isMidStep ? 'right2' : 'right1';
    } else {
      return 'down1';
    }
  }

  private getCharacterPixelPosition(): Point {
    const characterOffset: Point = {
      x: this.characterPosition.x * 16 - (this.isStopped ? 0 : this.movement.x) * this.remainingMoves,
      y: this.characterPosition.y * 16 - (this.isStopped ? 0 : this.movement.y) * this.remainingMoves
    };

    return {
      x: characterOffset.x - this.offset.x,
      y: characterOffset.y - this.offset.y
    };
  }

  private getCharacterSprite(): Sprite {
    return this.isCycling() ? this.bicycle : this.character;
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

  private getMovementSpeed(): number {
    return this.isCycling() ? 4 : 1;
  }

  private getTileAtCharacterPosition(): GscTile {
    return this.worldMap.getTileMap().getTile(this.characterPosition);
  }

  private isCycling(): boolean {
    return this.movementState === MovementState.CYCLING;
  }

  private isMoving(): boolean {
    return this.remainingMoves > 0;
  }

  private isSurfing(): boolean {
    return this.movementState === MovementState.SURFING;
  }

  private isValidStartingPosition(position: Point): boolean {
    return (
      position.x !== 0 && position.y !== 0 &&
      isGroundTile(this.worldMap.getTileMap().getTile(position))
    );
  }

  private redrawScene(): void {
    this.streamableMap.renderNextView(this.offset);
    this.streamableMap.renderToCanvas(this.canvas);

    this.getCharacterSprite().renderToCanvas(this.canvas, this.getCharacterPixelPosition(), this.getCharacterFrame());
  }

  private setStartingPosition(): void {
    while (!this.isValidStartingPosition(this.characterPosition)) {
      this.characterPosition = {
        x: this.rng.randomInRange(250, 750),
        y: this.rng.randomInRange(250, 750)
      };
    }

    this.offset.x = this.characterPosition.x * 16 - Math.floor(0.5 * window.innerWidth / 16) * 16;
    this.offset.y = this.characterPosition.y * 16 - Math.floor(0.5 * window.innerHeight / 16) * 16;

    this.clampOffset();
  }

  private update = () => {
    requestAnimationFrame(this.update);

    if (this.isMoving()) {
      // Continue movement (or animation) in the last cardinal direction
      if (!this.isStopped) {
        this.offset.x += this.movement.x * this.getMovementSpeed();
        this.offset.y += this.movement.y * this.getMovementSpeed();
      }

      this.remainingMoves -= this.getMovementSpeed();

      this.clampOffset();
      this.redrawScene();
    } else if (this.direction !== null) {
      // Initiate movement in a cardinal direction
      this.movement = movementMap[this.direction];
      this.remainingMoves = 16;

      this.characterPosition.x += this.movement.x;
      this.characterPosition.y += this.movement.y;

      this.isStopped = !isWalkableTile(this.getTileAtCharacterPosition());

      if (this.isStopped) {
        this.characterPosition.x -= this.movement.x;
        this.characterPosition.y -= this.movement.y;

        this.soundFx.bump.play();
      }
    }
  };
}