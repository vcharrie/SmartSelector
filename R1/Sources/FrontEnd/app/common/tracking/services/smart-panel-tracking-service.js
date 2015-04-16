'use strict' ;

angular.module('tracking').service('smartPanelTrackingService', function(googleAnalyticsService){
    /*
     * Service public interface
     */
    var service = {};

    var projectPriceBeforeConversion = null;

    service.smartPanelConversion = function(priceBeforeConversion){
        projectPriceBeforeConversion = priceBeforeConversion ;
    };

    service.newEnclosureSolution = function(newProjectPrice){
        if (projectPriceBeforeConversion !== null){
            var priceDifference = Math.round(newProjectPrice - projectPriceBeforeConversion);
            googleAnalyticsService.sendEvent('Application', 'Convert to smart panel', 'Convert to smart panel', priceDifference);
            projectPriceBeforeConversion = null ;
        }
    };

    return service;
});