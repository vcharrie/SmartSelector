'use strict';

/*
Extract characteristic from an array of Filters by it's name
*/
angular.module('helpers').filter('extractCharact', function(_) {
    return function(selectedCharactsArray, name) {

        var filter = _.findWhere(selectedCharactsArray, { characteristic: name });

        if (filter === undefined || filter === null) {
            return '';
        } else {
            return filter.value;
        }
    };
});