import GscWorldMap from './worldmaps/GscWorldMap';
import GscGameScene from './gamescenes/GscGameScene';
import DraggableMap from './DraggableMap';
import AudioFile from './AudioFile';

function main(): void {
  const gscWorldMap = new GscWorldMap(Date.now(), 1000, 1000);
  const gameScene = new GscGameScene(gscWorldMap);

  gameScene.initialize();

  // const audio = new AudioFile('./assets/route-30.mp3');

  // audio.play();
  // audio.setLoop({ start: 5.6722, end: 34.335 });
}

main();