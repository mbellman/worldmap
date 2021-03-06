import AbstractWorldMap, { Modification } from './AbstractWorldMap';
import Canvas from '../canvas';
import Tileset from '../tileset';
import { Area, Point } from '../types';
import { random } from '../utilities';

enum GscTile {
  REMOVAL = -1,
  GRASS = 0,
  FLOWER_TOP_LEFT_1 = 1,
  FLOWER_BOTTOM_RIGHT_1 = 2
}

interface GscModification extends Modification<GscTile> {}

export default class GscWorldMap extends AbstractWorldMap<GscTile> {
  private tileset = new Tileset({
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

  public render(canvas: Canvas, offset: Point, mapArea: Area): void {
    for (let y = 0; y < mapArea.height; y++) {
      for (let x = 0; x < mapArea.width; x++) {
        const tile = this.tileMap.getTile({ x, y });

        canvas.blit(
          this.tileset.getImage(),
          this.tileset.getTileArea(tile),
          {
            x: offset.x + x * 16,
            y: offset.y + y * 16,
            width: 16,
            height: 16
          }
        );
      }
    }
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