import AbstractWorldMap from './AbstractWorldMap';
import TileSet from '../TileSet';
import { Area, Point, Size } from '../types';

export enum GscTile {
  GRASS,
  FLOWER_TOP_LEFT,
  FLOWER_BOTTOM_RIGHT,
  POKE_GRASS,
  MINI_TREE,
  ROUND_SHRUB,
  LEDGE_BOTTOM_MIDDLE,
  LEDGE_BOTTOM_LEFT,
  LEDGE_BOTTOM_RIGHT,
  TREE_BASE,
  TREE_TOP,
  WATER,
  WATER_GROUND_TOP,
  WATER_GROUND_TOP_LEFT,
  WATER_GROUND_TOP_RIGHT,
  WATER_GROUND_LEFT,
  WATER_GROUND_RIGHT,
  WATER_GROUND_DIAGONAL_TOP_LEFT,
  WATER_GROUND_DIAGONAL_TOP_RIGHT,
  ROCK_SURFACE,
  ROCK_FACE_TOP,
  ROCK_FACE_BOTTOM,
  ROCK_FACE_RIGHT,
  ROCK_FACE_LEFT,
  ROCK_FACE_TOP_LEFT,
  ROCK_FACE_TOP_RIGHT,
  ROCK_FACE_BOTTOM_LEFT,
  ROCK_FACE_BOTTOM_RIGHT,
  ROCK_FACE_CORNER_LEFT,
  ROCK_FACE_CORNER_RIGHT
}

const isGroundTile = (tile: GscTile) => (
  tile >= GscTile.GRASS &&
  tile <= GscTile.FLOWER_BOTTOM_RIGHT
);

const isTreeTile = (tile: GscTile) => (
  tile === GscTile.TREE_BASE ||
  tile === GscTile.TREE_TOP
);

const isWaterTile = (tile: GscTile) => (
  tile >= GscTile.WATER &&
  tile <= GscTile.WATER_GROUND_DIAGONAL_TOP_RIGHT
);

const isRockTile = (tile: GscTile) => (
  tile >= GscTile.ROCK_SURFACE
);

export default class GscWorldMap extends AbstractWorldMap<GscTile> {
  public constructor(seed: number, width: number, height: number) {
    super(seed, width, height);

    this.tileSet = new TileSet({
      url: './assets/gsc/tileset.png',
      tileSize: {
        width: 16,
        height: 16
      },
      tiles: {
        [GscTile.GRASS]: { x: 0, y: 16 },
        [GscTile.FLOWER_TOP_LEFT]: { x: 144, y: 16 },
        [GscTile.FLOWER_BOTTOM_RIGHT]: { x: 144, y: 0 },
        [GscTile.POKE_GRASS]: { x: 176, y: 16 },
        [GscTile.MINI_TREE]: { x: 208, y: 16 },
        [GscTile.ROUND_SHRUB]: { x: 48, y: 16 },
        [GscTile.LEDGE_BOTTOM_MIDDLE]: { x: 96, y: 80 },
        [GscTile.LEDGE_BOTTOM_LEFT]: { x: 80, y: 80 },
        [GscTile.LEDGE_BOTTOM_RIGHT]: { x: 112, y: 80 },
        [GscTile.TREE_BASE]: { x: 224, y: 48 },
        [GscTile.TREE_TOP]: { x: 224, y: 32 },
        [GscTile.WATER]: { x: 64, y: 16 },
        [GscTile.WATER_GROUND_TOP]: { x: 304, y: 32 },
        [GscTile.WATER_GROUND_TOP_LEFT]: { x: 320, y: 0 },
        [GscTile.WATER_GROUND_TOP_RIGHT]: { x: 288, y: 0 },
        [GscTile.WATER_GROUND_LEFT]: { x: 320, y: 16 },
        [GscTile.WATER_GROUND_RIGHT]: { x: 288, y: 16 },
        [GscTile.WATER_GROUND_DIAGONAL_TOP_LEFT]: { x: 320, y: 32 },
        [GscTile.WATER_GROUND_DIAGONAL_TOP_RIGHT]: { x: 288, y: 32 },
        [GscTile.ROCK_SURFACE]: { x: 176, y: 48 },
        [GscTile.ROCK_FACE_BOTTOM]: { x: 176, y: 64 },
        [GscTile.ROCK_FACE_LEFT]: { x: 160, y: 48 },
        [GscTile.ROCK_FACE_RIGHT]: { x: 192, y: 48 },
        [GscTile.ROCK_FACE_TOP]: { x: 176, y: 32 },
        [GscTile.ROCK_FACE_TOP_LEFT]: { x: 160, y: 32 },
        [GscTile.ROCK_FACE_TOP_RIGHT]: { x: 192, y: 32 },
        [GscTile.ROCK_FACE_BOTTOM_LEFT]: { x: 160, y: 64 },
        [GscTile.ROCK_FACE_BOTTOM_RIGHT]: { x: 192, y: 64 },
        [GscTile.ROCK_FACE_CORNER_LEFT]: { x: 192, y: 80 },
        [GscTile.ROCK_FACE_CORNER_RIGHT]: { x: 160, y: 80 }
      }
    });
  }

