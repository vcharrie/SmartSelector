'use strict';

/**
 * Wraps moment.js into an angular module
 */
angular.module('helpers').service('moment', function () {
    // assumes moment has already been loaded on the page
    return window.moment;
});