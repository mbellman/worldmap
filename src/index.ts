import GscWorldMap from './worldmaps/GscWorldMap';
import InteractiveMap from './InteractiveMap';

function main(): void {
  const gscWorldMap = new GscWorldMap(0, 1000, 1000);
  const interactiveMap = new InteractiveMap(gscWorldMap);

  interactiveMap.initialize();
}

main();