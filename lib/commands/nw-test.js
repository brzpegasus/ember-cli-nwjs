'use strict';
var chalk = require('chalk');
var RSVP = require('rsvp');
var path = require('path');
var denodeify = RSVP.denodeify;
var fs = require('fs');
var readFile = denodeify(fs.readFile);
var writeFile = denodeify(fs.writeFile);
module.exports = {
  name: 'nw:test',
  description: 'Runs your test suite in NW.js',
  availableOptions: [{
    name: 'environment',
    type: String,
    default: 'test',
    aliases: ['e', {
      'dev': 'development'
    }, {
      'prod': 'production'
    }]
  }, {
    name: 'output-path',
    type: String,
    default: 'dist/',
    aliases: ['o']
  }],
  run: function (options) {
    var _this = this;
    var ui = this.ui;
    ui.startProgress(chalk.green('Building'), chalk.green('.'));
    var buildTask = new this.tasks.Build({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
      environment: options.environment
    });
    var testHtmlPath = path.resolve(_this.project.root, 'dist/tests/index.html');
    return buildTask.run(options).then(function () {
        return readFile(testHtmlPath, {
          encoding: 'utf8'
        });
      })
      .then(function (rawHTML) {
        rawHTML = rawHTML.replace('base href=\"/\"', 'base href="../"');
        return writeFile(testHtmlPath, rawHTML);
      })
      .then(function () {
        // copy test package.json for nwjs
        var stream = fs.createReadStream(path.resolve(_this.project.root, 'tests/package.json'));
        stream.pipe(fs.createWriteStream(path.resolve(options.outputPath, 'tests/package.json')));
        var testTask = new _this.tasks.Test({
          project: _this.project
        });
        return testTask.run({
          configFile: path.resolve(_this.project.root, 'tests/testem-nw.json')
        });
      });
  }
};
