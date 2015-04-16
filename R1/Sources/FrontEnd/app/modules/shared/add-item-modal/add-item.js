'use strict';

angular
    .module('shared')
    .controller('addItem', function ($rootScope, $scope, $modalInstance, additionalItems, _) {

        $scope.additionalItems = angular.copy(additionalItems);

        //add an empty item to array to show user that he can fill the field
        var emptyItem = {};
        $scope.additionalItems.push(emptyItem);
        $scope.focusIndex = $scope.additionalItems.length - 1;

        $scope.close = function () {
            $modalInstance.close(additionalItems);
        };

        $scope.validate = function () {
            $modalInstance.close($scope.additionalItems);
        };

        $scope.deleteItem = function (itemToDelete){
            $scope.additionalItems = _.without($scope.additionalItems, itemToDelete);
            $scope.focusIndex = $scope.additionalItems.length - 1;
        };

        $scope.deleteAllItems = function (){
            $scope.additionalItems = [];
            $scope.focusIndex = $scope.additionalItems.length - 1;
        };

        $scope.addItem = function () {
            var emptyAdditionalItem = {};
            $scope.additionalItems.push(emptyAdditionalItem);
            $scope.focusIndex = additionalItems.length - 1;
        };

        $scope.onKeyDown = function(/*form*/) {
            //TODO
        };

    });

