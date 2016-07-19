'use strict';

var spawn = require('child_process').spawn;
var chalk = require('chalk');
var RSVP  = require('rsvp');

var Promise = RSVP.Promise;

module.exports = {
  name: 'nw',
  description: 'Builds your app and launches NW.js',

  init: function() {
    this._super.init && this._super.init.apply(this, arguments);
    process.env.EMBER_CLI_NW = true;
  },

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }] },
    { name: 'output-path', type: String, default: 'dist/', aliases: ['o'] }
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

  runNW: function() {
    var ui = this.ui;
    var project = this.project;

    return new Promise(function(resolve, reject) {
      ui.writeLine(chalk.green('Starting nw.js...'));

      var findNW = require('../helpers/find-nw');
      var nwCommand = findNW(project);

      var child = spawn(nwCommand, ['.'], { cwd: project.root, stdio: 'inherit' });

      child.on('error', function(error) {
        if (error.code === 'ENOENT') {
          ui.writeLine('');
          ui.writeLine(chalk.red("Error running the following command: " + nwCommand));
          ui.writeLine('');
          ui.writeLine(chalk.yellow("Either re-run the blueprint with 'ember g ember-cli-nwjs' to add NW.js as an NPM dependency in your project,"));
          ui.writeLine(chalk.yellow("or set an environment variable named 'NW_PATH' pointing to your NW.js binary."));
          reject();
        } else {
          ui.writeLine(chalk.red('Error running nw.js.'));
          reject(error);
        }
      });

      child.on('exit', function() {
        ui.writeLine(chalk.green('nw.js exited.'));
        resolve();
      });
    });
  },

  run: function(options) {
    var _this = this;

    return this.buildWatch(options)
      .then(function() {
        return _this.runNW();
      });
  }
};
