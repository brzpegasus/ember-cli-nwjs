/* global io */
// dead stupid script to format test output from nw.js to the console
import QUnit from 'qunit';
var socket = io('http://localhost:7357');

socket.on('connect', function(){
  // connect to testem server
  socket.emit('browser-login', 'NW.js', '1');
  console.log('sucessfully connected to test host');
});

// testem indicated we should re-run
socket.on('start-tests', function() {
  socket.disconnect();
  window.location.reload();
});

var messages = [];
function log(content) {
  console.log('[qunit-logger] ' + content);
}

export function setQUnitLogger() {
  if (!window.nwDispatcher) {
    return;
  }

  qunitAdapter(socket);
}

// mostly stolen from
// https://github.com/airportyh/testem/blob/31e070490cb8835a0b05b4f14fc1a75fe71e130a/public/testem/qunit_adapter.js
function qunitAdapter(socket){

  var results = {
      failed: 0,
      passed: 0,
      total: 0,
      tests: []}
    , currentTest
    , currentModule
    , id = 1

  function lineNumber(e){
      return e.line || e.lineNumber
  }

  function sourceFile(e){
      return e.sourceURL || e.fileName
  }

  function message(e){
      var msg = (e.name && e.message) ? (e.name + ': ' + e.message) : e.toString()
      return msg
  }

  function stacktrace(e){
      if (e.stack)
          return e.stack
      return undefined
  }

  QUnit.begin(function(details) {
    if (details.totalTests >= 1) {
      log('1..' + details.totalTests);
    }
  });

  QUnit.log( function(params, e){
      if (e){
          currentTest.items.push({
              passed: params.result,
              line: lineNumber(e),
              file: sourceFile(e),
              stack: stacktrace(e),
              message: message(e)
          })
      } else{
          if(params.result) {
              currentTest.items.push({
                  passed: params.result,
                  message: params.message
              })
          }
          else {
              currentTest.items.push({
                  passed: params.result,
                  actual: params.actual,
                  expected: params.expected,
                  message: params.message
              })
          }

      }

      if (params.result !== true) {
        var actualTestCount = results.total + 1;
        log('not ok ' + actualTestCount + ' - ' + params.module + ' - ' + params.name);
      }

  })
  QUnit.testStart( function(params){
      currentTest = {
          id: id++,
          name: (currentModule ? currentModule + ': ' : '') + params.name,
          items: []
      }
      socket.emit('tests-start')
  })
  QUnit.testDone( function(params){
      currentTest.failed = params.failed
      currentTest.passed = params.passed
      currentTest.total = params.total

      results.total++
      if (currentTest.failed > 0)
          results.failed++
      else
          results.passed++

      results.tests.push(currentTest)

      if (params.failed === 0) {
        results.tests[params.name] = params.name;
        log('ok ' + results.total + ' - ' + params.module + ' # ' + params.name);
      }

      socket.emit('test-result', currentTest)
  })
  QUnit.moduleStart( function(params){
      currentModule = params.name
  })
  QUnit.moduleEnd = function(params){
      currentModule = undefined
  }
  QUnit.done( function(params){
      results.runDuration = params.runtime
      log('# done' + (params.failed === 0 ? '' : ' with errors'));
      socket.emit('all-test-results', results);
  })

}
