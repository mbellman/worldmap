import AbstractWorldMap from './worldmaps/AbstractWorldMap';
import Canvas from './Canvas';
import { Area, Point } from './types';
import { clamp } from './utilities';

export default class InteractiveMap {
  private canvas: Canvas;
  private dragMomentum: Point = { x: 0, y: 0 };
  private offset: Point = { x: 0, y: 0 };
  private worldMap: AbstractWorldMap<number>;

  public constructor(worldMap: AbstractWorldMap<any>) {
    this.worldMap = worldMap;
    this.canvas = new Canvas(window.innerWidth, window.innerHeight);

    this.canvas.attach(document.body);
    this.canvas.clear('#000');
  }

  public initialize(): void {
    setTimeout(() => this.render(), 50);

    window.addEventListener('resize', () => {
      this.canvas.setSize(window.innerWidth, window.innerHeight);
      this.render();
    });
  
    document.body.addEventListener('mousedown', event => {
      const mouseStart: Point = {
        x: event.clientX,
        y: event.clientY
      };
  
      const initialOffset = { ...this.offset };
      const previousOffset = { ...this.offset };

      this.dragMomentum = { x: 0, y: 0 };
  
      const onMouseMove = (e: MouseEvent) => {
        const mouseDelta: Point = {
          x: e.clientX - mouseStart.x,
          y: e.clientY - mouseStart.y
        };

        previousOffset.x = this.offset.x;
        previousOffset.y = this.offset.y;
  
        this.offset.x = Math.max(0, initialOffset.x - mouseDelta.x);
        this.offset.y = Math.max(0, initialOffset.y - mouseDelta.y);
   
        this.render();
      };
  
      const onMouseUp = () => {
        document.body.removeEventListener('mousemove', onMouseMove);
        document.body.removeEventListener('mouseup', onMouseUp);
        document.body.removeEventListener('mouseleave', onMouseUp);

        this.dragMomentum.x = this.offset.x - previousOffset.x;
        this.dragMomentum.y = this.offset.y - previousOffset.y;

        this.decayDragMomentum();
      };
  
      document.body.addEventListener('mousemove', onMouseMove);
      document.body.addEventListener('mouseup', onMouseUp);
      document.body.addEventListener('mouseleave', onMouseUp);
    });
  }

  private decayDragMomentum(): void {
    this.offset.x = Math.max(0, Math.round(this.offset.x + this.dragMomentum.x));
    this.offset.y = Math.max(0, Math.round(this.offset.y + this.dragMomentum.y));

    this.render();

    this.dragMomentum.x *= 0.9;
    this.dragMomentum.y *= 0.9;

    if (Math.abs(this.dragMomentum.x) < 0.1 && Math.abs(this.dragMomentum.y) < 0.1) {
      this.dragMomentum = { x: 0, y: 0 };

      return;
    }

    requestAnimationFrame(() => this.decayDragMomentum());
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
    const tileMap = this.worldMap.getTileMap();
    const tileSet = this.worldMap.getTileSet();
    const { width: tileWidth, height: tileHeight } = tileSet.getTileSize();    
    const mapArea = this.getVisibleMapArea();

    const shift: Point = {
      x: -(this.offset.x % tileWidth),
      y: -(this.offset.y % tileHeight)
    };

    this.canvas.clear('#000');

    for (let y = mapArea.y; y < mapArea.y + mapArea.height; y++) {
      for (let x = mapArea.x; x < mapArea.x + mapArea.width; x++) {
        const tile = tileMap.getTile({ x, y });

        this.canvas.blit(
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
  }
}