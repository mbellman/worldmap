import Canvas from '../canvas';
import TileMap from '../tilemap';
import TileSet from '../tileset';
import { Area, Point } from '../types';

export interface Modification<T> {
  position: Point;
  tile: T;
}

export default abstract class AbstractWorldMap<T extends number> {
  protected tileMap: TileMap;
  protected tileSet: TileSet<T>;
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

  public render(canvas: Canvas, offset: Point, mapArea: Area): void {
    const { width: tileWidth, height: tileHeight } = this.tileSet.getTileSize();

    for (let y = 0; y < mapArea.height; y++) {
      for (let x = 0; x < mapArea.width; x++) {
        const tile = this.tileMap.getTile({ x, y }) as T;

        canvas.blit(
          this.tileSet.getImage(),
          this.tileSet.getTileArea(tile),
          {
            x: offset.x + x * tileWidth,
            y: offset.y + y * tileHeight,
            width: tileWidth,
            height: tileHeight
          }
        );
      }
    }
  }

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