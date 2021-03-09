import AbstractWorldMap from './worldmaps/AbstractWorldMap';
import Canvas from './Canvas';
import { Area, Point, Size } from './types';
import { clamp } from './utilities';

/**
 * @internal
 */
interface StreamBuffer {
  A: Canvas;
  B: Canvas;
  isSwapped: boolean;
}

/**
 * @todo create a separate StreamableMap class for seamless rendering logic
 */
export default class InteractiveMap {
  private buffer: StreamBuffer = {
    A: new Canvas(0, 0),
    B: new Canvas(0, 0),
    isSwapped: false
  };

  private canvas: Canvas;
  private dragMomentum: Point = { x: 0, y: 0 };
  private offset: Point = { x: 0, y: 0 };
  private previousOffset: Point = { x: 0, y: 0 };
  private worldMap: AbstractWorldMap<number>;

  public constructor(worldMap: AbstractWorldMap<any>) {
    this.worldMap = worldMap;
    this.canvas = new Canvas(window.innerWidth, window.innerHeight);

    this.canvas.attach(document.body);
    this.canvas.clear('#000');

    this.buffer.A.setSize(window.innerWidth, window.innerHeight);
    this.buffer.B.setSize(window.innerWidth, window.innerHeight);
  }

  public initialize(): void {
    setTimeout(() => {
      this.render();
      this.renderInitialBufferCanvas();
    }, 50);

    window.addEventListener('resize', () => {
      this.canvas.setSize(window.innerWidth, window.innerHeight);

      this.buffer.A.setSize(window.innerWidth, window.innerHeight);
      this.buffer.B.setSize(window.innerWidth, window.innerHeight);

      this.renderInitialBufferCanvas();
      this.render();
    });
  
    document.body.addEventListener('mousedown', event => {
      const mouseStart: Point = {
        x: event.clientX,
        y: event.clientY
      };
  
      const initialOffset = { ...this.offset };

      this.previousOffset = { ...this.offset };
      this.dragMomentum = { x: 0, y: 0 };
  
      const onMouseMove = (e: MouseEvent) => {
        const mouseDelta: Point = {
          x: e.clientX - mouseStart.x,
          y: e.clientY - mouseStart.y
        };

        this.previousOffset.x = this.offset.x;
        this.previousOffset.y = this.offset.y;

        const bounds = this.getOffsetBounds();
  
        this.offset.x = clamp(initialOffset.x - mouseDelta.x, 0, bounds.width);
        this.offset.y = clamp(initialOffset.y - mouseDelta.y, 0, bounds.height);
   
        this.render();
      };
  
      const onMouseUp = () => {
        document.body.removeEventListener('mousemove', onMouseMove);
        document.body.removeEventListener('mouseup', onMouseUp);
        document.body.removeEventListener('mouseleave', onMouseUp);

        this.dragMomentum = this.getLastFrameDelta();

        this.decayDragMomentum();
      };
  
      document.body.addEventListener('mousemove', onMouseMove);
      document.body.addEventListener('mouseup', onMouseUp);
      document.body.addEventListener('mouseleave', onMouseUp);
    });
  }

  private decayDragMomentum(): void {
    const bounds = this.getOffsetBounds();

    this.previousOffset.x = this.offset.x;
    this.previousOffset.y = this.offset.y;

    this.offset.x = clamp(Math.round(this.offset.x + this.dragMomentum.x), 0, bounds.width);
    this.offset.y = clamp(Math.round(this.offset.y + this.dragMomentum.y), 0, bounds.height);

    if (this.offset.x === 0 || this.offset.x === bounds.width) {
      this.dragMomentum.x = 0;
    }

    if (this.offset.y === 0 || this.offset.y === bounds.height) {
      this.dragMomentum.y = 0;
    }

    this.render();

    this.dragMomentum.x *= 0.9;
    this.dragMomentum.y *= 0.9;

    if (Math.abs(this.dragMomentum.x) < 0.1 && Math.abs(this.dragMomentum.y) < 0.1) {
      this.dragMomentum = { x: 0, y: 0 };

      return;
    }

    requestAnimationFrame(() => this.decayDragMomentum());
  }

  private getLastFrameDelta(): Point {
    return {
      x: this.offset.x - this.previousOffset.x,
      y: this.offset.y - this.previousOffset.y
    };
  }

  private getOffsetBounds(): Area {
    const { width: mapWidth, height: mapHeight } = this.worldMap.getTileMap().getSize();
    const { width: tileWidth, height: tileHeight } = this.worldMap.getTileSet().getTileSize();

    return {
      x: 0,
      y: 0,
      width: mapWidth * tileWidth - window.innerWidth,
      height: mapHeight * tileHeight - window.innerHeight
    };
  }

