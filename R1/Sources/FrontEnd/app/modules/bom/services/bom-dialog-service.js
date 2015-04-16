'use strict';

/**
 * bomDialogService : Provides APIs to show BOM modal dialog
 */

angular
    .module('bom')
    .service('bomDialogService', function ($modal) {
        /*
         * Service public interface
         */
        var service = {
        };

        /*
         * @param {String} message
         */
        service.showWarning = function (message) {
            return $modal.open({
                templateUrl: 'modules/bom/services/bom-dialog.view.html',
                controller: 'bomDialogController',
                backdrop : 'static',
                keyboard: false,
                resolve: {
                    message: function () { return message; }
                }
            });
        };

        return service;
    });