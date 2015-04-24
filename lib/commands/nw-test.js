'use strict';

var fs = require('fs');
var path = require('path');
var RSVP = require('rsvp');

var denodeify = RSVP.denodeify;
var readFile = denodeify(fs.readFile);
var writeFile = denodeify(fs.writeFile);

module.exports = {
  name: 'nw:test',
  description: 'Runs your test suite in NW.js',

  availableOptions: [
    { name: 'config-file', type: String, aliases: ['c', 'cf'] },
    { name: 'environment', type: String, default: 'test', aliases: ['e'] },
    { name: 'output-path', type: String, default: 'dist/', aliases: ['o'] }
  ],

  prepareTestFiles: function(options) {
    var root = this.project.root;
    var outputPath = options.outputPath;
    var testHtmlPath = path.resolve(root, outputPath, 'tests/index.html');

    return readFile(testHtmlPath, { encoding: 'utf8' })
      .then(function(rawHTML) {
        rawHTML = rawHTML.replace(/base href="\/"/, 'base href="../"');
        return writeFile(testHtmlPath, rawHTML);
      })
      .then(function() {
        // copy test package.json for nwjs
        var stream = fs.createReadStream(path.resolve(root, 'tests/package.json'));
        stream.pipe(fs.createWriteStream(path.resolve(outputPath, 'tests/package.json')));
      });
  },

  run: function(commandOptions) {
    var _this = this;

    var options = {
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    };

    var testTask = new this.tasks.Test(options);
    var buildTask = new this.tasks.Build(options);

    return buildTask.run({
        environment: commandOptions.environment,
        outputPath: commandOptions.outputPath
      })
      .then(function() {
        return _this.prepareTestFiles(commandOptions);
      })
      .then(function() {
        return testTask.run({
          outputPath: commandOptions.outputPath,
          configFile: commandOptions.configFile || path.join(__dirname, '..', 'testem.json')
        });
      });
  }
};
