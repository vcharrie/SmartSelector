'use strict';

angular
    .module('directives')
    .directive('ngModelOnblur', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            priority: 1,
            link: function(scope, elm, attr, ngModelCtrl) {
                // override the default input to update on blur
                if (attr.type === 'radio' || attr.type === 'checkbox') {
                    return;
                }

                elm.unbind('input').unbind('keydown').unbind('change');
                elm.bind('blur', function() {
                    scope.$apply(function() {
                        ngModelCtrl.$setViewValue(elm.val());
                    });
                });
            }
        };
    });