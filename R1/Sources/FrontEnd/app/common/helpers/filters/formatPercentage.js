'use strict';

angular.module('helpers').filter('formatPercentage', function() {
    return function(probability) {
        return Math.round(probability * 100) + ' %';
    };
});