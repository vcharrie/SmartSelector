'use strict';

/**
 * string-helper service
 */
angular.module('helpers').service('stringHelper', function () {
    /*
     * Service public interface
     */
    var service = {};

    service.format = function() {

        if (arguments.length===0) {
            return '';
        }

        var message = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        return message.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };
    return service;
});