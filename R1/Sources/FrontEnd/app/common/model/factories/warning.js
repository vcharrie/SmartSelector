'use strict';

/**
 * @class angular_module.business.Warning
 * @description Warning data model
 */
angular.module('model').factory('Warning', function () {
    /**
     * @property {String} message
     *
     * @param {String} message
     * @constructor
     */
    var Warning = function (message) {
        this.message = message;
    };

    /**
     *
     * @type {string}
     */
    Warning.prototype.obsoleteProductWarning = 'OBSOLETE_PRODUCT_MESSAGE';

    /**
     *
     * @type {string}
     */
    Warning.prototype.distributionNotCompatible = 'DISTRIBUTION_WARNING_MESSAGE';

    return Warning ;
});
