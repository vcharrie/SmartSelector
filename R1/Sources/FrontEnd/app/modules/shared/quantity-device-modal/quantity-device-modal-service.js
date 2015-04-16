'use strict';

angular.module('shared').service('quantityDeviceModalService', function($modal){
    /*
     * Service public interface
     */
    var service = {
    };

    service.quantityDeviceModal = function(device) {

        return $modal.open({
            templateUrl: 'modules/shared/quantity-device-modal/quantity-device-modal.view.html',
            controller: 'quantityDeviceModal',
            windowClass: 'narrow-modal-dialog',
            backdrop : 'static',
            keyboard: false,
            resolve: {
                device : function() {
                    return device;
                }
            }
        });
    };

    return service ;
});