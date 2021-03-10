import AbstractWorldMap from './AbstractWorldMap';
import TileSet from '../TileSet';
import { Area, Point, Size } from '../types';

export enum GscTile {
  GRASS = 0,
  FLOWER_TOP_LEFT_1 = 1,
  FLOWER_BOTTOM_RIGHT_1 = 2,
  POKE_GRASS = 3,
  MINI_TREE = 4,
  ROUND_SHRUB = 5,
  LEDGE_BOTTOM_MIDDLE = 6,
  LEDGE_BOTTOM_LEFT = 7,
  LEDGE_BOTTOM_RIGHT = 8,
  TREE_BASE = 9,
  TREE_TOP = 10,
  WATER = 11,
  WATER_GROUND_TOP = 12,
  WATER_GROUND_TOP_LEFT = 13,
  WATER_GROUND_TOP_RIGHT = 14,
  WATER_GROUND_LEFT = 15,
  WATER_GROUND_RIGHT = 16,
  WATER_GROUND_DIAGONAL_TOP_LEFT = 17,
  WATER_GROUND_DIAGONAL_TOP_RIGHT = 18
}

const isGroundTile = (tile: GscTile) => (
  tile >= GscTile.GRASS &&
  tile <= GscTile.FLOWER_BOTTOM_RIGHT_1
);

const isTreeTile = (tile: GscTile) => (
  tile === GscTile.TREE_BASE ||
  tile === GscTile.TREE_TOP
);

const isWaterTile = (tile: GscTile) => (
  tile >= GscTile.WATER &&
  tile <= GscTile.WATER_GROUND_DIAGONAL_TOP_RIGHT
);

export default class GscWorldMap extends AbstractWorldMap<GscTile> {
  public constructor(seed: number, width: number, height: number) {
    super(seed, width, height);

    this.tileSet = new TileSet({
      url: './assets/gsc-tileset.png',
      tileSize: {
        width: 16,
        height: 16
      },
      tiles: {
        [GscTile.GRASS]: { x: 0, y: 16 },
        [GscTile.FLOWER_TOP_LEFT_1]: { x: 144, y: 16 },
        [GscTile.FLOWER_BOTTOM_RIGHT_1]: { x: 144, y: 0 },
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
        [GscTile.WATER_GROUND_DIAGONAL_TOP_RIGHT]: { x: 288, y: 32 }
      }
    });
  }

  protected buildWorldMap(): void {
    const mapSize = this.tileMap.getSize();

    // Generate flowers
    for (let y = 0; y < mapSize.height; y++) {
      for (let x = 0; x < mapSize.width; x++) {
        if (this.rng.random() > 0.8) {
          const flowerTile = this.rng.random() > 0.5 ? GscTile.FLOWER_BOTTOM_RIGHT_1 : GscTile.FLOWER_TOP_LEFT_1;

          this.tileMap.setTile({ x, y }, flowerTile);
        }
      }
    }

    // Generate water
    for (let i = 0; i < 5000; i++) {
      const area = this.createRandomArea([8, 15]);

      this.loopOver(area, ({ x, y }) => {
        this.tileMap.setTile({ x, y }, GscTile.WATER);
      });
    }

    // Generate tree clusters
    for (let i = 0; i < 5000; i++) {
      const area = this.createRandomArea([3, 15]);

      area.y = area.y % 2 === 0 ? area.y : area.y + 1;

      for (let y = area.y; y < area.y + area.height; y += 2) {
        for (let x = area.x; x < area.x + area.width && x < mapSize.width; x++) {
          const position: Point = { x, y };

          this.tileMap.setTile(position, GscTile.TREE_BASE);
          this.tileMap.setTile({ x: position.x, y: position.y - 1 }, GscTile.TREE_TOP);
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
          currentTile === GscTile.FLOWER_BOTTOM_RIGHT_1 ||
          currentTile === GscTile.FLOWER_TOP_LEFT_1
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