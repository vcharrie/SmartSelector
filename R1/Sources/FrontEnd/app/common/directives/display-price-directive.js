/**
 * Created by Kiewan on 06/10/2014.
 */

'use strict';

angular.module('directives').directive('displayPrice', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelController) {
            ngModelController.$parsers.push(function(data) {
                if (data) {
                    return data.replace(',', '.');
                }
            });

            ngModelController.$formatters.push(function(data) {
                if (data) {
                    return data.toString().replace('.', ',');
                }
            });
        }
    };
});