import { Point, Size } from './types';

export default class TileMap {
  private tiles: number[];
  private width: number;

  public constructor(width: number, height: number) {
    this.tiles = new Array(width * height).fill(0);
    this.width = width;
  }

  public get size(): Size {
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

  public setTile(point: Point, tileType: number): void {
    const index = point.y * this.width + point.x;

    if (index >= this.tiles.length) {
      return;
    }

    this.tiles[index] = tileType;
  }
}