import AbstractWorldMap from './worldmaps/AbstractWorldMap';
import Canvas from './Canvas';
import { Area, Point } from './types';
import { clamp } from './utilities';

export default class InteractiveMap {
  private canvas: Canvas;
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
  
    document.body.addEventListener('mousedown', event => {
      const start: Point = {
        x: event.clientX,
        y: event.clientY
      };
  
      const initialOffset = { ...this.offset };
  
      const handleMouseMove = (e: MouseEvent) => {
        const delta: Point = {
          x: e.clientX - start.x,
          y: e.clientY - start.y
        };
  
        this.offset.x = Math.max(0, initialOffset.x - delta.x);
        this.offset.y = Math.max(0, initialOffset.y - delta.y);
   
        this.render();
      };
  
      const handleMouseUp = () => {
        document.body.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseup', handleMouseUp);
        document.body.addEventListener('mouseleave', handleMouseUp);
      };
  
      document.body.addEventListener('mousemove', handleMouseMove);
      document.body.addEventListener('mouseup', handleMouseUp);
      document.body.addEventListener('mouseleave', handleMouseUp);
    });
  }

  private getVisibleMapArea(): Area {
    const { width: mapWidth, height: mapHeight } = this.worldMap.getTileMap().getSize();
    const { width: tileWidth, height: tileHeight } = this.worldMap.getTileSet().getTileSize();

    const area: Area = {
      x: Math.floor(this.offset.x / tileWidth),
      y: Math.floor(this.offset.y / tileHeight),
      width: 100,
      height: 50
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