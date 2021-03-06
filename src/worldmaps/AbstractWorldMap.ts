import Canvas from '../canvas';
import { Area, Point } from '../types';

/**
 * @internal
 */
class TileMap {
  private tiles: number[];
  private width: number;

  public constructor(width: number, height: number) {
    this.tiles = new Array(width * height).fill(0);
    this.width = width;
  }

  public get size(): { width: number, height: number } {
    return {
      width: this.width,
      height: this.tiles.length / this.width
    };
  }

  public getTile(point: Point): number {
    const index = point.y * this.width + point.x;

    if (index >= this.tiles.length) {
      return -1;
    }

    return this.tiles[index];
  }

  public getTiles(): ReadonlyArray<number> {
    return this.tiles;
  }

  public setTile(point: Point, tileType: number): void {
    const index = point.y * this.width + point.x;

    if (index >= this.tiles.length) {
      return;
    }

    this.tiles[index] = tileType;
  }
}

export interface Modification<T> {
  position: Point;
  tile: T;
}

export default abstract class AbstractWorldMap<T> {
  protected tileMap: TileMap;
  private modifications: Modification<T>[] = [];

  public constructor(seed: number, width: number, height: number) {
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

  public abstract render(canvas: Canvas, offset: Point, mapArea: Area): void;

  protected abstract buildWorldMap(): void;

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