'use strict';

/*
Extract characteristic from an array of Filters by it's name
*/
angular.module('helpers').filter('formatAndTranslateCaract', function(_, gettextCatalog) {
    return function(caract, caracteristicDefinition) {

        //If type string return the translated string
        var caractType = Object.prototype.toString.call(caract);
        if (caractType === '[object String]') {
            return gettextCatalog.getString(caract);
        }

        switch (caracteristicDefinition.type) {
        case 'numeric':
            var translatedValue = '';
            if (caracteristicDefinition.prefix !== undefined) {
                translatedValue += gettextCatalog.getString(caracteristicDefinition.prefix) + ' ';
            }

            if (caracteristicDefinition.roundTo !== undefined) {
                translatedValue += Math.round((caract * caracteristicDefinition.factor) * Math.pow(10, caracteristicDefinition.roundTo)) / Math.pow(10, caracteristicDefinition.roundTo);
            }
            else {
                translatedValue += caract * caracteristicDefinition.factor;
            }

            if (caracteristicDefinition.sufix !== undefined) {
                translatedValue += ' ' + gettextCatalog.getString(caracteristicDefinition.sufix);
            }

            return translatedValue;
        default:
            return gettextCatalog.getString(caract);
        }

    };
});
