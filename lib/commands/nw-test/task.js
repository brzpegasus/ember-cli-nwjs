'use strict';

var path = require('path');
var findNW = require('../../helpers/find-nw');

function safePath(filePath) {
  // Guard against file paths that contain spaces
  return '"' + filePath + '"';
}

module.exports = {
  testemOptions: function(options) {
    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
    return {
      host: options.host,
      port: options.port,
      cwd: options.outputPath,
      reporter: options.reporter,
      middleware: this.addonMiddlewares(),
      launch_in_dev: ['NW.js'],
      launch_in_ci: ['NW.js (CI)'],
      launchers: {
        'NW.js': {
          command: this.nwCommand(options),
          protocol: 'browser'
        },
        'NW.js (CI)': {
          command: this.nwCommandForCI(options),
          protocol: 'tap'
        }
      }
    };
    /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
  },

  nwCommand: function(options) {
    var nwPath = safePath(findNW(this.project));
    var testPath = safePath(path.join(options.outputPath, 'tests'));

    return nwPath + ' ' + testPath;
  },

  nwCommandForCI: function(options) {
    var command = 'node';
    var commandArgs = safePath(path.join(__dirname, './runner.js'));
    var commandFlags = [
      '--nw-path=' + safePath(findNW(this.project)),
      '--tests-path=' + safePath(path.join(options.outputPath, 'tests'))
    ];

    return [command, commandArgs].concat(commandFlags).join(' ');
  }
};
