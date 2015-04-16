'use strict';

angular.module('shared').service('discoversService', function ($modal) {
    /*
     * Service public interface
     */
    var service = {};

    service.openDialog = function (language, discoverId) {

        $modal.open({
            templateUrl: 'modules/shared/discovers/discovers.view.html',
            windowClass: 'extended-elastic-modal-dialog',
            controller: 'discovers',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                reloadApplication: function () {
                    return false;
                },
                language: function () {
                    return language;
                },
                discoverId: function () {
                    return discoverId;
                }
            }
        });
    };

    return service;
});