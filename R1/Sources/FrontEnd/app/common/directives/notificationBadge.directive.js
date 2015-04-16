'use strict';

angular
    .module('directives')
    .directive('notificationBadge', function($timeout) {
        var autoHideMs = 2000;

        return {
            restrict: 'E',
            replace: false,
            scope: {
              'content' : '=',
                'autoHide': '='
            },
            template: '<span class="notification-badge badge fadeDownUp" data-ng-if="visible">{{content.value}}</span>',
            link: function (scope) {
                scope.visible = false;

                if (scope.content) {
                    scope.visible = true;
                }

                scope.$watch('content', function() {
                    scope.visible = true;
                    if (scope.autoHide) {
                        $timeout(function () {
                            scope.visible = false;
                        }, autoHideMs);
                    }
                });
            }
        };
    });