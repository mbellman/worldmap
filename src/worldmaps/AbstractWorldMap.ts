import Canvas from '../Canvas';
import RNG from '../RNG';
import TileMap from '../TileMap';
import TileSet from '../TileSet';
import { Area, Point } from '../types';
import { clamp } from '../utilities';

export interface Modification<T> {
  position: Point;
  tile: T;
}

export default abstract class AbstractWorldMap<T extends number> {
  protected tileMap: TileMap;
  protected tileSet: TileSet<T>;
  private modifications: Modification<T>[] = [];
  private rng: RNG;

  public constructor(seed: number, width: number, height: number) {
    this.rng = new RNG(seed.toString());
    this.tileMap = new TileMap(width, height);

    this.buildWorldMap();
  }

  public addModification(modification: Modification<T>): void {
    const index = this.getModificationIndexByPosition(modification.position);

    if (index !== -1) {
      this.replaceModificationByIndex(index, modification);
    } else {
      this.modifications.push(modification);
    }
  }

  public getModifications(): Modification<T>[] {
    return this.modifications;
  }

  public render(canvas: Canvas, offset: Point, mapArea: Area): void {
    const { width: tileWidth, height: tileHeight } = this.tileSet.getTileSize();
    const { width: mapWidth, height: mapHeight } = this.tileMap.size;

    mapArea.x = clamp(mapArea.x, 0, mapWidth);
    mapArea.y = clamp(mapArea.y, 0, mapHeight);
    mapArea.width = clamp(mapArea.width, 0, mapWidth - mapArea.x);
    mapArea.height = clamp(mapArea.height, 0, mapHeight - mapArea.y);

    for (let y = mapArea.y; y < mapArea.y + mapArea.height; y++) {
      for (let x = mapArea.x; x < mapArea.x + mapArea.width; x++) {
        const tile = this.tileMap.getTile({ x, y }) as T;

        canvas.blit(
          this.tileSet.getImage(),
          this.tileSet.getTileArea(tile),
          {
            x: offset.x + x * tileWidth - mapArea.x * tileWidth,
            y: offset.y + y * tileHeight - mapArea.y * tileHeight,
            width: tileWidth,
            height: tileHeight
          }
        );
      }
    }
  }

  protected abstract buildWorldMap(): void;

  protected random(low: number, high: number): number {
    return low + Math.floor(this.rng.random() * (high - low + 1));
  }

  private getModificationIndexByPosition(position: Point): number {
    return this.modifications.findIndex(modification => (
      position.x === modification.position.x &&
      position.y === modification.position.y
    ));
  }

  private replaceModificationByIndex(index: number, modification: Modification<T>): void {
    this.modifications = [
      ...this.modifications.slice(0, index),
      modification,
      ...this.modifications.slice(index + 1)
    ]
  }
}