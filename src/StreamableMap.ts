import AbstractWorldMap from './worldmaps/AbstractWorldMap';
import Canvas from './Canvas';
import { Area, Point } from './types';
import { clamp } from './utilities';

export default class StreamableMap {
  private canvasA: Canvas = new Canvas(0, 0);
  private canvasB: Canvas = new Canvas(0, 0);
  private isSwapped: boolean = false;
  private offset: Point = { x: 0, y: 0 };
  private worldMap: AbstractWorldMap;

  public constructor(worldMap: AbstractWorldMap) {
    this.worldMap = worldMap;

    this.resetCanvases();

    window.addEventListener('resize', this.resetCanvases);
  }

  public renderInitialView(offset: Point): void {
    this.offset = { ...offset };

    const tileMap = this.worldMap.getTileMap();
    const tileSet = this.worldMap.getTileSet();
    const { width: tileWidth, height: tileHeight } = tileSet.getTileSize();    
    const mapArea = this.getVisibleMapArea();

    const shift: Point = {
      x: -(this.offset.x % tileWidth),
      y: -(this.offset.y % tileHeight)
    };

    this.sourceCanvas.clear('#000');

    for (let y = mapArea.y; y < mapArea.y + mapArea.height; y++) {
      for (let x = mapArea.x; x < mapArea.x + mapArea.width; x++) {
        const tile = tileMap.getTile({ x, y });

        this.sourceCanvas.blit(
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

    this.targetCanvas.blit(
      this.sourceCanvas.getElement(),
      { x: 0, y: 0, width: this.sourceCanvas.width, height: this.sourceCanvas.height },
      { x: 0, y: 0, width: this.targetCanvas.width, height: this.targetCanvas.height }
    );
  }

  public renderNextView(offset: Point): void {
    const delta: Point = {
      x: offset.x - this.offset.x,
      y: offset.y - this.offset.y
    };

    this.offset = { ...offset };

    const sourceClip: Point = {
      x: Math.max(0, delta.x),
      y: Math.max(0, delta.y)
    };

    const source: Area = {
      ...sourceClip,
      width: this.sourceCanvas.width - sourceClip.x,
      height: this.sourceCanvas.height - sourceClip.y
    };

    const dest: Area = {
      ...source,
      x: Math.max(0, -delta.x),
      y: Math.max(0, -delta.y),
    };

    this.targetCanvas.blit(this.sourceCanvas.getElement(), source, dest);

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

          this.targetCanvas.blit(
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

    this.isSwapped = !this.isSwapped;
  }

  public renderToCanvas(canvas: Canvas): void {
    canvas.blit(
      this.sourceCanvas.getElement(),
      { x: 0, y: 0, width: this.sourceCanvas.width, height: this.sourceCanvas.height },
      { x: 0, y: 0, width: canvas.width, height: canvas.height }
    );
  }

  private get sourceCanvas(): Canvas {
    return this.isSwapped ? this.canvasA : this.canvasB;
  }

  private get targetCanvas(): Canvas {
    return this.isSwapped ? this.canvasB : this.canvasA;
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

  private resetCanvases = () => {
    this.canvasA.setSize(window.innerWidth, window.innerHeight);
    this.canvasB.setSize(window.innerWidth, window.innerHeight);
  };
}