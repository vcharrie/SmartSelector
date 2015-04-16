'use strict';

/**
 * @class angular_module.business.Distribution
 * @description Distribution data model
 */
angular.module('model').factory('Distribution', function(){

    /**
     *
     * @property {String[]} product
     * @property {string} range
     * @property {string} technology
     * @property {string} polesDescription
     * @property {string} ratedOperationalVoltage
     * @property {string} ratedCurrent
     * @property {string} connectionsTerminals
     * @param {String[]} product
     * @param {string} range
     * @param {string} technology
     * @param {string} polesDescription
     * @param {string} ratedOperationalVoltage
     * @param {string} ratedCurrent
     * @param {string} connectionsTerminals
     * @constructor
     */
   var Distribution = function(product, range, technology, polesDescription, ratedOperationalVoltage, ratedCurrent, connectionsTerminals){
       this.product = product;
       this.range = range;
       this.technology = technology;
       this.polesDescription = polesDescription;
       this.ratedOperationalVoltage = ratedOperationalVoltage;
       this.ratedCurrent = ratedCurrent;
       this.connectionsTerminals = connectionsTerminals ;
   };

    return Distribution ;
});
