'use strict';

var exec = require('child_process').exec;
var argv = require('optimist').argv;

runNw(argv['nw-path'], argv['tests-path']);

function runNw(nwPath, testsPath) {
  var nw = exec(nwPath + ' ' + testsPath);
  var hasErrors = false;

  nw.stdout.on('data', function(data) {
    process.stdout.write(data);
  });

  // Cleanup nw.js output to be TAP (test anything protocol) compliant
  nw.stderr.on('data', function(data) {
    if (data.indexOf('[qunit-logger]') > -1) {
      data = data.replace(/.*\[qunit-logger] (.*)"", source:.*/g, '$1');
      data = data.replace(/\\"/g, '"');
      data = data.replace(/\\\\n/g, '\\n');
      process.stdout.write(data);

      if (data === '# done with errors') {
        hasErrors = true;
      }
    }
  });

  nw.on('exit', function(code) {
    setTimeout(function() {
      process.exit(hasErrors ? 1 : code);
    }, 1);
  });
}
