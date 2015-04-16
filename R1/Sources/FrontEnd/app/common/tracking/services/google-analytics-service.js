'use strict' ;

angular.module('tracking').service('googleAnalyticsService', function($location,apiConstants,applicationConfigurationService){
    /*
    * Service public interface
    */
    var service = {};

    service.init = function(userId){

        applicationConfigurationService.getApplicationParameter('gaConfiguration', true).then(function(data){
            var gaAccounts = data.parameterObject.accounts[$location.host()+apiConstants.baseUri] ;
            if (gaAccounts !== undefined){
                gaAccounts.forEach(function(gaAccount){
                    ga('create', gaAccount, { 'userId': userId });
                    ga('set', 'dimension1', userId);
                });
            }
        });
    };

    service.sendPageView = function(page){
        window.ga('send', 'pageview', page);
    };

    service.sendEvent = function(category, action, label, value){
        window.ga('send', 'event', category, action, label, value);
    };

    service.setDimension = function(id, value){
        window.ga('set', 'dimension' + id, value);
    };

    service.setMetric = function(id, value){
        window.ga('set', 'metric' + id, value);
    };

    return service;
});