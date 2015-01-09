/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');

function inlineScript(filename) {
  var src = path.join(__dirname, 'resources', filename);
  return '<script>' + fs.readFileSync(src) + '</script>';
}

module.exports = {
  name: 'ember-cli-node-webkit',

  contentFor: function(type, config) {
    if (type === 'body') {
      return inlineScript('shim-body.js');
    }

    if (type === 'body-footer') {
      return inlineScript('shim-body-footer.js');
    }
  }
};
