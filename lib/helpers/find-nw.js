'use strict';

var fs   = require('fs');
var path = require('path');
var os   = require('os');

function getLocalNW(nwLocalPath) {
  var nw;
  var platform = os.platform();

  if (platform === 'darwin') {
    if (fs.existsSync(path.join(nwLocalPath, 'Contents'))) {
      nw = path.join(nwLocalPath, 'Contents', 'MacOS', 'nwjs');
    } else {
      nw = path.join(nwLocalPath, 'nwjs.app', 'Contents', 'MacOS', 'nwjs');
    }
  } else if (platform === 'win32') {
    nw = path.join(nwLocalPath, 'nw.exe');
  } else {
    nw = path.join(nwLocalPath, 'nw');
  }

  return nw;
}

module.exports = function(project) {
  var nw;

  var nwLocalPath = path.resolve(project.root, 'node_modules/nw/nwjs');
  if (fs.existsSync(nwLocalPath)) {
    nw = getLocalNW(nwLocalPath);
  } else if (process.env.NW_PATH) {
    nw = process.env.NW_PATH;
  } else {
    nw = 'nw';
  }

  return nw;
};
