'use strict';

/**
 * Logger service
 */
angular.module('helpers').service('logger',['$log',  function($log) {
    /*
   * Service public interface
   */
    var service = {};

    service.developerMode = false;

    service.log = function(message, data, source, showToast, title, optionsOverride) {
        logInternal(message, data, source, showToast, 'info', title, optionsOverride);
    };

    service.warning = function(message, data, source, showToast, title, optionsOverride) {
        logInternal(message, data, source, showToast, 'warning', title, optionsOverride);
    };

    service.success = function(message, data, source, showToast, title, optionsOverride) {
        logInternal(message, data, source, showToast, 'success', title, optionsOverride);
    };

    service.error = function(message, data, source, showToast, title, optionsOverride) {
        logInternal(message, data, source, showToast, 'error', title, optionsOverride);
    };

    /*
   * Service internal logic
   */

    /**
   * @param message : {String} the message to be logged.
   * @param data : {Object} the data to be logged
   * @param source : {String} the source of the log
   * @param showToast : {boolean} determines if the toaster has to be shown.
   * @param toastType : {String} the type of the toaster (alert levels).
   * @param title : {String} the title type of the toaster.
   * @param optionsOverride : {object} the optionsOverride of the toaster.
   */

    function logInternal(message, data, source, showToast, toastType, title, optionsOverride) {
        var write = (toastType === 'error') ? $log.error : $log.log;
        write(source ? '[' + source + '] ' : '', message, data ? data : '');

        if (showToast && (service.developerMode || (optionsOverride && optionsOverride.showUser))) {
            if (toastType === 'error') {
                toastr.error(message, title, optionsOverride);
            } else if (toastType === 'warning') {
                toastr.warning(message, title, optionsOverride);
            } else if (toastType === 'success') {
                toastr.success(message, title, optionsOverride);
            } else {
                toastr.info(message, title, optionsOverride);
            }
        }
    }

    return service;
}]);