'use strict';

var CustomReporter = require('./test-reporter');

/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
module.exports = {
  launch_in_ci: ['NW.js'],
  launch_in_dev: ['NW.js'],
  launchers: {
    'NW.js': {
      command: "node nw-runner.js",
      protocol: "tap"
    }
  },
  reporter: CustomReporter
};
