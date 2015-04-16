'use strict';

/*
 * Format characteristic value and its unit
 */
angular.module('helpers').filter('unit', function (gettextCatalog, Characteristic) {
    return function (value, unit) {

        var translatedValue = gettextCatalog.getString(value);

        if(value === Characteristic.indifferentValue || unit === undefined) {
            return translatedValue;
        }

        return translatedValue + ' ' + unit;
    };
});
