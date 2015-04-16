'use strict';

angular.module('shared').service('distributionConfigurationService', function($modal){
    /*
     * Service public interface
     */
    var service = {
        distributionLevel: ''
    };

    service.configureDistribution = function(level, request, device) {

        var requestKey = request;
        var modifiedDevice = device;
        var distributionLevel = level;

        return $modal.open({
            templateUrl: 'modules/shared/distribution-configuration/distribution-configuration.view.html',
            windowClass: 'extended-modal-dialog',
            controller: 'distributionConfiguration',
            backdrop : 'static',
            keyboard: false,
            resolve: {
                requestKey : function() {
                    return requestKey;
                },
                modifiedDevice : function() {
                    return modifiedDevice;
                },
                distributionLevel : function() {
                    return distributionLevel;
                }
            }
        });
    };

    return service ;
});