'use strict';

angular.module('removedProducts').service('removedProductsService', function($modal){
    /*
     * Service public interface
     */
    var service = {
    };

    service.openModal = function(removedProducts) {
        return $modal.open({
            templateUrl: 'modules/removed-products/removed-products.view.html',
            windowClass: 'extended-modal-dialog',
            controller: 'removedProductsController',
            backdrop : 'static',
            keyboard: false,
            resolve: {
                removedProducts : function() {
                    return removedProducts;
                }
            }
        });
    };

    return service ;
});