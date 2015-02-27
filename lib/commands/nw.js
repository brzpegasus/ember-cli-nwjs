'use strict';

var path    = require('path');
var spawn   = require('child_process').spawn;
var chalk   = require('chalk');
var RSVP    = require('rsvp');

var Promise = RSVP.Promise;

module.exports = {
  name: 'nw',
  description: 'Builds your app and launches NW.js',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }] },
    { name: 'output-path', type: path, default: 'dist/', aliases: ['o'] }
  ],

  buildWatch: function(options) {
    var ui = this.ui;
    var Watcher = require('ember-cli/lib/models/watcher');
    var Builder = require('ember-cli/lib/models/builder');

    ui.startProgress(chalk.green('Building'), chalk.green('.'));

    var watcher = new Watcher({
      ui: ui,
      builder: new Builder({
        ui: ui,
        project: this.project,
        environment: options.environment,
        outputPath: options.outputPath
      }),
      analytics: this.analytics,
      options: options
    });

    return watcher;
  },

  nwStart: function() {
    var ui = this.ui;
    var outputStream = ui.outputStream;

    return new Promise(function(resolve, reject) {
      ui.writeLine(chalk.green('Starting nw.js...'));

      var nwCommand = process.env.NW_PATH;
      if (!nwCommand) {
        if (process.platform === 'darwin') {
          nwCommand = '/Applications/node-webkit.app/Contents/MacOS/node-webkit';
        } else {
          nwCommand = 'nw';
        }
      }

      var child = spawn(nwCommand, ['.']);
      child.stdout.pipe(outputStream, { end: false });
      child.stderr.pipe(outputStream, { end: false });

      child.on('error', function(error) {
        ui.writeLine(chalk.red('Error running nw.js.'));
        reject(error);
      });

      child.on('exit', function() {
        ui.writeLine(chalk.green('nw.js exited.'));
        resolve();
      });
    });
  },

  run: function(options) {
    var _this = this;

    var done = function() {
      return RSVP.all([
        // Start nw.js
        _this.nwStart(),
        // Keep watching until failure or signal to exit
        new Promise(function() {})
      ]);
    };

    return this.buildWatch(options).then(done);
  }
};
