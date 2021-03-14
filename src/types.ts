export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Area extends Point, Size {}

export interface Duration {
  start: number;
  end: number;
}

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}