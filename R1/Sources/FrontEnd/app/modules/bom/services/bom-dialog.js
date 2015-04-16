'use strict';

angular
    .module('bom')
    .controller('bomDialogController', function ($scope, $modalInstance, message) {
        $scope.message = message;
    });