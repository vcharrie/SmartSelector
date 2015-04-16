'use strict';

/**
 * @ngdoc filter
 * @name bomUiApp.filter:percentageFilter
 * @function
 * @description
 * # percentageFilter
 * Filter in the bomUiApp.
 */
angular.module('bomFilters',[])
  .filter('percentage', function () {
    return function (input) {
    	return input ? input*100 : 0;
    };
  })
  .filter('formatPrice', function () {
    return function (input) {
    	return ((Math.round(input * 100) / 100).toFixed(2)).toString().replace('.',',');
    };
  });
