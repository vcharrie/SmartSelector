'use strict';

/**
 * Wraps threejs.js into an angular module
 */
angular.module('helpers').service('threejs', function () {
  // assumes threejs has already been loaded on the page
  return window.THREE;
});