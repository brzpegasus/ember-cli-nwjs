'use strict';

module.exports = {
  name: 'ember-node-webkit',

  included: function(app) {
    this._super.included(app);

    app.import('vendor/node-webkit/shim.js', { prepend: true });
    app.import({ development: 'vendor/node-webkit/reload.js' });
  },

  includedCommands: function() {
    return {
      'nw': require('./lib/commands/nw'),
      'nw:package': require('./lib/commands/nw-package'),
      'nw:test' : require('./lib/commands/nw-test')
    }
  },
  
  postprocessTree: function(type, tree) {
    var funnel = require('broccoli-funnel');
    var mergeTrees = require('broccoli-merge-trees');
    var replace = require('broccoli-string-replace');
  
    if (type === 'all' && process.env.EMBER_ENV === 'test') {
      // Update the base URL in `tests/index.html`
      var index = replace(tree, {
        files: ['tests/index.html'],
        pattern: {
          match: /base href="\/"/,
          replacement: 'base href="../"'
        }
      });
  
      // Copy `tests/package.json` to the output directory
      var testPkg = funnel('tests', {
        files: ['package.json'],
        destDir: '/tests'
      });
  
      return mergeTrees([tree, index, testPkg], { overwrite: true });
    }
  
    return tree;
  },

  contentFor: function(type) {
    // TODO Make testem server URL configurable
    var testemServer = 'http://localhost:7357';
    if (type === 'test-body' && process.env.EMBER_ENV === 'test') {
      return '<script src="' + testemServer + '/socket.io/socket.io.js"></script>';
    }
  }
};
