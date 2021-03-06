import Canvas from './canvas';
import GscWorldMap from './worldmaps/GscWorldMap';

function main(): void {
  const { innerWidth: width, innerHeight: height } = window;
  const canvas = new Canvas(width, height);

  canvas.attach(document.body);
  canvas.clear('#000');

  const map = new GscWorldMap(0, 100, 100);

  // @todo wait for tileset to load before drawing
  setTimeout(() => {
    map.render(canvas, { x: 20, y: 20 }, { x: 0, y: 0, width: 50, height: 30 });
  });
}

main();