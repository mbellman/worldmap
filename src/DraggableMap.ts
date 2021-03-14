import AbstractWorldMap from './worldmaps/AbstractWorldMap';
import Canvas from './Canvas';
import StreamableMap from './StreamableMap';
import { Area, Point, Size } from './types';
import { clamp } from './utilities';

export default class InteractiveMap {
  private canvas: Canvas;
  private dragMomentum: Point = { x: 0, y: 0 };
  private offset: Point = { x: 0, y: 0 };
  private previousOffset: Point = { x: 0, y: 0 };
  private streamableMap: StreamableMap;
  private worldMap: AbstractWorldMap<number>;

  public constructor(worldMap: AbstractWorldMap<any>) {
    this.worldMap = worldMap;
    this.canvas = new Canvas(window.innerWidth, window.innerHeight);

    this.canvas.attach(document.body);
    this.canvas.clear('#000');

    this.streamableMap = new StreamableMap(worldMap);
  }

  public initialize(): void {
    this.worldMap.getTileSet().onload(() => {
      this.streamableMap.renderInitialView(this.offset);
      this.streamableMap.renderToCanvas(this.canvas);
    });

    window.addEventListener('resize', () => {
      this.canvas.setSize(window.innerWidth, window.innerHeight);

      this.streamableMap.renderInitialView(this.offset);
      this.streamableMap.renderToCanvas(this.canvas);
    });

    // @todo clean this up, this is ridiculous. normalize mouse/touch
    // events properly and contain this somewhere
    const events = 'ontouchstart' in window
      ? {
        mousedown: 'touchstart',
        mousemove: 'touchmove',
        mouseup: 'touchend'
      } : {
        mousedown: 'mousedown',
        mousemove: 'mousemove',
        mouseup: 'mouseup'
      };
  
    document.body.addEventListener(events.mousedown, (event: MouseEvent & TouchEvent) => {
      const mouseStart: Point = {
        x: event.clientX || event.changedTouches[event.changedTouches.length - 1].clientX,
        y: event.clientY || event.changedTouches[event.changedTouches.length - 1].clientY
      };
  
      const initialOffset = { ...this.offset };

      this.previousOffset = { ...this.offset };
      this.dragMomentum = { x: 0, y: 0 };
  
      const onMouseMove = (e: MouseEvent & TouchEvent) => {
        const mouseDelta: Point = {
          x: (e.clientX || e.changedTouches[event.changedTouches.length - 1].clientX) - mouseStart.x,
          y: (e.clientY || e.changedTouches[event.changedTouches.length - 1].clientY) - mouseStart.y
        };

        this.previousOffset.x = this.offset.x;
        this.previousOffset.y = this.offset.y;

        const bounds = this.getOffsetBounds();
  
        this.offset.x = clamp(initialOffset.x - mouseDelta.x, 0, bounds.width);
        this.offset.y = clamp(initialOffset.y - mouseDelta.y, 0, bounds.height);
   
        this.render();
      };
  
      const onMouseUp = () => {
        document.body.removeEventListener(events.mousemove, onMouseMove);
        document.body.removeEventListener(events.mouseup, onMouseUp);
        document.body.removeEventListener('mouseleave', onMouseUp);

        this.dragMomentum = this.getLastFrameDelta();

        this.decayDragMomentum();
      };
  
      document.body.addEventListener(events.mousemove, onMouseMove);
      document.body.addEventListener(events.mouseup, onMouseUp);
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

    this.dragMomentum.x *= 'ontouchstart' in window ? 0.95 : 0.9;
    this.dragMomentum.y *= 'ontouchstart' in window ? 0.95 : 0.9;

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

  private render(): void {
    this.streamableMap.renderNextView(this.offset);
    this.streamableMap.renderToCanvas(this.canvas);
  }
}