'use strict';

var isFunction = function(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};


/* Filters */
angular.module('helpers').filter('max', function() {
    return function(input, fieldName) {

        var out = [];
        var currentVal;
        var notEmpty = false;
        var maxValue =-1;
        var maxInput = null;

        for (var i in input) {

            if (isFunction(input[i][fieldName])) {
                currentVal = input[i][fieldName]();
            } else {
                currentVal = input[i][fieldName];
            }

            if (currentVal >= maxValue) {
                maxInput = input[i];
                maxValue = currentVal;
                notEmpty = true;
            }
        }
        if (notEmpty) {
            out.push(maxInput);
        }
        return out;
    };
}).filter('min', function() {
    return function(input, fieldName) {

        var out = [];
        var currentVal;
        var notEmpty = false;
        var minValue = 9999999999;
        var minInput = null;

        for (var i in input) {

            if (isFunction(input[i][fieldName])) {
                currentVal = input[i][fieldName]();
            } else {
                currentVal = input[i][fieldName];
            }

            if (currentVal <= minValue) {
                minInput = input[i];
                minValue = currentVal;
                notEmpty = true;
            }
        }
        if (notEmpty) {
            out.push(minInput);
        }
        return out;
    };
});