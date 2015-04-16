'use strict';

angular.module('shared').service('userSessionTimeoutService', function ($modal) {
    /*
     * Service public interface
     */
    var service = {};

    service.openDialog = function (editMode, userSessionTimeoutCallback) {

        $modal.open({
            templateUrl: 'modules/shared/user-session-timeout/user-session-timeout.view.html',
            controller: 'userSessionTimeout',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                reloadApplication: function () {
                    return false;
                },
                editMode: function () {
                    return editMode;
                },
                userSessionTimeoutCallback: function () {
                    return userSessionTimeoutCallback;
                }

            }
        });
    };

    return service;
});