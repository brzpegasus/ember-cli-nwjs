'use strict';

var path    = require('path');
var mockery = require('mockery');
var expect  = require('../../helpers/expect');

describe("The command to start NW.js", function() {
  var fixturePath;

  before(function() {
    fixturePath = path.resolve(__dirname, '..', '..', 'fixtures');
  });

  describe("when the `nw` npm package is installed", function() {
    before(function() {
      mockery.enable({ useCleanCache: true });
      mockery.warnOnUnregistered(false);
    });

    after(function() {
      mockery.disable();
    });

    describe("and the platform is Mac", function() {
      var findNW;

      before(function() {
        mockery.registerMock('os', {
          platform: function() {
            return 'darwin';
          }
        });

        findNW = require('../../../lib/helpers/find-nw');
      });

      after(function() {
        mockery.deregisterMock('os');
        mockery.resetCache();
      });

      it("should be `node_modules/nw/nwjs/nwjs.app/Contents/MacOS/nwjs`", function() {
        var project = {
          root: path.join(fixturePath, 'project-darwin-1')
        };

        var nw = findNW(project);
        var expectedNW = ['node_modules', 'nw', 'nwjs', 'nwjs.app', 'Contents', 'MacOS', 'nwjs'].join(path.sep);

        expect(nw).to.contain(expectedNW);
      });

      it("should be `node_modules/nw/nwjs/Contents/MacOS/nwjs`", function() {
        var project = {
          root: path.join(fixturePath, 'project-darwin-2')
        };

        var nw = findNW(project);
        var expectedNW = ['node_modules', 'nw', 'nwjs', 'Contents', 'MacOS', 'nwjs'].join(path.sep);

        expect(nw).to.contain(expectedNW);
      });
    });

    describe("and the platform is Windows", function() {
      var findNW;

      before(function() {
        mockery.registerMock('os', {
          platform: function() {
            return 'win32';
          }
        });

        findNW = require('../../../lib/helpers/find-nw');
      });

      after(function() {
        mockery.deregisterMock('os');
        mockery.resetCache();
      });

      it("should be `node_modules/nw/nwjs/nw.exe`", function() {
        var project = {
          root: path.join(fixturePath, 'project-win32')
        };

        var nw = findNW(project);
        var expectedNW = ['node_modules', 'nw', 'nwjs', 'nw.exe'].join(path.sep);

        expect(nw).to.contain(expectedNW);
      });
    });

    describe("and the platform is not Mac or Windows", function() {
      var findNW;

      before(function() {
        mockery.registerMock('os', {
          platform: function() {
            return 'linux';
          }
        });

        findNW = require('../../../lib/helpers/find-nw');
      });

      after(function() {
        mockery.deregisterMock('os');
        mockery.resetCache();
      });

      it("should be  `node_modules/nw/nwjs/nw`", function() {
        var project = {
          root: path.join(fixturePath, 'project-linux')
        };

        var nw = findNW(project);
        var expectedNW = ['node_modules', 'nw', 'nwjs', 'nw'].join(path.sep);

        expect(nw).to.contain(expectedNW);
      });
    });
  });

  describe("when the `nw` npm package is not installed", function() {
    var findNW, _envNW;

    before(function() {
      findNW = require('../../../lib/helpers/find-nw');
    });

    beforeEach(function() {
      _envNW = process.env.NW_PATH;
    });

    afterEach(function() {
      process.env.NW_PATH = _envNW;
    });

    describe("and the `NW_PATH` environment variable is set", function() {
      it("should be the value of `NW_PATH`", function() {
        var project = {
          root: path.join(fixturePath, 'project-empty')
        };

        var envNW = '/custom/path/to/nw';
        process.env.NW_PATH = envNW;

        var nw = findNW(project);
        expect(nw).to.equal(envNW);
      });
    });

    describe("and the `NW_PATH` environment variable is not set", function() {
      it("should be `nw`", function() {
        var project = {
          root: path.join(fixturePath, 'project-empty')
        };

        delete process.env.NW_PATH;

        var nw = findNW(project);
        expect(nw).to.equal('nw');
      });
    });
  });
});
