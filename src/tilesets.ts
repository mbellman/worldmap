import { Point, Bounds } from './types';

/**
 * @internal
 */
type TilesetConfig<T extends string> = {
  url: string,
  tileSize: {
    width: number,
    height: number
  },
  tiles: Record<T, Point>
};

/**
 * @internal
 */
class Tileset<T extends string> {
  private image: HTMLImageElement;

  public constructor(private config: TilesetConfig<T>) {
    this.image = new Image(0, 0);
    this.image.src = config.url;
  }

  public getImage(): Readonly<HTMLImageElement> {
    return this.image;
  }

  public getTile(name: T): Bounds {
    const { tileSize: { width, height }, tiles } = this.config;
    const { x, y } = tiles[name];

    return {
      x,
      y,
      width,
      height
    };
  }
}

export const gsc = new Tileset({
  url: './assets/gsc-tileset.png',
  tileSize: {
    width: 16,
    height: 16
  },
  tiles: {
    grass: { x: 0, y: 16 }
  }
});