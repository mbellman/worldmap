import Canvas from './Canvas';
import { Area, Color, Point } from './types';

/**
 * @internal
 */
interface SpriteConfig {
  alphaColor: Color;
  frames: Record<string, Area>;
}

export default class Sprite {
  private canvas: Canvas;
  private config: SpriteConfig;

  public constructor(spritesheet: string, config: SpriteConfig) {
    this.config = config;

    const image = new Image();
    
    image.src = spritesheet;

    image.onload = () => {
      this.canvas = new Canvas(image.width, image.height);

      this.canvas.blit(image);
      this.canvas.setColorToAlpha(config.alphaColor, 0);
    };
  }

  public renderToCanvas(canvas: Canvas, offset: Point, frameName: string): void {
    const frame = this.config.frames[frameName];

    canvas.blit(this.canvas.getElement(), frame, { ...frame, ...offset });
  }
}