'use strict';

var path          = require('path');
var mockery       = require('mockery');
var mockSpawn     = require('mock-spawn');
var RSVP          = require('rsvp');
var Command       = require('ember-cli/lib/models/command');
var Task          = require('ember-cli/lib/models/task');
var MockUI        = require('ember-cli/tests/helpers/mock-ui');
var MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
var MockProject   = require('../../helpers/mocks/project');
var expect        = require('../../helpers/expect');

describe("ember nw command", function() {
  var CommandUnderTest, commandOptions, spawn, _envNW;

  before(function() {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    });
  });

  after(function() {
    mockery.disable();
  });

  beforeEach(function() {
    _envNW = process.env.NW_PATH;
    delete process.env.NW_PATH;

    spawn = mockSpawn();
    mockery.registerMock('child_process', { spawn: spawn });

    var cmd = require('../../../lib/commands/nw');
    CommandUnderTest = Command.extend(cmd);

    commandOptions = {
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-empty')
    };
  });

  afterEach(function() {
    if (_envNW) {
      process.env.NW_PATH = _envNW;
    } else {
      delete process.env.NW_PATH;
    }

    mockery.deregisterAll();
    mockery.resetCache();
  });

  it("should build the project before running nw.js", function() {
    var tasks = [];

    commandOptions.buildWatch = function() {
      tasks.push('buildWatch');
      return RSVP.resolve();
    };

    commandOptions.runNW = function() {
      tasks.push('runNW');
      return RSVP.resolve();
    };

    var command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled
      .then(function() {
        expect(tasks).to.deep.equal(['buildWatch', 'runNW']);
      });
  });

  it("should not run nw.js when the build fails", function() {
    var tasks = [];

    commandOptions.buildWatch = function() {
      tasks.push('buildWatch');
      return RSVP.reject();
    };

    commandOptions.runNW = function() {
      tasks.push('runNW');
      return RSVP.resolve();
    };

    var command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.rejected
      .then(function() {
        expect(tasks).to.deep.equal(['buildWatch']);
      });
  });

  it("should not keep watching if nw.js fails to run", function() {
    var tasks = [];

    commandOptions.buildWatch = function() {
      tasks.push('buildWatch');
      return RSVP.resolve();
    };

    commandOptions.runNW = function() {
      tasks.push('runNW');
      return RSVP.reject();
    };

    var command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.rejected
      .then(function() {
        expect(tasks).to.deep.equal(['buildWatch', 'runNW']);
      });
  });

  it("should spawn a 'nw' process with the right arguments", function() {
    commandOptions.buildWatch = function() {
      return RSVP.resolve();
    };

    var command = new CommandUnderTest(commandOptions).validateAndRun();
    var ui = commandOptions.ui;

    return expect(command).to.be.fulfilled
      .then(function() {
        expect(spawn.calls.length).to.equal(1);
        expect(spawn.calls[0].command).to.equal('nw');
        expect(spawn.calls[0].args).to.deep.equal(['.']);

        expect(ui.output).to.contain("Starting nw.js...");
        expect(ui.output).to.contain("nw.js exited.");
      });
  });

  it("should print a friendly message when the 'nw' command cannot be found", function() {
    commandOptions.buildWatch = function() {
      return RSVP.resolve();
    };

    var command = new CommandUnderTest(commandOptions).validateAndRun();
    var ui = commandOptions.ui;

    spawn.sequence.add(function() {
      this.emit('error', { code: 'ENOENT' });
    });

    return expect(command).to.be.rejected
      .then(function() {
        expect(spawn.calls.length).to.equal(1);
        expect(spawn.calls[0].command).to.equal('nw');
        expect(spawn.calls[0].args).to.deep.equal(['.']);

        expect(ui.output).to.contain("Starting nw.js...");
        expect(ui.output).to.contain("Error running the following command: nw");
        expect(ui.output).to.contain("re-run the blueprint");
      });
  });
});
