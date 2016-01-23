'use strict';

var sinon  = require('sinon');
var expect = require('../../../helpers/expect');

describe('CustomTapReporter', function() {
  var tapReporter, logs;

  before(function() {
    tapReporter = require('../../../../lib/commands/nw-test/reporter');
  });

  beforeEach(function() {
    logs = [];

    sinon.stub(process.stdout, 'write', function(data) {
      logs.push(data);
    });
  });

  describe('when a test passes', function() {
    it('should not include error details', function() {
      var data = {
        passed: 1,
        failed: 0,
        total: 1,
        id: 48,
        name: 'Unit - Reporter - successful test',
        items: []
      };

      tapReporter.report('NW.js', data);
      process.stdout.write.restore();

      expect(logs).to.deep.equal([
        'ok 1 NW.js - Unit - Reporter - successful test\n'
      ]);
    });
  });

  describe('when a test fails', function() {
    it('should include error details', function() {
      var stack = {
        module: 'Unit - Reporter',
        name: 'failed test',
        result: false,
        message: 'foo is true',
        actual: false,
        expected: true,
        testId: '593a7efd',
        runtime: 222,
        source: '    at file:///Users/user/project/foo/bar.js:45737:33)'
      };

      var data = {
        passed: 0,
        failed: 1,
        total: 1,
        id: 23,
        name: 'Unit - Reporter - failed test',
        items: [{
          id: 1,
          ok: false,
          name: 'Unit - Reporter - failed test',
          stack: JSON.stringify(stack),
          passed: false
        }]
      };

      tapReporter.report('NW.js', data);
      process.stdout.write.restore();

      expect(logs).to.deep.equal([
        'not ok 2 NW.js - Unit - Reporter - failed test\n',
        '    ---\n' +
        '        actual: >\n' +
        '            false\n' +
        '        expected: >\n' +
        '            true\n' +
        '        message: >\n' +
        '            foo is true\n' +
        '    ...\n'
      ]);
    });
  });
});
