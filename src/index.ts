import Canvas from './canvas';
import GscWorldMap from './worldmaps/GscWorldMap';

function main(): void {
  const { innerWidth: width, innerHeight: height } = window;
  const canvas = new Canvas(width, height);

  canvas.attach(document.body);
  canvas.clear('#000');

  const map = new GscWorldMap();

  // @todo wait for tileset to load before drawing
  setTimeout(() => {
    map.render(canvas, { x: 0, y: 0 }, { x: 0, y: 0, width: 100, height: 100 });
  });
}

main();