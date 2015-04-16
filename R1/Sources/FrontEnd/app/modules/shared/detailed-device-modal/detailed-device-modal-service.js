'use strict';

angular.module('shared').service('detailedDeviceModalService', function($modal){
    /*
     * Service public interface
     */
    var service = {
    };

    service.detailedDeviceModal = function(deviceToDetail) {
        var device = deviceToDetail;

        $modal.open({
            templateUrl: 'modules/shared/detailed-device-modal/detailed-device-modal.view.html',
            controller: 'detailedDeviceModal',
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