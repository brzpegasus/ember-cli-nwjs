'use strict';

var path          = require('path');
var mockery       = require('mockery');
var RSVP          = require('rsvp');
var sinon         = require('sinon');
var Command       = require('ember-cli/lib/models/command');
var Task          = require('ember-cli/lib/models/task');
var MockUI        = require('ember-cli/tests/helpers/mock-ui');
var MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
var MockNWBuilder = require('../../helpers/mocks/node-webkit-builder');
var MockProject   = require('../../helpers/mocks/project');
var expect        = require('../../helpers/expect');

describe("ember nw:package command", function() {
  var CommandUnderTest, commandOptions, nwBuild;

  before(function() {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    });

    mockery.registerMock('node-webkit-builder', MockNWBuilder);
    mockery.registerMock('../helpers/detect-platform', function() {
      return 'osx64';
    });

    var cmd = require('../../../lib/commands/nw-package');
    CommandUnderTest = Command.extend(cmd);
  });

  after(function() {
    mockery.disable();
  });

  beforeEach(function() {
    commandOptions = {
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-empty', {
        dependencies: {
          rsvp: '^3.0.17',
          wrench: '^1.5.8'
        }
      }),
      tasks: {
        Build: Task.extend({
          run: function() {
            return RSVP.resolve();
          }
        })
      }
    };

    nwBuild = sinon.spy(MockNWBuilder.prototype, 'build');
  });

  afterEach(function() {
    MockNWBuilder.prototype.build.restore();
  });

  it("should build the project before packaging", function() {
    var tasks = [];

    commandOptions.tasks = {
      Build: Task.extend({
        run: function() {
          tasks.push('build');
          return RSVP.resolve();
        }
      })
    };

    commandOptions.packageApp = function() {
      tasks.push('package');
      return RSVP.resolve();
    };

    var command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled
      .then(function() {
        expect(tasks).to.deep.equal(['build', 'package']);
      });
  });

  it("should package the app with the right default configuration", function() {
    var command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled
      .then(function(options) {
        expect(nwBuild.calledOnce).to.be.true;

        var defaultConfig = {
          buildDir: 'build/app',
          cacheDir: 'build/cache',
          files: [
            'package.json',
            'dist/**',
            'node_modules/rsvp/**',
            'node_modules/wrench/**'
          ],
          platforms: ['osx64']
        };

        var promise = nwBuild.returnValues[0];
        return expect(promise).to.eventually.deep.equal(defaultConfig);
      });
  });

  it("should package the app with the configuration specified by the default config file", function() {
    commandOptions.project = new MockProject('project-with-config');

    var command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled
      .then(function(options) {
        expect(nwBuild.calledOnce).to.be.true;

        var customConfig = {
          buildDir: 'build',
          cacheDir: 'cache',
          files: ['package.json'],
          platforms: ['osx64', 'win64'],
          appName: 'foo',
          appVersion: '0.0.1'
        };

        var promise = nwBuild.returnValues[0];
        return expect(promise).to.eventually.deep.equal(customConfig);
      });
  });

  it("should package the app with the configuration specified by the custom config file", function() {
    commandOptions.project = new MockProject('project-with-config');

    var command = new CommandUnderTest(commandOptions).validateAndRun(['--config-file=custom-nw-package.js']);

    return expect(command).to.be.fulfilled
      .then(function(options) {
        expect(nwBuild.calledOnce).to.be.true;

        var customConfig = {
          buildDir: 'build/release',
          cacheDir: 'build/cache',
          files: [
            'package.json',
            'dist/**'
          ],
          platforms: ['win64'],
          appName: 'bar',
          appVersion: '0.0.1'
        };

        var promise = nwBuild.returnValues[0];
        return expect(promise).to.eventually.deep.equal(customConfig);
      });
  });
});
