'use strict';

angular
    .module('shared')
    .controller('editProfileDialog', function($scope, $timeout, $modalInstance,successCallback,    errorCallback,    cancelCallback){


        var externalSuccessCallback = successCallback;
        var externalErrorCallback = errorCallback;
        var externalCancelCallback = cancelCallback;

        $scope.close = function() {
            $modalInstance.close();
        };

        $scope.successCallback = function(){
            if(externalSuccessCallback)
            {
                externalSuccessCallback();
            }
            $scope.close();
        } ;
        $scope.errorCallback = externalErrorCallback;
        $scope.cancelCallback =  function(){
            if(externalCancelCallback)
            {
                externalCancelCallback();
            }
            $scope.close();
        } ;
    });