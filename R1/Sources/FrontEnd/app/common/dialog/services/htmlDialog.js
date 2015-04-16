'use strict';

angular
    .module('dialog')
    .controller('htmlDialogController', function($scope, $timeout, $modalInstance, $window,  title, html, bottomExternalLink, reloadApplication) {//$sce,

        $scope.title = title;
        $scope.html = html;
        $scope.reloadApplication = reloadApplication;
        $scope.bottomExternalLink = bottomExternalLink;

        $scope.close = function() {
            $modalInstance.close();
            if ($scope.reloadApplication) {
                $window.location.href = $window.location.pathname;
            }
        };

    }).directive('htmlToCompile', function($compile) {
        return {
            restrict: 'E',
            scope: {
                html: '=html'
            },
            controller: function($scope, $location, $anchorScroll) {

                $scope.getTemplateUrl = function() {
                    return $scope.html;
                };

                $scope.goto = function(tag) {
                    // set the location.hash to the id of
                    // the element you wish to scroll to.
                    $location.hash(tag);

                    // call $anchorScroll()
                    $anchorScroll();

                };
            },
            link: function(scope, element) {
                //Use html and compile it to get a working goto function
                var e = $compile(scope.html)(scope);
                element.replaceWith(e);
            }
        };
    });