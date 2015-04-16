'use strict' ;

/**
 * Tests for google-analytics-service
 */
 describe('google-analytics-service', function(){

    var googleAnalyticsService;
     var applicationConfigurationServiceMock ;

     beforeEach(function () {
         applicationConfigurationServiceMock =  jasmine.createSpyObj('applicationConfigurationService',
             ['getApplicationParameter']);

         applicationConfigurationServiceMock.getApplicationParameter.andCallFake(function(){});

         module('tracking', function($provide) {
             $provide.value('applicationConfigurationService', applicationConfigurationServiceMock);
         });
     });

    beforeEach(function () {
        module('tracking');
    });

    beforeEach(inject(function(_googleAnalyticsService_){
        googleAnalyticsService = _googleAnalyticsService_ ;
    }));

    it('should call pageview without error', function () {
        googleAnalyticsService.sendPageView('test');
    });

    it('should call sendEvent without error', function () {
        googleAnalyticsService.sendEvent('category', 'action', 'label');
    });

    it('should call setDimension without error', function () {
        googleAnalyticsService.setDimension('0', '1');
    });

    it('should call setMetric without error', function () {
        googleAnalyticsService.setMetric('0', 'test');
    });

 });