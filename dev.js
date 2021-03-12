const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/assets/*', (req, res) => {
  const [ _, filename ] = req.originalUrl.split('/assets/');

  res.sendFile(path.join(__dirname, `./assets/${filename}`));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './build/index.html'));
});

app.get('/*', (req, res) => {
  if (!req.originalUrl.includes('favicon.ico')) {
    res.sendFile(path.join(__dirname, `./build/${req.originalUrl}`));
  }
});

app.listen(1234, () => console.log('http://localhost:1234'));

const tsc = exec('tsc --watch --preserveWatchOutput');

tsc.stdout.on('data', console.log);