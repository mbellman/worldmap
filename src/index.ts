import Canvas from './canvas';
import GscWorldMap from './worldmaps/GscWorldMap';
import { Point, Size } from './types';

function main(): void {
  const { innerWidth: width, innerHeight: height } = window;
  const canvas = new Canvas(width, height);

  canvas.attach(document.body);
  canvas.clear('#000');

  const map = new GscWorldMap(0, 500, 500);

  // @todo wait for tileset to load before drawing
  setTimeout(() => {
    map.render(canvas, { x: 0, y: 0 }, { x: 0, y: 0, width: 100, height: 50 });
  });

  const offset: Point = {
    x: 0,
    y: 0
  };

  document.body.addEventListener('mousedown', event => {
    const start: Point = {
      x: event.clientX,
      y: event.clientY
    };

    const initialOffset = { ...offset };

    function handleMouseMove(e: MouseEvent) {
      const delta: Point = {
        x: e.clientX - start.x,
        y: e.clientY - start.y
      };

      offset.x = Math.max(0, initialOffset.x - delta.x);
      offset.y = Math.max(0, initialOffset.y - delta.y);

      canvas.clear('#000');

      map.render(canvas, { x: -(offset.x % 16), y: -(offset.y % 16) }, {
        x: Math.floor(offset.x / 16),
        y: Math.floor(offset.y / 16),
        width: 100,
        height: 50
      });
    }

    function handleMouseUp() {
      document.body.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseup', handleMouseUp);
    }

    document.body.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseup', handleMouseUp);
  });
}

main();