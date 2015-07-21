'use strict';

var Builder = require('ember-cli/lib/models/builder');
var Watcher = require('ember-cli/lib/models/watcher');

module.exports = {
  name: 'nw:test',
  description: 'Runs your test suite in NW.js',

  availableOptions: [
    { name: 'environment', type: String, default: 'test', aliases: ['e'] },
    { name: 'server', type: Boolean, description: 'Run tests in interactive mode', default: false },
    { name: 'protocol', type: 'String', description: 'The protocol to use when running with --server', default: 'http' },
    { name: 'host', type: String, description: 'The host to use when running with --server', default: 'localhost', aliases: ['H'] },
    { name: 'port', type: Number, description: 'The port to use when running with --server', default: 7357, aliases: ['p'] },
    { name: 'module', type: String,  description: 'The name of a test module to run', aliases: ['m'] },
    { name: 'filter', type: String,  description: 'A string to filter tests to run', aliases: ['f'] }
  ],

  init: function() {
    this.assign    = require('lodash/object/assign');
    this.quickTemp = require('quick-temp');

    this.Builder = this.Builder || Builder;
    this.Watcher = this.Watcher || Watcher;

    if (!this.testing) {
      process.env.EMBER_CLI_TEST_COMMAND = true;
    }
  },

  tmp: function() {
    return this.quickTemp.makeOrRemake(this, '-testsDistNW');
  },

  rmTmp: function() {
    this.quickTemp.remove(this, '-testsDistNW');
  },

  taskOptions: function() {
    return {
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    };
  },

  runTestsForCI: function(options) {
    var buildTask = new this.tasks.Build(this.taskOptions());

    var NWTest = this.tasks.Test.extend(require('./task'));
    var testTask = new NWTest(this.taskOptions());

    var testOptions = this.assign({}, options, {
      outputPath: options.outputPath,
      reporter: require('./reporter')
    });

    return buildTask.run({
        environment: options.environment,
        outputPath: options.outputPath
      })
      .then(function() {
        return testTask.run(testOptions);
      });
  },

  runTestsForDev: function(options) {
    process.env.NW_TESTS_DEV = true;
    process.env.NW_TESTEM_SERVER_URL = options.protocol + '://' + options.host + ':' + options.port;

    // Test filtering
    var queryString = this.getTestPageQueryString(options);
    if (queryString.length > 0) {
      process.env.NW_TEST_PAGE_OPTIONS = queryString;
    }

    // Start the test server task
    var testOptions = this.assign({}, options, {
      outputPath: options.outputPath,
      project: this.project
    });

    var taskOptions = this.taskOptions();
    taskOptions.builder = new this.Builder(testOptions);

    var NWTestServer = this.tasks.TestServer.extend(require('./task'));
    var testServer = new NWTestServer(taskOptions);

    testOptions.watcher = new this.Watcher(this.assign(taskOptions, {
      verbose: false,
      options: options
    }));

    return testServer.run(testOptions);
  },

  getTestPageQueryString: function(options) {
    var params = [];

    if (options.module) {
      params.push('module=' + options.module);
    }

    if (options.filter) {
      params.push('filter=' + options.filter.toLowerCase());
    }

    return params.join('&');
  },

  run: function(options) {
    // Set environment variable to signal that this is the NW test command
    // and not a regular test command
    process.env.NW_TEST = true;

    options.outputPath = this.tmp();

    var promise;

    if (options.server) {
      // server mode will build continuously
      promise = this.runTestsForDev(options);
    } else {
      promise = this.runTestsForCI(options);
    }

    return promise.finally(this.rmTmp.bind(this));
  }
};
