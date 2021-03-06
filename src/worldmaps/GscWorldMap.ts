import AbstractWorldMap, { Modification } from './AbstractWorldMap';
import TileSet from '../tileset';
import { random } from '../utilities';

export enum GscTile {
  GRASS = 0,
  FLOWER_TOP_LEFT_1 = 1,
  FLOWER_BOTTOM_RIGHT_1 = 2
}

export default class GscWorldMap extends AbstractWorldMap<GscTile> {
  public constructor() {
    super(0, 100, 100);

    this.tileSet = new TileSet({
      url: './assets/gsc-tileset.png',
      tileSize: {
        width: 16,
        height: 16
      },
      tiles: {
        [GscTile.GRASS]: { x: 0, y: 16 },
        [GscTile.FLOWER_TOP_LEFT_1]: { x: 144, y: 16 },
        [GscTile.FLOWER_BOTTOM_RIGHT_1]: { x: 144, y: 0 }
      }
    });
  }

  protected buildWorldMap(): void {
    const { width, height } = this.tileMap.size;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.tileMap.setTile({ x, y }, random(0, 2));
      }
    }
  }
}