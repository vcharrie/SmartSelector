'use strict';

/*
Extract characteristic from an array of Filters by it's name
*/
angular.module('helpers').filter('formatPrice', function() {
    return function(price) {

        // TODO : decimal separator should be an application constant
        // For es and ru the decimal separator is ","
        return ((Math.round(price * 100) / 100).toFixed(2)).toString().replace('.',',');
    };
});