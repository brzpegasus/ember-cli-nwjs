var exec = require('child_process').exec;
var findNw = require('./node_modules/ember-cli-node-webkit/lib/helpers/find-nw');
runNw(findNw({
  root: './'
}));

function runNw(nwPath) {
  var nw = exec(nwPath + ' ./dist/tests');
  nw.stdout.on('data', function (data) {
    process.stdout.write(data);
  });

  // Cleanup nw.js output to be TAP (test anything protocol) compliant
  nw.stderr.on('data', function (data) {
    if (data.indexOf('[qunit-logger]') > -1) {
      data = data.replace(/\[.*\] /g, "");
      data = data.replace(/\, source.*/g, "");
      data = data.replace(/\"/g, "");
      data = data.replace('[qunit-logger] ', '');
      console.log(data);
    }
  });

  nw.on('exit', function (code) {
    setTimeout(function () {
      process.exit(code);
    }, 2000);
  });
}
