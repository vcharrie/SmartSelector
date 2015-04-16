'use strict';

/**
 * Wraps underscore.js into an angular module
 */
angular.module('helpers').service('_', function () {
  // assumes underscore has already been loaded on the page
  return window._;
});