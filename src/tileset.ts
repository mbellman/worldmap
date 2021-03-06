import { Area, Point } from './types';

/**
 * @internal
 */
type TilesetConfig<T extends number> = {
  url: string,
  tileSize: {
    width: number,
    height: number
  },
  tiles: Record<T, Point>
};

export default class Tileset<T extends number> {
  private image: HTMLImageElement;

  public constructor(private config: TilesetConfig<T>) {
    this.image = new Image(0, 0);
    this.image.src = config.url;
  }

  public getImage(): Readonly<HTMLImageElement> {
    return this.image;
  }

  public getTileArea(name: T): Area {
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