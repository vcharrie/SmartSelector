'use strict';

/**
 * @class angular_module.business.Basket
 * @description Basket data model
 */
angular.module('model').factory('Basket', function($rootScope) {

    /**
     * @property {String} name
     * @property {ProductPack[]} list
     * @property {Function} onElementChanged
     * @param {String} name
     * @constructor
     */
    var Basket = function(name) {
        this.name = name;
        this.list = [];
    };

    /**
     * @description Adds a product.
     * @param {ProductPack} productPack
     * @returns {boolean}
     */
    Basket.prototype.addProduct = function (productPack) {

        if (productPack.quantity === undefined || productPack.quantity < 1) {
            return false;
        }
        if (productPack.product === null) {
            return false;
        }

        if (this.onElementChanged) {
            productPack.onElementChanged = this.onElementChanged;
            this.onElementChanged();
        }
        this.list.push(productPack);

        $rootScope.$emit('Product added');

        return true;
    };

    /**
     * @description Removes a product from the list.
     * @param {ProductPack} productPack
     * @returns {boolean}
     */
    Basket.prototype.removeProduct = function(productPack) {

        var productIndex = this.list.indexOf(productPack);

        if (productIndex < this.list.length && productIndex >= 0) {
                //splice rather than delete : delete would let an "undefined" element at its place
            this.list.splice(productIndex, 1);
            if (this.onElementChanged) {
                this.onElementChanged();
            }
            return true;
        }
        return false;
    };

    /**
     * Find and replace a product from the list by another
     * @param oldProductPack the product to be replaced
     * @param newProductPack the product to use
     * @returns {boolean} true if the old product pack was replaced by the new. False otherwise
     */
    Basket.prototype.replaceProduct = function(oldProductPack, newProductPack) {

        var productIndex = this.list.indexOf(oldProductPack);

        if(productIndex !== -1) {
            this.list[productIndex] = newProductPack;
            if (this.onElementChanged) {
                this.onElementChanged();
            }
            return true;
        }
        return false;
    };

    /**
     * @description search for a product pack corresponding to a given product
     * @param {Product} product
     * @returns {ProductPack} Product pack of this product. Null if not found
     */
    Basket.prototype.searchProductPack = function(product) {
        for (var i=0; i< this.list.length; i++) {
            /*
            this method is better than underscore.isEqual because it will ignore
            all properties beginning with a $ symbol, ensuring a correct business comparison.
             */
            if (angular.equals(this.list[i].product, product)) {
                return this.list[i];
            }
        }
        return null;
    };

    /**
     * @description search for a product pack corresponding to a given product, and increase its quantity
     * @param {Product} product
     * @returns {boolean}
     */
    Basket.prototype.searchAndIncreaseProductPack = function(product) {
        for (var i=0; i< this.list.length; i++) {
            if (angular.equals(this.list[i].product, product)) {
                this.list[i].quantity++;
                return true;
            }
        }
        return false;
    };

    /**
     * @description search for a product pack corresponding to a given product, and decrease its quantity, or remove it if quantity is 1
     * @param {Product} product
     * @returns {boolean}
     */
    Basket.prototype.searchAndDecreaseProductPack = function(product) {
        for (var i=0; i< this.list.length; i++) {
            if (angular.equals(this.list[i].product, product)) {
                if (this.list[i].quantity === 1) {
                    this.removeProduct(this.list[i]);
                } else {
                    this.list[i].quantity--;
                }
                return true;
            }
        }
        return false;
    };

    /**
     * @description search for a product pack corresponding to a given product, and remove it
     * @param {Product} product
     * @returns {boolean}
     */
    Basket.prototype.searchAndRemoveProductPack = function(product) {
        for (var i=0; i< this.list.length; i++) {
            if (angular.equals(this.list[i].product, product)) {
                this.removeProduct(this.list[i]);
                return true;
            }
        }
        return false;
    };

    /**
     * @description Clear the products list.
     */
    Basket.prototype.clearProducts = function () {
        if(this.list.length > 0) {
            this.list = [];
            if (this.onElementChanged) {
                this.onElementChanged();
            }
        }
    };

    /**
     * @description Gets the total price of the basket
     * @return {Number} the price of the basket
     */
    Basket.prototype.getTotalPrice = function() {
        var price = 0;
        window._.each(this.list, function(productPack) {
            price += productPack.getPrice();
        });
        return Math.round(price * 100) / 100;
    };

    /**
     * @description Gets the total product count in this basket
     * @returns {Number} the total product count in this basket
     */
    Basket.prototype.getTotalProductCount = function() {
        var total = 0;
        window._.each(this.list, function(productPack) {
           total += productPack.quantity;
        });

        return total;
    };

    /**
     * @description Return the net price of the basket (discount is taken into account)
     * @returns {Number}
     */
    Basket.prototype.getNetPrice = function() {
        return window._.reduce(this.list, function(memo, productPack) {
            return memo + productPack.getNetPrice();
        }, 0);
    };

    return Basket;
});