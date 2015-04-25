var exec = require('child_process').exec;
var findNw = require('./node_modules/ember-cli-node-webkit/lib/helpers/find-nw');

runNw(findNw({
  root: './'
}));

function runNw(nwPath) {
  var nw = exec(nwPath + ' ./dist/tests');
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
    }, 2000);
  });
}
