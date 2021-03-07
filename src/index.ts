import GscWorldMap from './worldmaps/GscWorldMap';
import InteractiveMap from './InteractiveMap';

function main(): void {
  const gscWorldMap = new GscWorldMap(0, 500, 500);
  const interactiveMap = new InteractiveMap(gscWorldMap);

  interactiveMap.initialize();
}

main();