'use strict';

var fs    = require('fs');
var path  = require('path');
var chalk = require('chalk');
var RSVP  = require('rsvp');

var denodeify = RSVP.denodeify;
var readFile  = denodeify(fs.readFile);
var writeFile = denodeify(fs.writeFile);

module.exports = {
  description: 'Blueprint for Ember NW.js projects',

  normalizeEntityName: function(entityName) {
    return entityName;
  },

  afterInstall: function(options) {
    var _this = this;
    var dependencies = this.project.dependencies();

    return this.addNwConfig(options)
    .then(function () {
      if (!dependencies.nw) {
        return _this.addPackageToProject('nw');
      }
    }).then(function () {
      return _this.addQUnitLogger();
    });
  },

  addNwConfig: function(options) {
    var ui = this.ui;
    var project = this.project;

    if (project.pkg.main) {
      return RSVP.resolve();
    }

    var packageJsonPath = path.join(project.root, 'package.json');
    var promise = readFile(packageJsonPath, { encoding: 'utf8' });

    return promise.then(function(data) {
      var json = JSON.parse(data);
      json.main = 'dist/index.html';
      json.window = { width: 960, height: 600 };

      ui.writeLine('  ' + chalk.yellow('overwrite') + ' package.json');

      if (!options.dryRun) {
        return writeFile(packageJsonPath, JSON.stringify(json, null, '  '));
      }
    });
  },

  addQUnitLogger: function() {
    var ui = this.ui;
    var testHelperFile = path.resolve(this.project.root, 'tests/test-helper.js');

    return readFile(testHelperFile, { encoding: 'utf8' })
      .then(function(data) {
        if (data.indexOf('node-webkit/qunit-logger') < 0) {
          ui.writeLine('  ' + chalk.yellow('overwrite') + ' tests/test-helper.js');

          var code = [
            "",
            "// Added by ember-cli-node-webkit",
            "import { setQUnitLogger } from './node-webkit/qunit-logger';",
            "",
            "setQUnitLogger();"
          ];

          data = data + code.join('\n');
        }

        return writeFile(testHelperFile, data);
      });
  }
};
