var jscs       = require('broccoli-jscs');
var jshint     = require('broccoli-jshint');
var mergeTrees = require('broccoli-merge-trees');

module.exports = function() {
  var srcTree = mergeTrees(['lib', 'blueprints']);

  var jscsTree = jscs(srcTree);
  jscsTree.description = 'JSCS';

  var jshintTree = jshint(srcTree);

  return mergeTrees([
      jscsTree,
      jshintTree
    ], { overwrite: true });
};
