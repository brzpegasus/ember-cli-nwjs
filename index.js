'use strict';

module.exports = {
  name: 'ember-node-webkit',

  included: function(app) {
    this._super.included(app);

    app.import('vendor/node-webkit/shim.js', { prepend: true });
    app.import({ development: 'vendor/node-webkit/reload.js' });
  },

  includedCommands: function() {
    return {
      'nw': require('./lib/commands/nw'),
      'nw:package': require('./lib/commands/nw-package')
    }
  }
};
