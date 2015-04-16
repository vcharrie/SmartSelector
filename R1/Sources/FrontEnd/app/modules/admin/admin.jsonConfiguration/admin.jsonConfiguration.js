'use strict';

/*
 * admin drawings controller
 */
angular.module('admin')
    .config(function($routeProvider) {
        $routeProvider.when('/admin/jsonConfiguration',
            {
                controller: 'admin-json-configuration',
                templateUrl: 'modules/admin/admin.jsonConfiguration/admin.jsonConfiguration.view.html'
            });
    })
    .controller('admin-json-configuration', function($scope, $q, $filter, applicationConfigurationService, logger) {

        $scope.configurationObjectList = ['globalConfiguration', 'contextConfigurations', 'version', 'rangeItems','auxiliaries','language(en-us)','language(ru-ru)','language(es-es)','language(fr-fr)','languages', 'distributions'];
        $scope.objectList = [];
        $scope.selectedObject = { parameterId: 'id', parameterObject: 'object' };
        $scope.jsonString = null;
        $scope.wellFormed = true;
        $scope.error = '';


        function init() {

            var promises = [];
            $scope.configurationObjectList.forEach(function(object) {
                promises.push(applicationConfigurationService.getApplicationParameter(object, true));
            });

            $q.all(promises).then(function(results) {

                results.forEach(function(result) {
                    $scope.objectList.push(result);
                });

            });

        }

        init();

        $scope.$watch('selectedObject', function(selectedObject) {
            $scope.jsonString = $filter('json')(selectedObject);
            if (selectedObject.parameterVersion !== null && typeof selectedObject.parameterVersion !== 'undefined' ) {
                $scope.objectVersion = selectedObject.parameterVersion;
            } else {
                $scope.objectVersion = 'NA';
            }
        }, true);

        $scope.$watch('jsonString', function(jsonString) {
            try {
                $scope.error = '';
                $scope.selectedObject = JSON.parse(jsonString);
                if (!$scope.selectedObject.parameterId || (typeof $scope.selectedObject.parameterId) !== 'string' || !$scope.selectedObject.parameterObject) {
                    $scope.wellFormed = false;
                    $scope.error = 'object must have a non empty parameterId<string> and parameterObject<object> properties';
                } else {
                    $scope.wellFormed = true;
                }

            } catch(e) {
                $scope.wellFormed = false;
                $scope.error = e.message;
            }
        }, true);

        $scope.selectObject = function(parameter) {
            $scope.selectedObject = parameter;
        };
        $scope.saveSelectedObject = function() {
            if ($scope.selectedObject.parameterId && $scope.selectedObject.parameterObject) {
                applicationConfigurationService.setApplicationParameter($scope.selectedObject.parameterId, $scope.selectedObject.parameterObject).then(function(result) {
                    logger.success(result, 'Json Admin', 'saveJSON', true);
                });
            }
        };
    });
