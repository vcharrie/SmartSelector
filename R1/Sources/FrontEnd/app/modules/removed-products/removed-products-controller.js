'use strict';

angular.module('removedProducts').controller('removedProductsController', function($scope,$modalInstance,removedProducts){

    $scope.removedProducts = removedProducts ;

    $scope.close = function(){
        $modalInstance.close();
    };
});