  protected buildWorldMap(): void {
    const mapSize = this.tileMap.getSize();

    // Generate flowers
    for (let y = 0; y < mapSize.height; y++) {
      for (let x = 0; x < mapSize.width; x++) {
        if (this.rng.random() > 0.8) {
          const flowerTile = this.rng.random() > 0.5 ? GscTile.FLOWER_BOTTOM_RIGHT : GscTile.FLOWER_TOP_LEFT;

          this.tileMap.setTile({ x, y }, flowerTile);
        }
      }
    }

    // Generate water
    for (let i = 0; i < 500; i++) {
      // @todo define a routine for random-walk area generation
      const offset: Point = {
        x: this.rng.randomInRange(0, this.tileMap.getSize().width),
        y: this.rng.randomInRange(0, this.tileMap.getSize().height)
      };

      for (let j = 0; j < 50; j++) {
        offset.x += this.rng.randomInRange(-5, 5);
        offset.y += this.rng.randomInRange(-5, 5);

        const area: Area = {
          x: offset.x,
          y: offset.y,
          width: this.rng.randomInRange(6, 8),
          height: this.rng.randomInRange(6, 8)
        };

        this.loopOver(area, ({ x, y }) => {
          this.tileMap.setTile({ x, y }, GscTile.WATER);
        });
      }
    }

    // Generate rocks
    for (let i = 0; i < 500; i++) {
      // @todo define a routine for random-walk area generation
      const offset: Point = {
        x: this.rng.randomInRange(0, this.tileMap.getSize().width),
        y: this.rng.randomInRange(0, this.tileMap.getSize().height)
      };

      for (let j = 0; j < 25; j++) {
        offset.x += this.rng.randomInRange(-5, 5);
        offset.y += this.rng.randomInRange(-5, 5);

        const area: Area = {
          x: offset.x,
          y: offset.y,
          width: this.rng.randomInRange(6, 8),
          height: this.rng.randomInRange(6, 8)
        };

        this.loopOver(area, ({ x, y }) => {
          this.tileMap.setTile({ x, y }, GscTile.ROCK_SURFACE);
        });
      }
    }

    // Generate rock faces
    for (let y = 0; y < mapSize.height; y++) {
      for (let x = 0; x < mapSize.width; x++) {
        const tile = this.tileMap.getTile({ x, y });

        if (tile === GscTile.ROCK_SURFACE) {
          const topTile = this.tileMap.getTile({ x, y: y - 1 });
          const bottomTile = this.tileMap.getTile({ x, y: y + 1 });
          const leftTile = this.tileMap.getTile({ x: x - 1, y });
          const rightTile = this.tileMap.getTile({ x: x + 1, y });
          const topLeftTile = this.tileMap.getTile({ x: x - 1, y: y - 1 });
          const topRightTile = this.tileMap.getTile({ x: x + 1, y: y - 1 });
          const bottomLeftTile = this.tileMap.getTile({ x: x - 1, y: y + 1 });
          const bottomRightTile = this.tileMap.getTile({ x: x + 1, y: y + 1 });

          const isRock = {
            top: isRockTile(topTile),
            bottom: isRockTile(bottomTile),
            left: isRockTile(leftTile),
            right: isRockTile(rightTile),
            topLeft: isRockTile(topLeftTile),
            topRight: isRockTile(topRightTile),
            bottomLeft: isRockTile(bottomLeftTile),
            bottomRight: isRockTile(bottomRightTile)
          };

          // @todo define relationships between rock face tiles
          // and adjacent tiles; generate faces heuristically
          if (isRock.top && isRock.left && isRock.right && isRock.bottom && !isRock.bottomRight) {
            this.tileMap.setTile({ x, y }, GscTile.ROCK_FACE_CORNER_LEFT);
          } else if (isRock.top && isRock.left && isRock.right && isRock.bottom && !isRock.bottomLeft) {
            this.tileMap.setTile({ x, y }, GscTile.ROCK_FACE_CORNER_RIGHT);
          } else if (isRock.bottom && isRock.right && !isRock.top && !isRock.left && !isRock.topLeft) {
            this.tileMap.setTile({ x, y }, GscTile.ROCK_FACE_TOP_LEFT);
          } else if (isRock.bottom && isRock.left && !isRock.top && !isRock.right && !isRock.topRight) {
            this.tileMap.setTile({ x, y }, GscTile.ROCK_FACE_TOP_RIGHT);
          } else if (isRock.top && isRock.right && isRock.topRight && !isRock.left && !isRock.bottom) {
            this.tileMap.setTile({ x, y }, GscTile.ROCK_FACE_BOTTOM_LEFT);
          } else if (isRock.top && isRock.left && isRock.topLeft && !isRock.right && !isRock.bottom) {
            this.tileMap.setTile({ x, y }, GscTile.ROCK_FACE_BOTTOM_RIGHT);
          } else if (isRock.top && !isRock.bottom) {
            this.tileMap.setTile({ x, y }, GscTile.ROCK_FACE_BOTTOM);
          } else if (isRock.right && !isRock.left) {
            this.tileMap.setTile({ x, y }, GscTile.ROCK_FACE_LEFT);
          } else if (isRock.left && !isRock.right) {
            this.tileMap.setTile({ x, y }, GscTile.ROCK_FACE_RIGHT);
          } else if (isRock.bottom && !isRock.top) {
            this.tileMap.setTile({ x, y }, GscTile.ROCK_FACE_TOP);
          }
        }
      }
    }

    // Generate tree clusters
    for (let i = 0; i < 5000; i++) {
      const area = this.createRandomArea([3, 15]);

      area.y = area.y % 2 === 0 ? area.y : area.y + 1;

      for (let y = area.y; y < area.y + area.height; y += 2) {
        for (let x = area.x; x < area.x + area.width && x < mapSize.width; x++) {
          const position: Point = { x, y };
          const tile = this.tileMap.getTile(position);
          const topTile = this.tileMap.getTile({ x: position.x, y: position.y - 1 });

          if (isGroundTile(tile)) {
            if (isGroundTile(topTile)) {
              this.tileMap.setTile(position, GscTile.TREE_BASE);
              this.tileMap.setTile({ x: position.x, y: position.y - 1 }, GscTile.TREE_TOP);
            } else {
              this.tileMap.setTile(position, GscTile.MINI_TREE);
            }
          }
        }
      }
    }

    // Generate poke grass
    for (let i = 0; i < 5000; i++) {
      const area = this.createRandomArea([3, 10]);

      this.loopOver(area, ({ x, y }) => {
        const currentTile = this.tileMap.getTile({ x, y });

        if (
          currentTile === GscTile.GRASS ||
          currentTile === GscTile.FLOWER_BOTTOM_RIGHT ||
          currentTile === GscTile.FLOWER_TOP_LEFT
        ) {
          this.tileMap.setTile({ x, y }, GscTile.POKE_GRASS);
        }
      });
    }

    // Generate shrubs
    for (let y = 0; y < mapSize.height; y++) {
      for (let x = 0; x < mapSize.width; x++) {
        const tile = this.tileMap.getTile({ x, y });
        const topTile = this.tileMap.getTile({ x, y: y - 1 });
        const leftTile = this.tileMap.getTile({ x: x - 1, y });
        const rightTile = this.tileMap.getTile({ x: x + 1, y });
        const bottomTile = this.tileMap.getTile({ x, y: y + 1 });
  
        if (
          isGroundTile(tile) &&
          (
            (isTreeTile(topTile) && y % 5 === 0) ||
            (isTreeTile(leftTile) && x % 5 === 0) ||
            (isTreeTile(rightTile) && x % 5 === 0) ||
            (isTreeTile(bottomTile) && y % 5 === 0)
          )
        ) {
          this.tileMap.setTile({ x, y }, GscTile.MINI_TREE);
        }
      }
    }

    // Add edges where water meets ground
    for (let y = 0; y < mapSize.height; y++) {
      for (let x = 0; x < mapSize.width; x++) {
        const tile = this.tileMap.getTile({ x, y });

        if (tile === GscTile.WATER) {
          const topTile = this.tileMap.getTile({ x, y: y - 1 });
          const leftTile = this.tileMap.getTile({ x: x - 1, y });
          const rightTile = this.tileMap.getTile({ x: x + 1, y });
          const topLeftTile = this.tileMap.getTile({ x: x - 1, y: y - 1 });
          const topRightTile = this.tileMap.getTile({ x: x + 1, y: y - 1 });

          // @todo define relationships between water edge tiles
          // and adjacent tiles; generate edges heuristically
          if (!isWaterTile(topTile)) {
            if (!isWaterTile(leftTile)) {
              this.tileMap.setTile({ x, y }, GscTile.WATER_GROUND_TOP_LEFT);
            } else if (!isWaterTile(rightTile)) {
              this.tileMap.setTile({ x, y }, GscTile.WATER_GROUND_TOP_RIGHT);
            } else {
              this.tileMap.setTile({ x, y }, GscTile.WATER_GROUND_TOP);
            }
          } else if (!isWaterTile(leftTile)) {
            this.tileMap.setTile({ x, y }, GscTile.WATER_GROUND_LEFT);
          } else if (!isWaterTile(rightTile)) {
            this.tileMap.setTile({ x, y }, GscTile.WATER_GROUND_RIGHT);
          } else if (!isWaterTile(topLeftTile)) {
            this.tileMap.setTile({ x, y }, GscTile.WATER_GROUND_DIAGONAL_TOP_LEFT);
          } else if (!isWaterTile(topRightTile)) {
            this.tileMap.setTile({ x, y }, GscTile.WATER_GROUND_DIAGONAL_TOP_RIGHT);
          }
        }
      }
    }
  }

  private createRandomArea(sizeRange: [number, number]): Area {
    const mapSize = this.tileMap.getSize();

    return {
      x: this.rng.randomInRange(0, mapSize.width),
      y: this.rng.randomInRange(0, mapSize.height),
      width: this.rng.randomInRange(sizeRange[0], sizeRange[1]),
      height: this.rng.randomInRange(sizeRange[0], sizeRange[1])
    };
  }

  private loopOver(area: Area, handler: (point: Point) => void): void {
    const mapSize = this.tileMap.getSize();

    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width && x < mapSize.width; x++) {
        handler({ x, y });
      }
    }
  }
}