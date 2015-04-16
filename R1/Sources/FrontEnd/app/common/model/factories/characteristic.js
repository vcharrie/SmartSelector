'use strict';

/**
 * @class angular_module.business.Characteristic
 * @description Context Characteristic data model
 */
// todo JAS sourcedFromEnclosuresDB => ?
angular.module('model').factory('Characteristic', function(Filter, $filter) {
    //select should be a function which sets selected
    /**
     * @property {string} name
     * @property {string} displayValue
     * @property {string} _selectedValue
     * @property {string[]} additionalValues
     * @property {string[]} values
     * @property {String} filterElectric
     * @property {String} filterMechanic
     * @property {Function} onSelectedValueChanged
     * @property {boolean} sourcedFromEnclosuresDB
     * @property {string} unit
     * @property {string} displayTooltip
     * @param {string} name
     * @param {string} selectedValue
     * @param {[string]} additionalValues
     * @param {Filter} filterElectric
     * @param {Filter} filterMechanic
     * @param {boolean} sourcedFromEnclosuresDB
     * @param {string} unit
     * @param {String} displayFilter
     * @param {boolean} displayInProjectContext
     * @param {string} displayTooltip
     * @constructor
     */
    var Characteristic = function(name, selectedValue, additionalValues, filterElectric, filterMechanic, sourcedFromEnclosuresDB, unit, displayFilter, displayInProjectContext, displayTooltip) {
        this.name = name;

        // currently used only in the enclosure filter directive...
        this.displayValue = '';

        this._selectedValue = selectedValue;

        this.additionalValues = additionalValues;
        this.values = additionalValues;

        this.filterElectric = filterElectric;
        this.filterMechanic = filterMechanic;

        this.onSelectedValueChanged = null;

        this.sourcedFromEnclosuresDB = sourcedFromEnclosuresDB;

        this.unit = unit;

        //displayFilter : if nothing, then alphabetical order ; if "none", then empty filter ; else specified filter
        if (displayFilter) {
            if (displayFilter === 'unchanged') {
                this.displayFilter = $filter('unchanged');
            } else {
                this.displayFilter = displayFilter;
            }
        }else{
            this.displayFilter = $filter('orderBy1210ab');
        }

        if (displayInProjectContext) {
            this.displayInProjectContext = displayInProjectContext;
        }

        if (displayTooltip) {
            this.displayTooltip = displayTooltip;
        } else {
            this.displayTooltip = false;
        }
    };

    /*
     * Add "invisible" getter and setter for Characteristic.selectedValue field then
     * permits the use of onSelectedValueChanged if it was added to the object
     * and finally store the new value.
     */
    Characteristic.prototype = {
        /**
         *
         * @returns {string}
         */
        get selectedValue() {
            return this._selectedValue;
        },
        /**
         *
         * @param {string} val
         */
        set selectedValue(val) {
            if (val !== this._selectedValue) {
                if (this.onSelectedValueChanged) {
                    this.onSelectedValueChanged();
                }
                this._selectedValue = val;
            }
        }
    };

    /**
     *
     * @param {String[]} newValues
     */
    Characteristic.prototype.updateValues = function(newValues) {
        if (this.sourcedFromEnclosuresDB){
            this.values = this.additionalValues.concat(newValues);
        }
    };

    /**
     * @description Get a Filter object from this characteristic that can be used to filter electrical db
     * @returns {Filter}
     */
    Characteristic.prototype.getAsElectricalFilter = function() {
        if (this._selectedValue === Characteristic.indifferentValue) {
            return null;
        }

        return new Filter(this.name, this.filterElectric, this._selectedValue);
    };

    /**
     * @description Get a Filter object from this characteristic that can be used to filter mechanical db
     * @returns {Filter}
     */
    Characteristic.prototype.getAsMechanicalFilter = function() {
        if (this._selectedValue === Characteristic.indifferentValue) {
            return null;
        }

        return new Filter(this.name, this.filterMechanic, this._selectedValue);
    };

    /**
     *
     * @returns {Characteristic}
     */
    Characteristic.prototype.clone = function() {
        return new Characteristic(this.name, this._selectedValue, this.values, this.filterElectric, this.filterMechanic, this.sourcedFromEnclosuresDB, this.unit, this.displayFilter, this.displayInProjectContext, this.displayTooltip);
    };

    /**
     *
     * @type {string}
     */
    Characteristic.indifferentValue = 'INDIFFERENT_CHARACTERISTIC_VALUE';

    return Characteristic;
});