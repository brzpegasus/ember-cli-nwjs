'use strict';

var fs = require('fs');
var path = require('path');

function injectScript(scriptName) {
  var filePath = path.join(__dirname, 'lib', 'resources', scriptName);
  return '<script>\n' + fs.readFileSync(filePath, { encoding: 'utf8' }) + '\n</script>';
}

module.exports = {
  name: 'ember-node-webkit',

  included: function(app) {
    this._super.included(app);

    if (!process.env.EMBER_CLI_NW) { return; }

    app.import({ development: 'vendor/node-webkit/reload.js' });
    if (process.env.NW_TESTS_DEV) {
      app.import({ test: 'vendor/node-webkit/browser-qunit-adapter.js' });
    } else {
      app.import({ test: 'vendor/node-webkit/tap-qunit-adapter.js' });
    }
  },

  includedCommands: function() {
    return {
      'nw': require('./lib/commands/nw'),
      'nw:package': require('./lib/commands/nw-package'),
      'nw:test': require('./lib/commands/nw-test')
    }
  },

  treeForVendor: function() {
    return path.join(__dirname, 'client');
  },

  postprocessTree: function(type, tree) {
    if (!process.env.EMBER_CLI_NW) {
      return tree;
    }

    if (type === 'all' && process.env.EMBER_ENV === 'test') {
      var funnel = require('broccoli-funnel');
      var mergeTrees = require('broccoli-merge-trees');
      var replace = require('broccoli-string-replace');

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

      var testPageOptions = process.env.NW_TEST_PAGE_OPTIONS;

      if (testPageOptions) {
        testPkg = replace(testPkg, {
          files: ['tests/package.json'],
          patterns: [{
            match: /"main":\s*"(index.html\?[^\"]+)"/,
            replacement: '"main": "$1&' + testPageOptions + '"'
          }, {
            match: /"main":\s*"index.html"/,
            replacement: '"main": "index.html?' + testPageOptions + '"'
          }]
        });
      }

      return mergeTrees([tree, index, testPkg], { overwrite: true });
    }

    return tree;
  },

  contentFor: function(type) {
    if (!process.env.EMBER_CLI_NW) { return; }

    if (type === 'head') {
      return injectScript('shim-head.js');
    }

    if (type === 'body-footer') {
      return injectScript('shim-footer.js');
    }

    if (type === 'test-body' && process.env.EMBER_ENV === 'test') {
      var testemServer = process.env.NW_TESTEM_SERVER_URL;
      if (testemServer) {
        return '<script src="' + testemServer + '/socket.io/socket.io.js"></script>';
      }
    }
  }
};
