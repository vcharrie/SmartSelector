'use strict';

/**
 * @class angular_module.business.RangeItem
 * @description Range item model
 */
angular.module('model').factory('RangeItem', function() {

    /**
     *
     * @property {string} rangeName
     * @property {string} type
     * @property {string} pictureUrl
     * @property {Characteristic[]} mainCharacteristics
     * @property {Filter[]} permanentFilters
     * @property {String[]} projectContextFiltersIgnored
     * @property {String[]} metaRanges
     * @property {String} auxiliariesRangeName
     * @property {String[]} auxiliariesFilters
     * @property {String} sections
     * @property {String[]} levelType
     *
     * @param {string} rangeName
     * @param {string} type
     * @param {string} pictureUrl
     * @param {Characteristic[]} mainCharacteristics
     * @param {Filter[]} permanentFilters
     * @param {String[]} projectContextFiltersIgnored
     * @param {String[]} metaRanges
     * @param {String} auxiliariesRangeName
     * @param {String[]} auxiliariesFilters
     * @param {String} sections
     * @param {String[]} levelType
     * @constructor
     */
    var RangeItem = function(rangeName, type, pictureUrl, mainCharacteristics, permanentFilters, projectContextFiltersIgnored, metaRanges, auxiliariesRangeName, auxiliariesFilters, sections, levelType) {
        /**
         *
         * @type {string}
         */
        this.rangeName = rangeName;
        /**
         *
         * @type {string}
         */
        this.pictureUrl = pictureUrl;
        /**
         *
         * @type {Characteristic[]}
         */
        this.mainCharacteristics = mainCharacteristics;
        /**
         *
         * @type {Filter[]}
         */
        this.permanentFilters = permanentFilters ? permanentFilters : [];
        /**
         *
         * @type {String[]}
         */
        this.projectContextFiltersIgnored = projectContextFiltersIgnored ? projectContextFiltersIgnored : [];
        /**
         *
         * @type {string}
         */
        this.type = type ;
        /**
         *
         * @type {String[]}
         */
        this.metaRanges = metaRanges;
        /**
         *
         * @type {String}
         */
        this.auxiliariesRangeName = auxiliariesRangeName;
        /**
         *
         * @type {String[]}
         */
        this.auxiliariesFilters = auxiliariesFilters;
        /**
         *
         * @type {String}
         */
        this.sections = sections;
        /**
         * @type {String[]}
         */
        this.levelType = levelType ? levelType : [];
    };

    return RangeItem;
});