import { Area, Point, Size } from './types';

/**
 * @internal
 */
interface TileSetConfig<T extends number = number> {
  url: string,
  tileSize: Size,
  tiles: Record<T, Point>
}

export default class TileSet<T extends number = number> {
  private config: TileSetConfig<T>;
  private image: HTMLImageElement;

  public constructor(config: TileSetConfig<T>) {
    this.config = config;
    this.image = new Image(0, 0);
    this.image.src = config.url;
  }

  public getImage(): Readonly<HTMLImageElement> {
    return this.image;
  }

  public getTileSize(): Readonly<Size> {
    return this.config.tileSize;
  }

  public getTileArea(tileId: T): Area {
    const { tileSize: { width, height }, tiles } = this.config;
    const { x, y } = tiles[tileId];

    return {
      x,
      y,
      width,
      height
    };
  }
}