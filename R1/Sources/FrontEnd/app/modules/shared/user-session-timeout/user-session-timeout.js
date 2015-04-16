'use strict';

angular
    .module('shared')
    .controller('userSessionTimeout', function ($scope, $modalInstance, $window, editMode, userSessionTimeoutCallback) {

        $scope.editMode = editMode;
        var userSessionTimeout = userSessionTimeoutCallback;

        $scope.close = function () {
            $scope.validate(false);
        };


        $scope.validate = function (open) {

            if (editMode === 'OpenBackup') {
                if (open && userSessionTimeout !== undefined) {
                    userSessionTimeout();
                }

                $modalInstance.close();
            }
            else if (editMode === 'Reload') {

                if (userSessionTimeout !== undefined) {
                    userSessionTimeout();
                }

                $modalInstance.close();
                $window.location.href = $window.location.pathname;
            }

        };

    });