'use strict';

/**
 * characteristics helper
 */
angular.module('helpers').service('characteristicsHelper', function (_) {
    /*
     * Service public interface
     */
    var service = {};

    /**
     * @description get all electric filters from a list of characteristics, excluding characteristics following a criteria
     * @param {Characteristic[]}  characteristics from which filters should be extracted
     * @param {Function} excludeCriteria function that determines if a characteristic should be ignored
     *                                                 example : function (a) { return a.filterElectric === ''; } -> excludes all characteristics for which filterElectric property is an empty string
    *    @return {Filter}
     */
    service.getElectricFilters = function(characteristics, excludeCriteria) {
        var subset = characteristics;
        if (excludeCriteria !== undefined) {
            subset = _.filter(characteristics, function(c) {
                return !excludeCriteria(c);
            });
        }
        return _.without(_.map(subset, function(c) {
            return c.getAsElectricalFilter();
        }), null);
    };

    /**
     * get all mechanic filters from a list of characteristics, excluding characteristics following a criteria
     * @param {Array{characteristic}} : characteristics from which filters should be extracted
     * @param {function(characteristic) => boolean } : function that determines if a characteristic should be ignored
     *                                                 example : function (a) { return a.filterMechanic === ''; } -> excludes all characteristics for which filterMechanic property is an empty string
     */
    service.getMechanicFilters = function (characteristics, excludeCriteria) {
        var subset = characteristics;
        if (excludeCriteria !== undefined) {
            subset = _.filter(characteristics, function(c) {
                return !excludeCriteria(c);
            });
        }
        return _.without(_.map(subset, function(c) {
            return c.getAsMechanicalFilter();
        }), null);
    };

    return service;
});