import Canvas from './canvas';
import { gsc } from './tilesets';

function main(): void {
  const { innerWidth: width, innerHeight: height } = window;
  const canvas = new Canvas(width, height);

  canvas.attach(document.body);
  canvas.clear('#000');

  // @todo wait for tilesets to load before drawing
  setTimeout(() => {
    canvas.blit(gsc.getImage(), gsc.getTile('grass'), { x: 20, y: 20, width: 16, height: 16 });
  });
}

main();