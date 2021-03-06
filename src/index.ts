import Canvas from './canvas';

function main(): void {
  const { innerWidth: width, innerHeight: height } = window;

  const canvas = new Canvas(width, height);

  canvas.attach(document.body);
  canvas.clear('#000');
}

main();