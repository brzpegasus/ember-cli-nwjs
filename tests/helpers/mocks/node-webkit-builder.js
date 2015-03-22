'use strict';

var RSVP = require('rsvp');

function MockNodeWebkitBuilder(options) {
  this.options = options;
}

module.exports = MockNodeWebkitBuilder;

MockNodeWebkitBuilder.prototype.on = function() {
};

MockNodeWebkitBuilder.prototype.build = function() {
  return RSVP.resolve(this.options);
};
