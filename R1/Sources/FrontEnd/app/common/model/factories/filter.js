'use strict';

/**
 * @class angular_module.business.Filter
 * @description Filter data model
 */
angular.module('model').factory('Filter', function() {
    /**
     *
     * @property {string} characteristic
     * @property {string} constraint
     * @property {[string]} value
     * @property {string} equal
     * @property {string} lte
     * @property {string} gte
     * @property {string} in
     * @property {string} Nin
     * @property {string} Inside
     *
     * @param {string} characteristic
     * @param {string} constraint
     * @param {[string]} values
     * @constructor
     */
    var Filter = function(characteristic, constraint, values) {
        this.characteristic = characteristic;
        this.constraint = constraint;
        this.value = values;
    };

    // TODO_WBA : add prototype dot things ?
    Filter.equal = 'Equal';
    Filter.lte = 'Lte';
    Filter.gte = 'Gte';
    Filter.in = 'In';
    Filter.Nin = 'Nin';
    Filter.Inside = 'Inside';


    return Filter;
});