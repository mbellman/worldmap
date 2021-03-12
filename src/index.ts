import GscWorldMap from './worldmaps/GscWorldMap';
import InteractiveMap from './InteractiveMap';
import AudioFile from './AudioFile';

function main(): void {
  const gscWorldMap = new GscWorldMap(Date.now(), 1000, 1000);
  const interactiveMap = new InteractiveMap(gscWorldMap);

  interactiveMap.initialize();

  // const audio = new AudioFile('./assets/route-30.mp3');

  // audio.play();
  // audio.setLoop({ start: 5.6722, end: 34.335 });
}

main();