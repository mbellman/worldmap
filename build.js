const fs = require('fs-extra');
const minify = require('minify');

function minifyFile(filename) {
  if (fs.existsSync(filename)) {
    minify(filename).then(code => fs.writeFileSync(filename, code));
  }
}

if (!fs.existsSync('build')) {
  fs.mkdirSync('build');
}

fs.copySync('./index.html', './build/index.html');
fs.copySync('./node_modules/almond/almond.js', './build/almond.js');
fs.copySync('./assets', './build/assets');

minifyFile('./build/worldmap.js');
minifyFile('./build/almond.js');
