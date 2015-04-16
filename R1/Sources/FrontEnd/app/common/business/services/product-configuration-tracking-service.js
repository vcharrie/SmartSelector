'use strict';

angular.module('business').service('productConfigurationTrackingService', function(googleAnalyticsService, _){
    /*
     * Service public interface
     */
    var that = this ;

    var service = {
    };

    this.selectedCharacteristics = [] ;

    service.characSelected = function(charac){
        that.selectedCharacteristics.push(charac);
    };

    service.characUnselected = function(charac){
        that.selectedCharacteristics = _.without(that.selectedCharacteristics,charac);
    };

    service.clearSelectedCharacteristics = function(){
        that.selectedCharacteristics = [] ;
    };

    service.productAdded = function(productPack){
        for (var i=0 ; i<productPack.quantity ; i++) {
            googleAnalyticsService.sendEvent('Business', 'Product added', 'Product added');
        }
    };

    return service;
});