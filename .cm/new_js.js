var app = require('app');
var BrowserWindow = require('browser-window');
var glob = require('glob');

var mainWindow = null;

// Require and setup each JS file in the main-process dir
glob('main-process/**/*.js', function (error, files) {
  if (error) return console.log(error);
  files.forEach(function (file) {
    require('./' + file).setup();
  });
});

function lala () {
  const length = 10;
const pets = new Array(length);
pets[pets.length] = "cat";
  const array1 = [1, 2, 3, 4];
  const sum = array1.reduce(function (a, b) {
    return a + b;
  });

  const dogs = ["Rex", "Lassie"]
  for (let i = 0; i < dogs.length; i++) {
    console.log(dogs[i]);
  }
}

function SayHello() {
  console.log("Hello!");
}

function doIt() {
  console.log("Hello!");
}

function createWindow () {
  mainWindow = new BrowserWindow({ width: 920, height: 900 });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});