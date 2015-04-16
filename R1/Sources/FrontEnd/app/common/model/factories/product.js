'use strict';

/**
 * @class angular_module.business.Product
 * @description Product data model
 */
angular.module('model').factory('Product', function () {

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    /**
     * @property {[PartPack]} parts
     * @property {[String]} range
     * @property {[Boolean]} isInvalid
     * @property {[Object]} rangeOrder
     * @property {[Warning]} warnings
     * @param {[PartPack]} parts
     * @constructor
     */
    var Product = function (parts) {
        this._parts = parts;
        this.range = '';
        this.rangeOrder = 99;
        this.id = guid();
        this.warnings = [];
    };


    Product.prototype = {
        get parts() {
            return this._parts;
        },
        /**
         *
         * @param {Product} val
         */
        set parts(val) {
            this._parts = val;
        }
    };

    /**
     * @description returns references of this product
     * @returns {[String]}
     */
    Product.prototype.references = function () {
        return window._.flatten(window._.map(this.parts, function (p) {
            var parts = [];
            for (var i = 0; i < p.quantity; i++) {
                parts.push(p.part.partCode);
            }
            return parts;
        }));
    };

    /**
     * Compute the price of the product (without discount)
     * @returns {number}
     */
    Product.prototype.price = function () {
        return window._.reduce(this.parts, function (memo, partPack) {
            return memo + partPack.getPrice();
        }, 0);
    };

    /**
     * Return the net price of the product (discount is taken into account)
     * @returns {number}
     */
    Product.prototype.getNetPrice = function () {
        return window._.reduce(this.parts, function (memo, partPack) {
            return memo + partPack.getNetPrice();
        }, 0);
    };

    /**
     *
     * @returns {Product}
     */
    Product.prototype.clone = function () {
        var newParts = [];
        this.parts.forEach(function (part) {
            newParts.push(part.clone());
        });
        return new Product(newParts);
    };

    return Product;
});