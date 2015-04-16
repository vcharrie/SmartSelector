'use strict';

angular.module('bom').service('bomTrackingService', function(googleAnalyticsService, Project) {

    var service = {
    };

    service.bomDisplayed = function() {
        var projectPrice = Math.round(Project.current.selectedSwitchboard.getNetPrice()*100)/100;

        // track in google analytics
        googleAnalyticsService.sendEvent('Business', 'Bom displayed', 'Bom displayed', Math.round(projectPrice));
    };

    service.bomExported = function() {
        var projectPrice = Project.current.selectedSwitchboard.getTotalPrice();

        googleAnalyticsService.sendEvent('Business', 'Bom exported', 'Bom exported', Math.round(projectPrice));
    };

    service.globalDiscountApplied = function(discount) {
        googleAnalyticsService.sendEvent('Application', 'Global discount applied', 'Global discount applied', discount, Math.round(discount));
    };

    service.specificDiscountApplied = function(discount) {
        if (discount >= 5) {
            googleAnalyticsService.sendEvent('Application', 'Specific discount applied', 'Specific discount applied', discount, Math.round(discount));
        }
    };

    return service;
});