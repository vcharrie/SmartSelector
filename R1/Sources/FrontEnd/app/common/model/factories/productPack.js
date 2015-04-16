'use strict';

/**
 * @class angular_module.business.ProductPack
 * @description ProductPack data model (product + quantity + price)
 */
angular.module('model').factory('ProductPack', function () {

    var maxQuantity = 100;

    /**
     * @property {RangeItem} rangeItem
     * @property {Characteristic[]} characteristics
     * @property {Filter[]} auxiliaryFilters
     * @property {boolean} isCompatibleWithAuxiliaries
     * @property {boolean} compatibleAuxiliariesRequestMade
     *
     * @param {Product} product
     * @param {number} quantity
     * @param {RangeItem} rangeItem
     * @param {Characteristic[]} characteristics
     * @constructor
     */
    var ProductPack = function (product, quantity, rangeItem, characteristics) {
        /**
         *
         * @type {Product}
         * @private
         */
        this._product = product;
        /**
         *
         * @type {number}
         * @private
         */
        this._quantity = quantity;
        this.rangeItem = rangeItem;
        this.characteristics = characteristics;
        this.auxiliaryFilters = null;
        this.compatibilityWithAuxiliaries = 0;
    };

    ProductPack.prototype = {
        /**
         *
         * @returns {Product}
         */
        get product() {
            return this._product;
        },
        /**
         *
         * @param {Product} val
         */
        set product(val) {
            if (val !== this._product) {
                this._product = val;
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
        }
    };

    /**
     *
     * @returns {number}
     */
    ProductPack.prototype.getPrice = function () {
        return Math.round(this._product.price() * this._quantity * 100) / 100;
    };

    /**
     * @description Return the net price of the product item (discount is taken into account)
     * @returns {number}
     */
    ProductPack.prototype.getNetPrice = function() {
        return this._quantity * this._product.getNetPrice();
    };

    /**
     *
     * @returns {ProductPack}
     */
    ProductPack.prototype.clone = function() {
        var newCharacteristics = [];
        this.characteristics.forEach(function(characteristic){
           newCharacteristics.push(characteristic.clone());
        });
        return new ProductPack(this._product.clone(), this._quantity, this.rangeItem, newCharacteristics);
    };

    /**
     * returns the value of a characteristic of the product
     * If the characteristic name is not found, returns ''
     * If the characteristic has not any value yet, returns ''
     * @returns {String}
     */
    ProductPack.prototype.characteristicValue = function (characteristicName) {
        var characteristicValue = '';
        this.characteristics.forEach(function (characteristic) {
            if (characteristic.name === characteristicName){
                characteristicValue = characteristic.selectedValue;
            }
        });
        return characteristicValue;
    };

    return ProductPack;
});