'use strict';

var fs        = require('fs');
var path      = require('path');
var chalk     = require('chalk');
var NwBuilder = require('node-webkit-builder');

module.exports = {
  name: 'nw:package',
  description: 'Packages your NW.js app',

  availableOptions: [
    { name: 'environment', type: String, default: 'production', aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }] },
    { name: 'output-path', type: String, default: 'dist/', aliases: ['o'] },
    { name: 'config-file', type: String, default: 'config/nw-package.js', aliases: ['f'] }
  ],

  init: function() {
    process.env.EMBER_CLI_NW = true;
  },

  buildApp: function(options) {
    var buildTask = new this.tasks.Build({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return buildTask.run(options);
  },

  packageApp: function(options) {
    var ui = this.ui;

    ui.writeLine(chalk.green('Packaging...'));

    var config = this.nwConfig(options);
    var nw = new NwBuilder(config);
    nw.on('log', console.log);

    return nw.build().then(function() {
      ui.writeLine(chalk.green('Packaged project successfully.'));
    });
  },

  nwConfig: function(options) {
    var config = {};

    var configFile = path.resolve(this.project.root, options.configFile);
    if (fs.existsSync(configFile)) {
      config = require(configFile);
    }

    if (!config.buildDir) {
      config.buildDir = 'build/app';
    }

    if (!config.cacheDir) {
      config.cacheDir = 'build/cache';
    }

    if (!config.files) {
      config.files = this.nwFiles(options);
    }

    if (!config.platforms) {
      var detectPlatform = require('../helpers/detect-platform');
      var currentPlatform = detectPlatform();
      if (currentPlatform) {
        config.platforms = [currentPlatform];
      }
    }

    return config;
  },

  nwFiles: function(options) {
    var nwFiles = ['package.json'];

    // Contents of the build output directory
    nwFiles.push(options.outputPath.replace(/\/?$/, '/**'));

    // Non-dev NPM modules
    var npmModulesRoot = 'node_modules';
    var npmDependencies = this.project.pkg.dependencies || {};

    Object.keys(npmDependencies).forEach(function(dependency) {
      nwFiles.push(npmModulesRoot + '/' + dependency + '/**');
    });

    return nwFiles;
  },

  run: function(options) {
    var _this = this;

    return this.buildApp(options)
      .then(function() {
        return _this.packageApp(options);
      });
  }
};