  private getVisibleMapArea(): Area {
    const { width: mapWidth, height: mapHeight } = this.worldMap.getTileMap().getSize();
    const { width: tileWidth, height: tileHeight } = this.worldMap.getTileSet().getTileSize();

    const area: Area = {
      x: Math.floor(this.offset.x / tileWidth),
      y: Math.floor(this.offset.y / tileHeight),
      width: Math.ceil(window.innerWidth / tileWidth) + 1,
      height: Math.ceil(window.innerHeight / tileHeight) + 1
    };

    return {
      x: clamp(area.x, 0, mapWidth),
      y: clamp(area.y, 0, mapHeight),
      width: clamp(area.width, 0, mapWidth - area.x),
      height: clamp(area.height, 0, mapHeight - area.y)
    };
  }

  private render(): void {
    const bufferCanvas = this.buffer.isSwapped ? this.buffer.B : this.buffer.A;
  
    this.renderNextBufferCanvas();

    this.canvas.blit(
      bufferCanvas.getElement(),
      { x: 0, y: 0, width: bufferCanvas.width, height: bufferCanvas.height },
      { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height }
    );
  }

  private renderInitialBufferCanvas(): void {
    const tileMap = this.worldMap.getTileMap();
    const tileSet = this.worldMap.getTileSet();
    const { width: tileWidth, height: tileHeight } = tileSet.getTileSize();    
    const mapArea = this.getVisibleMapArea();

    const shift: Point = {
      x: -(this.offset.x % tileWidth),
      y: -(this.offset.y % tileHeight)
    };

    this.buffer.A.clear('#000');

    for (let y = mapArea.y; y < mapArea.y + mapArea.height; y++) {
      for (let x = mapArea.x; x < mapArea.x + mapArea.width; x++) {
        const tile = tileMap.getTile({ x, y });

        this.buffer.A.blit(
          tileSet.getImageSource(),
          tileSet.getTileArea(tile),
          {
            x: shift.x + x * tileWidth - mapArea.x * tileWidth,
            y: shift.y + y * tileHeight - mapArea.y * tileHeight,
            width: tileWidth,
            height: tileHeight
          }
        );
      }
    }

    this.canvas.blit(
      this.buffer.A.getElement(),
      { x: 0, y: 0, width: this.buffer.A.width, height: this.buffer.A.height },
      { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height }
    );
  }

  private renderNextBufferCanvas(): void {
    const sourceCanvas = this.buffer.isSwapped ? this.buffer.A : this.buffer.B;
    const targetCanvas = this.buffer.isSwapped ? this.buffer.B : this.buffer.A;
    const delta: Point = this.getLastFrameDelta();

    const sourceClip: Point = {
      x: Math.max(0, delta.x),
      y: Math.max(0, delta.y)
    };

    const source: Area = {
      ...sourceClip,
      width: sourceCanvas.width - sourceClip.x,
      height: sourceCanvas.height - sourceClip.y
    };

    const dest: Area = {
      ...source,
      x: Math.max(0, -delta.x),
      y: Math.max(0, -delta.y),
    };

    targetCanvas.blit(sourceCanvas.getElement(), source, dest);

    const visibleMapArea = this.getVisibleMapArea();
    const tileMap = this.worldMap.getTileMap();
    const tileSet = this.worldMap.getTileSet();
    const { width: tileWidth, height: tileHeight } = tileSet.getTileSize();

    const shift: Point = {
      x: -(this.offset.x % tileWidth),
      y: -(this.offset.y % tileHeight)
    };

    const tileDelta: Point = {
      x: Math.ceil(delta.x / tileWidth),
      y: Math.ceil(delta.y / tileHeight)
    };

    for (let y = visibleMapArea.y; y < visibleMapArea.y + visibleMapArea.height; y++) {
      for (let x = visibleMapArea.x; x < visibleMapArea.x + visibleMapArea.width; x++) {
        const lastTilePosition: Point = {
          x: x + tileDelta.x,
          y: y + tileDelta.y
        };

        const isTileRendered = (
          lastTilePosition.x > visibleMapArea.x + 1 && lastTilePosition.x < visibleMapArea.x + visibleMapArea.width - 2 &&
          lastTilePosition.y > visibleMapArea.y + 1 && lastTilePosition.y < visibleMapArea.y + visibleMapArea.height - 2
        );

        if (!isTileRendered) {
          const tile = tileMap.getTile({ x, y });

          targetCanvas.blit(
            tileSet.getImageSource(),
            tileSet.getTileArea(tile),
            {
              x: shift.x + x * tileWidth - visibleMapArea.x * tileWidth,
              y: shift.y + y * tileHeight - visibleMapArea.y * tileHeight,
              width: tileWidth,
              height: tileHeight
            }
          );
        }
      }
    }

    this.buffer.isSwapped = !this.buffer.isSwapped;
  }
}