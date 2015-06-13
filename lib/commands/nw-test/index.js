'use strict';

var fs = require('fs');
var path = require('path');
var RSVP = require('rsvp');
var denodeify = RSVP.denodeify;
var readFile = denodeify(fs.readFile);
var writeFile = denodeify(fs.writeFile);
var Builder = require('ember-cli/lib/models/builder');

function safePath(filePath) {
  // Guard against file paths that contain spaces
  return '"' + filePath + '"';
}

module.exports = {
  name: 'nw:test',
  description: 'Runs your test suite in NW.js',

  availableOptions: [
    { name: 'config-file', type: String, aliases: ['c', 'cf'] },
    { name: 'server', type: Boolean, default: false },
    { name: 'environment', type: String, default: 'test', aliases: ['e'] }
  ],

  init: function() {
    this.quickTemp = require('quick-temp');
  },

  tmp: function() {
    return this.quickTemp.makeOrRemake(this, '-testsDistNW');
  },

  rmTmp: function() {
    this.quickTemp.remove(this, '-testsDistNW');
  },

  prepareTestFiles: function(options) {
    var root = this.project.root;
    var outputPath = options.outputPath;

    var testHtmlPath = path.join(outputPath, 'tests', 'index.html');

    return readFile(testHtmlPath, { encoding: 'utf8' })
      .then(function(html) {
        var content = html.replace(/base href="\/"/, 'base href="../"');
        return writeFile(testHtmlPath, content);
      })
      .then(function() {
        var stream = fs.createReadStream(path.join(root, 'tests', 'package.json'));
        stream.pipe(fs.createWriteStream(path.join(outputPath, 'tests', 'package.json')));
      });
  },

  taskOptions: function() {
    return {
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    };
  },

  testCommand: function(options) {
    var findNW = require('../../helpers/find-nw');

    var command = 'node';
    var commandArgs = safePath(path.join(__dirname, 'runner.js'));
    var commandFlags = [
      '--nw-path=' + safePath(findNW(this.project)),
      '--tests-path=' + safePath(path.join(options.outputPath, 'tests'))
    ];

    return [command, commandArgs].concat(commandFlags).join(' ');
  },

  runTests: function(options) {
    var testCommand = this.testCommand(options);
    var BaseTestTask = this.tasks.Test;

    var TestTask = BaseTestTask.extend({
      testemOptions: function() {
        /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        return {
          cwd: options.outputPath,
          middleware: this.addonMiddlewares(),
          launch_in_ci: ['NW.js'],
          launchers: {
            'NW.js': {
              command: testCommand,
              protocol: 'tap'
            }
          },
          reporter: require('./reporter')
        };
      }
    });

    var testTask = new TestTask(this.taskOptions());

    return testTask.run({
      outputPath: options.outputPath
    });
  },

  runTestsServer: function(options) {
    var _this = this;
    var BaseTestTask = this.tasks.TestServer;

    process.env.NW_TESTS_DEV = true;
    process.env.NW_TESTEM_SERVER_URL = 'http://localhost:7357';

    var TestTask = BaseTestTask.extend({
      testemOptions: function() {
        var findNW = require('../../helpers/find-nw');
        var nwPath = safePath(findNW(_this.project));
        var testPath = safePath(path.join(options.outputPath, 'tests'));
        var testCommand = nwPath + ' ' + testPath;
        /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        return {
          cwd: options.outputPath,
          middleware: this.addonMiddlewares(),
          reporter: require('./reporter'),
          hide_stderr: false,
          hide_stdout: false,
          launch_in_dev: ['NW.js'],
          launchers: {
            'NW.js': {
              command: testCommand,
              protocol: 'browser'
            }
          }
        };
      }
    });

    var testTask = new TestTask(this.taskOptions());
    var ui = this.ui;
    var Watcher = require('ember-cli/lib/models/watcher');

    var builder = new Builder({
        ui: ui,
        project: this.project,
        environment: options.environment,
        outputPath: options.outputPath
      });

    return builder.build()
    .then(function() {
      var watcher = new Watcher({
        ui: ui,
        builder: builder,
        analytics: _this.analytics,
        options: options
      });
      return testTask.run({
        outputPath: options.outputPath,
        watcher: watcher
      });
    });
  },

  run: function(options) {
    var _this = this;
    options.outputPath = this.tmp();

    var promise;
    // server mode will build continuously
    if (options.server) {
      promise = _this.runTestsServer(options);
    } else {
      // ci mode
      var buildTask = new this.tasks.Build(this.taskOptions());
      promise = buildTask.run({
        environment: options.environment,
        outputPath: options.outputPath
      })
      .then(function() {
        return _this.prepareTestFiles(options);
      })
      .then(function() {
        return _this.runTests(options);
      });
    }

    return promise.finally(this.rmTmp.bind(this));
  }
};
