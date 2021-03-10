import RNG from '../RNG';
import TileMap from '../TileMap';
import TileSet from '../TileSet';
import { Point } from '../types';

export interface Modification<T> {
  position: Point;
  tile: T;
}

export default abstract class AbstractWorldMap<T extends number = number> {
  protected rng: RNG;
  protected tileMap: TileMap;
  protected tileSet: TileSet<T>;
  private modifications: Modification<T>[] = [];

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

  public getTileMap(): TileMap {
    return this.tileMap;
  }

  public getTileSet(): TileSet<T> {
    return this.tileSet;
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