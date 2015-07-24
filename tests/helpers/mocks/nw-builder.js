'use strict';

var RSVP = require('rsvp');

function MockNWBuilder(options) {
  this.options = options;
}

module.exports = MockNWBuilder;

MockNWBuilder.prototype.on = function() {
};

MockNWBuilder.prototype.build = function() {
  return RSVP.resolve(this.options);
};
