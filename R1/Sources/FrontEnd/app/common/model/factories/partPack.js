'use strict';

/**
 * @class angular_module.business.PartPack
 * @description PartPack data model (part + quantity)
 */
angular.module('model').factory('PartPack', function () {

    /**
     * @property {Part} part
     * @property {Number} quantity
     * @property {String} type
     *
     * @param {Part} part
     * @param {Number} quantity
     * @constructor
     */
    var PartPack = function (part, quantity) {
        this.part = part;
        this.quantity = quantity;
        this.type = null;
    };

    PartPack.prototype = {
        get part(){
            return this._part;
        },
        /**
         *
         * @param {Part} val
         */
        set part(val) {
            this._part = val;
        }
    };

    /**
     *
     * @returns {number}
     */
    PartPack.prototype.getPrice = function(){
        if(!this.part || this.part.price === undefined) {
            return 0;
        }
        return this.part.price * this.quantity ;
    };

    /**
    * @returns {number}
    * Return the net price of the part pack (discount is taken into account)
    */
    PartPack.prototype.getNetPrice = function() {
        // Hack : remove this once having good reference info db
        return !this.part ? 0 : this.part.getNetPrice() * this.quantity;
    };

    /**
     * @param {String} type
     * Sets the type of a part pack. Possible values : "auxiliary" (future possible values : "controlType", "releaseContact", ...)
     */
    PartPack.prototype.addType = function(type) {
        this.type = type;
    };


    /**
     *
     * @returns {PartPack}
     */
    PartPack.prototype.clone = function() {
        var newPartPack = new PartPack(this.part, this.quantity);
        newPartPack.type = this.type;

        return newPartPack;
    };

    return PartPack;
});