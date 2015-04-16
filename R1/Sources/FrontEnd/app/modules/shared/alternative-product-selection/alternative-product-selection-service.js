'use strict';

angular.module('shared').service('alternativeProductSelectionService', function($modal){
    /*
     * Service public interface
     */
    var service = {
    };

    service.selectAlternativeProduct = function(productPack, alternativeProductsList) {
        var productsList = alternativeProductsList;
        var originalProductPack = productPack;

        return $modal.open({
            templateUrl: 'modules/shared/alternative-product-selection/alternative-product-selection.view.html',
            windowClass: 'extended-modal-dialog',
            controller: 'alternativeProductSelection',
            backdrop : 'static',
            keyboard: false,
            resolve: {
                originalProductPack: function() {
                    return originalProductPack;
                },
                productsList: function() {
                    return productsList;
                }
            }
        }).result;
    };

    return service ;
});