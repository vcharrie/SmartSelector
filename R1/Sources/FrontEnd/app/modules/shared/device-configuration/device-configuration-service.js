'use strict';

angular.module('shared').service('deviceConfigurationService', function($modal){
    /*
     * Service public interface
     */
    var service = {
    };

    service.configureDevice = function(request, devices) {
        var requestKey = request;
        var modifiedDevices = devices;

        return $modal.open({
            templateUrl: 'modules/shared/device-configuration/device-configuration.view.html',
            windowClass: 'extended-modal-dialog',
            controller: 'deviceConfiguration',
            backdrop : 'static',
            keyboard: false,
            resolve: {
                requestKey : function() {
                    return requestKey;
                },
                modifiedDevice : function() {
                    return modifiedDevices;
                }
            }
        });
    };

    return service ;
});