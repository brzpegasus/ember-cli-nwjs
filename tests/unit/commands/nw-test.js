'use strict';

var path          = require('path');
var mockery       = require('mockery');
var mockSpawn     = require('mock-spawn');
var Command       = require('ember-cli/lib/models/command');
var Task          = require('ember-cli/lib/models/task');
var MockUI        = require('ember-cli/tests/helpers/mock-ui');
var MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
var RSVP          = require('rsvp');
var expect        = require('../../helpers/expect');

describe("ember nw command", function() {
  var NWCommand, ui, analytics, project, spawn, _envNW;

  beforeEach(function() {
    spawn = mockSpawn();
    mockery.enable({ useCleanCache: true });
    mockery.registerMock('child_process', { spawn: spawn });
    mockery.warnOnUnregistered(false);

    _envNW = process.env.NW_PATH;
    delete process.env.NW_PATH;

    var nwObject = require('../../../lib/commands/nw');
    NWCommand = Command.extend(nwObject);

    ui = new MockUI();
    analytics = new MockAnalytics();

    project = {
      isEmberCLIProject: function() {
        return true;
      },
      root: path.join(__dirname, '..', '..', 'fixtures', 'project-empty')
    };
  });

  afterEach(function() {
    process.env.NW_PATH = _envNW;

    mockery.deregisterAll();
    mockery.resetCache();
    mockery.disable();
  });

  it("should build the project before running nw.js", function() {
    var tasks = [];

    var command = new NWCommand({
      ui: ui,
      analytics: analytics,
      project: project,
      settings: {},
      buildWatch: function() {
        tasks.push('buildWatch');
        return RSVP.resolve();
      },
      runNW: function() {
        tasks.push('runNW');
        return RSVP.resolve();
      }
    }).validateAndRun();

    return expect(command).to.be.fulfilled
      .then(function() {
        expect(tasks).to.deep.equal(['buildWatch', 'runNW']);
      });
  });

  it("should not run nw.js when the build fails", function() {
    var tasks = [];

    var command = new NWCommand({
      ui: ui,
      analytics: analytics,
      project: project,
      settings: {},
      buildWatch: function() {
        tasks.push('buildWatch');
        return RSVP.reject();
      },
      runNW: function() {
        tasks.push('runNW');
        return RSVP.resolve();
      }
    }).validateAndRun();

    return expect(command).to.be.rejected
      .then(function() {
        expect(tasks).to.deep.equal(['buildWatch']);
      });
  });

  it("should not keep watching if nw.js fails to run", function() {
    var tasks = [];

    var command = new NWCommand({
      ui: ui,
      analytics: analytics,
      project: project,
      settings: {},
      buildWatch: function() {
        tasks.push('buildWatch');
        return RSVP.resolve();
      },
      runNW: function() {
        tasks.push('runNW');
        return RSVP.reject();
      }
    }).validateAndRun();

    return expect(command).to.be.rejected
      .then(function() {
        expect(tasks).to.deep.equal(['buildWatch', 'runNW']);
      });
  });

  it("should spawn a 'nw' process with the right arguments", function() {
    var command = new NWCommand({
      ui: ui,
      analytics: analytics,
      project: project,
      settings: {},
      buildWatch: function() {
        return RSVP.resolve();
      }
    }).validateAndRun();

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
    var command = new NWCommand({
      ui: ui,
      analytics: analytics,
      project: project,
      settings: {},
      buildWatch: function() {
        return RSVP.resolve();
      }
    }).validateAndRun();

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
