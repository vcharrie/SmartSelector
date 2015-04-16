'use strict';

angular.module('shared').service('auxiliariesSelectionService', function($modal){
    /*
     * Service public interface
     */
    var service = {
    };

    service.selectAuxiliaries = function(productPack) {
        var mainProductPack = productPack;

        return $modal.open({
            templateUrl: 'modules/shared/auxiliaries-selection/auxiliaries-selection.view.html',
            windowClass: 'extended-modal-dialog',
            controller: 'auxiliariesSelection',
            backdrop : 'static',
            keyboard: false,
            resolve: {
                mainProductPack: function() {
                    return mainProductPack;
                }
            }
        }).result;
    };

    return service ;
});