import AbstractWorldMap from '../worldmaps/AbstractWorldMap';
import Canvas from '../Canvas';
import StreamableMap from '../StreamableMap';

export default abstract class AbstractGameScene {
  protected canvas: Canvas;
  protected streamableMap: StreamableMap;
  protected worldMap: AbstractWorldMap;

  public constructor(worldMap: AbstractWorldMap) {
    this.worldMap = worldMap;

    this.canvas = new Canvas(window.innerWidth, window.innerHeight);
    this.streamableMap = new StreamableMap(worldMap);

    this.canvas.attach(document.body);

    window.addEventListener('resize', () => {
      this.canvas.setSize(window.innerWidth, window.innerHeight);
    });
  }

  public abstract initialize(): void;
}