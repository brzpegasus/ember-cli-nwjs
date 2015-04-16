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
    var testHelperFile = path.resolve(this.project.root, 'tests/test-helper.js');
    var ui = this.ui;

    return readFile(testHelperFile, { encoding: 'utf8' })
    .then(function(data) {
      var code = 'import \'vendor/node-webkit/qunit-logger\';';

      if (data.indexOf(code) < 0) {
        ui.writeLine(chalk.yellow('modifying tests/test-helper.js to import vendor/node-webkit/qunit-logger'));
        data = data + '\n// placed by ember-cli-node-webkit \n' + code;
      }

      return writeFile(testHelperFile, data);
    });
  }
};
