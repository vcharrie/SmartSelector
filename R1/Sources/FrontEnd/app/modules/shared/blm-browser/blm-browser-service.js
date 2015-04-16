'use strict';

angular.module('shared').service('blmBrowserService', function ($modal, spimService, blmService) {
    /*
     * Service public interface
     */
    var service = {
    };

    service.openBrowser = function (browserMode, blmWebSiteUrl, projectName, browsingCallback) {


        spimService.serverAddress = blmService.blmBaseUrl;


        $modal.open({
            templateUrl: 'modules/shared/blm-browser/blm-browser.view.html',
            controller: 'blmBrowser',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                browserMode: function () {
                    return browserMode;
                },
                browsingCallback: function () {
                    return browsingCallback;
                },
                blmWebSiteUrl: function () {
                    return blmWebSiteUrl;
                },
                projectName: function () {
                    return projectName;
                }

            }
        });
    };

    return service;
});