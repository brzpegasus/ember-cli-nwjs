/* global define, window, QUnit */
// dead stupid script to format test output from nw.js to the console
define('vendor/node-webkit/qunit-logger', function () {
  function log(content) {
    console.log('[qunit-logger] ' + content);
  }

  if (!window.nwDispatcher) {
    return;
  }

  var totalTestCount = 0;
  var testCount = 0;
  var tests = {};

  QUnit.begin(function (details) {
    if (details.totalTests >= 1) {
      totalTestCount = details.totalTests;
      log('1...' + details.totalTests);
    }
  });

  QUnit.testDone(function (details) {
    testCount++;
    if (details.failed === 0 && !tests[details.name]) {
      tests[details.name] = details.name;
      log('ok ' + testCount + ' - ' + details.module + ' # ' + details.name);
    }
  });

  QUnit.log(function (details) {
    if (details.result !== true) {
      var actualTestCount = testCount + 1;

      log('not ok ' + actualTestCount + ' - ' + details.module + ' - ' + details.name);
      log('#    actual: -');
      log('#      ' + details.actual);
      log('#    expected: -');
      log('#      ' + details.expected);
      log('#    message: -');
      log('#      ' + details.message);

      if (details.source) {
        log('#      ' + details.source);
      }

      log('#    Log:');
      if (details.log) {
        log('#      ' + details.log);
      }
    }
  });

  QUnit.done(function(details) {
    log('# done' + (details.failed === 0 ? '' : ' with errors'));
    require('nw.gui').App.quit();
  });
});
