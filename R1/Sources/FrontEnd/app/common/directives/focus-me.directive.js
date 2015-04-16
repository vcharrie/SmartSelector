'use strict';

angular
    .module('directives')
    .directive('focusMe', function($timeout, $parse) {
        return {
            link: function(scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                scope.$watch(model, function(value) {
                    if (value) {
                        $timeout(function() {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    });