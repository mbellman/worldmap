import Canvas from './Canvas';
import { Area, Point } from './types';

/**
 * @internal
 */
type SpriteConfig = Record<string, Area>;

export default class Sprite {
  private config: SpriteConfig;
  private image: HTMLImageElement;

  public constructor(spritesheet: string, config: SpriteConfig) {
    this.image = new Image();
    this.image.src = spritesheet;
    this.config = config;
  }

  public renderToCanvas(canvas: Canvas, offset: Point, frameName: string): void {
    const frame = this.config[frameName];

    canvas.blit(this.image, frame, { ...frame, ...offset });
  }
}