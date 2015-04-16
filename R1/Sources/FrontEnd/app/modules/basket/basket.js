'use strict';

/**
 * basket controller
 */
angular.module('basket', ['ngRoute', 'business', 'helpers'])
    .config(function($routeProvider) {
        $routeProvider.when('/basket',
            {
                controller: 'basket',
                templateUrl: 'modules/basket/basket.view.html',
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
    .controller('basket', function($scope, projectService, Project) {
        if (projectService.hasElectricalDeviceList()) {
            $scope.selectedProductsList = Project.current.selectedSwitchboard.electricBasket.list;
        } else {
            $scope.selectedProductsList = [];
        }

        $scope.$on('languageChanged', function (){
            if (projectService.hasElectricalDeviceList()) {
                $scope.selectedProductsList = Project.current.selectedSwitchboard.electricBasket.list;
            } else {
                $scope.selectedProductsList = [];
            }
        });
    });
