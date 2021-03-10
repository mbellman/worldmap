import AbstractWorldMap, { Modification } from './AbstractWorldMap';
import TileSet from '../TileSet';
import { Area, Point } from '../types';

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
  WATER = 11
}

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
        [GscTile.WATER]: { x: 64, y: 16 }
      }
    });
  }

  protected buildWorldMap(): void {
    const { width, height } = this.tileMap.getSize();

    // Generate flowers
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.rng.random() > 0.8) {
          const flowerTile = this.rng.random() > 0.5 ? GscTile.FLOWER_BOTTOM_RIGHT_1 : GscTile.FLOWER_TOP_LEFT_1;

          this.tileMap.setTile({ x, y }, flowerTile);
        }
      }
    }

    const mapSize = this.tileMap.getSize();

    // Generate water
    for (let i = 0; i < 5000; i++) {
      const pool: Area = {
        x: this.rng.randomInRange(0, mapSize.width),
        y: this.rng.randomInRange(0, mapSize.height),
        width: this.rng.randomInRange(5, 15),
        height: this.rng.randomInRange(5, 15)
      };

      for (let y = pool.y; y < pool.y + pool.height; y++) {
        for (let x = pool.x; x < pool.x + pool.width && x < mapSize.width; x++) {
          this.tileMap.setTile({ x, y }, GscTile.WATER);
        }
      }
    }

    // Generate tree clusters
    for (let i = 0; i < 5000; i++) {
      const cluster: Area = {
        x: this.rng.randomInRange(0, mapSize.width),
        y: this.rng.randomInRange(0, mapSize.height),
        width: this.rng.randomInRange(3, 20),
        height: this.rng.randomInRange(3, 20)
      };

      cluster.y = cluster.y % 2 === 0 ? cluster.y : cluster.y + 1;

      for (let y = cluster.y; y < cluster.y + cluster.height; y += 2) {
        for (let x = cluster.x; x < cluster.x + cluster.width && x < mapSize.width; x++) {
          const position: Point = { x, y };

          this.tileMap.setTile(position, GscTile.TREE_BASE);
          this.tileMap.setTile({ x: position.x, y: position.y - 1 }, GscTile.TREE_TOP);
        }
      }
    }

    // Generate poke grass
    for (let i = 0; i < 5000; i++) {
      const patch: Area = {
        x: this.rng.randomInRange(0, mapSize.width),
        y: this.rng.randomInRange(0, mapSize.height),
        width: this.rng.randomInRange(3, 10),
        height: this.rng.randomInRange(3, 10)
      };

      for (let y = patch.y; y < patch.y + patch.height; y++) {
        for (let x = patch.x; x < patch.x + patch.width && x < mapSize.width; x++) {
          const currentTile = this.tileMap.getTile({ x, y });

          if (
            currentTile === GscTile.GRASS ||
            currentTile === GscTile.FLOWER_BOTTOM_RIGHT_1 ||
            currentTile === GscTile.FLOWER_TOP_LEFT_1
          ) {
            this.tileMap.setTile({ x, y }, GscTile.POKE_GRASS);
          }
        }
      }
    }
  }
}