import AbstractWorldMap from './worldmaps/AbstractWorldMap';
import Canvas from './Canvas';
import { Point } from './types';

export default class InteractiveMap {
  private canvas: Canvas;
  private worldMap: AbstractWorldMap<any>;

  public constructor(worldMap: AbstractWorldMap<any>) {
    this.worldMap = worldMap;
    this.canvas = new Canvas(window.innerWidth, window.innerHeight);

    this.canvas.attach(document.body);
    this.canvas.clear('#000');
  }

  public initialize(): void {
    const offset: Point = {
      x: 0,
      y: 0
    };

    setTimeout(() => {
      this.worldMap.render(this.canvas, { x: 0, y: 0 }, { x: 0, y: 0, width: 100, height: 50 });
    }, 50);
  
    document.body.addEventListener('mousedown', event => {
      const start: Point = {
        x: event.clientX,
        y: event.clientY
      };
  
      const initialOffset = { ...offset };
  
      const handleMouseMove = (e: MouseEvent) => {
        const delta: Point = {
          x: e.clientX - start.x,
          y: e.clientY - start.y
        };
  
        offset.x = Math.max(0, initialOffset.x - delta.x);
        offset.y = Math.max(0, initialOffset.y - delta.y);
  
        this.canvas.clear('#000');
  
        this.worldMap.render(this.canvas, { x: -(offset.x % 16), y: -(offset.y % 16) }, {
          x: Math.floor(offset.x / 16),
          y: Math.floor(offset.y / 16),
          width: 100,
          height: 50
        });
      };
  
      const handleMouseUp = () => {
        document.body.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseup', handleMouseUp);
      };
  
      document.body.addEventListener('mousemove', handleMouseMove);
      document.body.addEventListener('mouseup', handleMouseUp);
      document.body.addEventListener('mouseleave', handleMouseUp);
    });
  }
}