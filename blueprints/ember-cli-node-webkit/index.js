'use strict';

module.exports = {
  description: 'Blueprint for ember-cli Node WebKit projects',

  normalizeEntityName: function() {
    // `ember generate` requires an entity name, but we don't really care.
  },

  locals: function(options) {
    return {
      pkg: options.project.pkg
    };
  }
};
