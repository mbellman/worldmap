import AbstractWorldMap, { Modification } from './AbstractWorldMap';
import TileSet from '../TileSet';
import { Point } from '../types';

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
  TREE_TOP = 10
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
        [GscTile.TREE_TOP]: { x: 224, y: 32 }
      }
    });
  }

  protected buildWorldMap(): void {
    const { width, height } = this.tileMap.size;

    // Generate landscape
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.tileMap.setTile({ x, y }, this.random(0, 6));
      }
    }

    // Generate trees
    for (let i = 0; i < 2000; i++) {
      const position: Point = {
        x: this.random(0, width),
        y: this.random(0, height)
      };

      this.tileMap.setTile(position, GscTile.TREE_BASE);
      this.tileMap.setTile({ x: position.x, y: position.y - 1 }, GscTile.TREE_TOP);
    }
  }
}