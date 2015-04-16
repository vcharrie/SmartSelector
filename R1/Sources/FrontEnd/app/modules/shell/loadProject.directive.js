'use strict';

angular
.module('shell')
.directive('loadProject', function() {
    return {
        restrict: 'A',
        scope: {
            onFileLoad: '=onFileLoad',
            beforeLoading: '=beforeLoading'
        },
        template: '<input style="display:none" type="file" data-ng-file-select data-ng-file-change="onFileLoad($files, $event)" accept=".eqq"/>',
        link: function(scope, element) {
            //HACK AFT to avoid save project to cloud before upload project
            var userAction = 'loadProject';
            element.siblings('a').click(function () {
                if (scope.beforeLoading) {
                    scope.beforeLoading(function() {
                        element.find('input[type="file"]').click();
                    }, true, userAction);

                } else {
                    element.find('input[type="file"]').click();
                }
            });
        }
    };
});