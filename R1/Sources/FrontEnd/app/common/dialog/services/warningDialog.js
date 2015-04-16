'use strict';

angular
    .module('dialog')
    .controller('warningDialogController', function ($scope, $modalInstance, messages) {
        $scope.messages = messages;

        $scope.close = function () {
            $modalInstance.close();
        };
    });