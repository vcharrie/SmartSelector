'use strict';

/**
 * home controller
 */
angular.module('switchboardContent', ['ngRoute', 'business', 'tracking', 'directives'])
    .config(function($routeProvider) {
        $routeProvider.when('/switchboard-content',
            {
                controller: 'switchboardContent',
                templateUrl: 'modules/switchboard-content/switchboard-content.view.html',
                resolve: {
                  factory:
                  ['projectService','$location', function(projectService, $location) {
                      return projectService.checkProjectExists(function() {
                          $location.path('/');
                      });
                  }]
              }
            });
    })
    .controller('switchboardContent', function($scope, $location, $timeout, projectService, Project, switchboardContentService, googleAnalyticsService) {
        $scope.electricBasket = Project.current.selectedSwitchboard.electricBasket;

        $scope.hasElectricalProducts = function() {
            return projectService.hasElectricalDevices();
        };

        $scope.$watch('electricBasket.list.length', function(){
            if ($scope.electricBasket.list.length > 0 && $scope.newProductCount) {
                $scope.newProductCount = { value: '+' + ($scope.electricBasket.list[$scope.electricBasket.list.length - 1].quantity) };
            } else {
                $scope.newProductCount = { value: null };
            }
            $scope.totalProductCount = { value: $scope.electricBasket.getTotalProductCount() };
        });

        $scope.displaySelection = switchboardContentService.displaySelection;
        $scope.displayBasket = switchboardContentService.displayBasket;

        $scope.onDisplayBasketButtonClick = function() {
            $scope.displayBasket = switchboardContentService.displayBasket = true;
            $scope.displaySelection = switchboardContentService.displaySelection = false;
            googleAnalyticsService.sendEvent('Application', 'Basket displayed', 'Basket displayed');
        };

        $scope.onDisplaySelectionButtonClick = function() {
            $scope.displayBasket = switchboardContentService.displayBasket = false;
            $scope.displaySelection = switchboardContentService.displaySelection = true;

            $scope.newProductCount = { value: null };
            $scope.totalProductCount = { value: $scope.electricBasket.getTotalProductCount() };
        };
    });