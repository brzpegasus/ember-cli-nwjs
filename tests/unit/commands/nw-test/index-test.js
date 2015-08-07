'use strict';

var fs            = require('fs');
var path          = require('path');
var RSVP          = require('rsvp');
var sinon         = require('sinon');
var Command       = require('ember-cli/lib/models/command');
var Task          = require('ember-cli/lib/models/task');
var TestTask      = require('ember-cli/lib/tasks/test');
var MockUI        = require('ember-cli/tests/helpers/mock-ui');
var MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
var MockProject   = require('../../../helpers/mocks/project');
var expect        = require('../../../helpers/expect');

var Command = require('ember-cli/lib/models/command');

describe('ember nw:test command', function() {
  var CommandUnderTest, commandOptions, tasks, outputPath;

  beforeEach(function() {
    var cmd = require('../../../../lib/commands/nw-test');
    CommandUnderTest = Command.extend(cmd);

    commandOptions = {
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-with-test-config'),

      tasks: {
        Build: Task.extend({
          run: function(options) {
            outputPath = options.outputPath;

            var fixturePath = path.join(__dirname, '../../../fixtures');
            var baseIndex = path.join(fixturePath, 'project-with-test-config', 'tests', 'index.html');

            var testsDir = path.join(outputPath, 'tests');
            var testsIndex = path.join(testsDir, 'index.html');

            fs.mkdirSync(testsDir, 0x1ff);

            var indexContent = fs.readFileSync(baseIndex, { encoding: 'utf8' });
            fs.writeFileSync(testsIndex, indexContent);

            tasks.push('build');
            return RSVP.resolve();
          }
        }),

        Test: Task.extend({
          run: function(options) {
            tasks.push('test');
            return RSVP.resolve();
          }
        })
      }
    };

    tasks = [];
  });

  it('should build the project before running tests', function() {
    var command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled
      .then(function() {
        expect(tasks).to.deep.equal(['build', 'test']);
      });
  });

  it('should call the Test task with the correct options', function() {
    var testem, testOptions;

    commandOptions.tasks.Test = TestTask.extend({
      init: function(options) {
        var Testem = require('testem');
        testem = this.testem = new Testem();

        sinon.stub(this.testem, 'startCI', function(options, callback) {
          this.app = {
            reporter: { total: 10 }
          };
          testOptions = options;
          callback();
        });
      }
    });

    var command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled
      .then(function() {
        var ciLauncherName = 'NW.js (CI)';
        var devLauncherName = 'NW.js';

        expect(testOptions.cwd).to.equal(outputPath);
        expect(testOptions['launch_in_ci']).to.deep.equal([ciLauncherName]);
        expect(testOptions['launch_in_dev']).to.deep.equal([devLauncherName]);

        var ciLauncher = testOptions.launchers[ciLauncherName] || {};
        expect(ciLauncher.protocol).to.equal('tap');

        var runnerPath = require.resolve('../../../../lib/commands/nw-test/runner');
        expect(ciLauncher.command).to.equal('node "' + runnerPath + '" --nw-path="nw" --tests-path="' + path.join(outputPath, 'tests') + '"');

        var devLauncher = testOptions.launchers[devLauncherName] || {};
        expect(devLauncher.protocol).to.equal('browser');
        expect(devLauncher.command).to.equal('node "' + runnerPath + '" --nw-path="nw" --tests-path="' + path.join(outputPath, 'tests') + '"');

        testem.startCI.restore();
      });
  });
});
