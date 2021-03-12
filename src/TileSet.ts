import Canvas from './Canvas';
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
  private canvas: Canvas;
  private config: TileSetConfig<T>;
  private isLoaded: boolean = false;
  private onloadCallback: () => void;

  public constructor(config: TileSetConfig<T>) {
    this.config = config;

    const image = new Image();

    image.src = config.url;

    image.onload = () => {
      this.isLoaded = true;
      this.canvas = new Canvas(image.width, image.height);

      this.canvas.blit(
        image,
        { x: 0, y: 0, width: image.width, height: image.height },
        { x: 0, y: 0, width: image.width, height: image.height }
      );

      if (this.onloadCallback) {
        this.onloadCallback();
      }
    };
  }

  public getImageSource(): Readonly<CanvasImageSource> {
    return this.canvas.getElement();
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

  public onload(callback: () => void): void {
    if (this.isLoaded) {
      callback();
    }

    this.onloadCallback = callback;
  }
}