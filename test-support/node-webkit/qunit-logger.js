// dead stupid script to format test output from nw.js to the console
import QUnit from 'qunit';

function log(content) {
  console.log('[qunit-logger] ' + content);
}

export function setQUnitLogger() {
  if (!window.nwDispatcher) {
    return;
  }

  var totalTestCount = 0;
  var testCount = 0;
  var tests = {};

  QUnit.begin(function(details) {
    if (details.totalTests >= 1) {
      totalTestCount = details.totalTests;
      log('1..' + details.totalTests);
    }
  });

  QUnit.testDone(function(details) {
    testCount++;
    if (details.failed === 0 && !tests[details.name]) {
      tests[details.name] = details.name;
      log('ok ' + testCount + ' - ' + details.module + ' # ' + details.name);
    }
  });

  QUnit.log(function(details) {
    if (details.result !== true) {
      var actualTestCount = testCount + 1;
      log('# ' + JSON.stringify(details));
      log('not ok ' + actualTestCount + ' - ' + details.module + ' - ' + details.name);
    }
  });

  QUnit.done(function(details) {
    log('# done' + (details.failed === 0 ? '' : ' with errors'));
    require('nw.gui').App.quit();
  });
}
