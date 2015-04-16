'use strict';

/**
 * @class angular_module.business.SwitchboardPack
 * @description SwitchboardPack data model (switchboard + quantity + price)
 */
angular.module('model').factory('SwitchboardPack', function () {

    var maxQuantity = 100;

    /**
     * @property {Function} onElementChanged
     * @property {RangeItem} rangeItem
     * @property {Characteristic[]} characteristics
     * @property {Filter[]} auxiliaryFilters
     * @property {boolean} isCompatibleWithAuxiliaries
     * @property {boolean} compatibleAuxiliariesRequestMade
     *
     * @param {Product} switchboard
     * @param {number} quantity
     * @constructor
     */
    var SwitchboardPack = function (switchboard, quantity, selectedForBom, type) {
        /**
         *
         * @type {Switchboard}
         * @private
         */
        this._switchboard = switchboard;
        /**
         *
         * @type {number}
         * @private
         */
        this._quantity = quantity;
        /**
         *
         * @type {number}
         * @private
         */
        this._type = (type === undefined ? 'main' : type);
        /**
         *
         * @type {boolean}
         * @private
         */
        this.isSelectedForBom = (selectedForBom === undefined ? true : selectedForBom);
    };

    SwitchboardPack.prototype = {
        /**
         *
         * @returns {Switchboard}
         */
        get switchboard() {
            return this._switchboard;
        },
        /**
         *
         * @param {Switchboard} val
         */
        set switchboard(val) {
            if (val !== this._switchboard) {
                this._switchboard = val;
            }
        },
        /**
         *
         * @returns {Number}
         */
        get quantity() {
            return this._quantity;
        },
        /**
         *
         * @param {Number} val
         */
        set quantity(val) {
            var newQuantity = parseFloat(val);
            if (newQuantity !== this._quantity) {

                if (!isNaN(newQuantity) &&
                    newQuantity > 0 &&
                    newQuantity < maxQuantity) {
                    this._quantity = newQuantity;
                } else if (isNaN(newQuantity)) {
                    this._quantity = 1;
                }
            }
        },
        /**
         *
         * @returns {Number}
         */
        get type() {
            return this._type;
        },
        /**
         *
         * @param {Number} val
         */
        set type(val) {
            this._type = val;
        }
    };

    /**
     * @description Return the net price of the switchboard pack item (discount is taken into account)
     * @returns {number}
     */
    SwitchboardPack.prototype.getNetPrice = function() {
        return this._quantity * this._switchboard.getNetPrice();
    };

    /**
     *
     * @returns {number}
     */
    SwitchboardPack.prototype.getTotalPrice = function() {
        return this._quantity * this._switchboard.getTotalPrice();
    };

    return SwitchboardPack;
});