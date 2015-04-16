'use strict';

/**
 * @class angular_module.business.Part
 * @description Part data model
 */
angular.module('model').factory('Part', function () {

    var partDictionary = {};

    /**
     * @property {String} partCode
     * @property {String} longName
     * @property {String} resCode
     * @property {number} price
     * @property {number} discount
     * @property {String} dataSheetUrl
     * @property {String} image
     * @property {String} collection
     * @property {String} role : if collection is both, role is the property to indicate if this part is an electrical device or an auxiliary
     *
     * @param {String} partCode
     * @param {String} longName
     * @param {String} resCode
     * @param {number} price
     * @param {number} discount
     * @param {String} dataSheetUrl
     * @param {String} image
     * @param {String} collection
     * @constructor
     */
    var Part = function (partCode, longName, resCode, price, discount, dataSheetUrl, image, collection) {

        this.partCode = partCode;
        partDictionary[this.partCode] = {
            longName: longName,
            resCode: resCode,
            image: image,
            priceInfo: {price: price, discount: (isNaN(parseFloat(discount)) ? 0 : discount)},
            dataSheetUrl: dataSheetUrl,
            collection: collection,
            isAdditional: false
        };

        this._role = collection;

    };

    Part.partDictionary = partDictionary;

    /**
     * Static method, assigned to class
     * Instance ('this') is not available in static context
     */
    Part.updateParts = function (updatePartsDictionary) {
        for (var translation in updatePartsDictionary) {

            if (partDictionary[translation] === undefined || partDictionary[translation] === null) {
                partDictionary[translation] = {};
            }
            if (updatePartsDictionary[translation].longName !== undefined) {
                partDictionary[translation].longName = updatePartsDictionary[translation].longName;
            }
            if (updatePartsDictionary[translation].dataSheetUrl !== undefined) {
                partDictionary[translation].dataSheetUrl = updatePartsDictionary[translation].dataSheetUrl;
            }
            if (updatePartsDictionary[translation].resCode !== undefined) {
                partDictionary[translation].resCode = updatePartsDictionary[translation].resCode;
            }
            if (updatePartsDictionary[translation].image !== undefined) {
                partDictionary[translation].image = updatePartsDictionary[translation].image;
            }
            if (updatePartsDictionary[translation].collection !== undefined) {
                partDictionary[translation].collection = updatePartsDictionary[translation].collection;
            }
            if (updatePartsDictionary[translation].priceInfo !== undefined) {
                partDictionary[translation].priceInfo = updatePartsDictionary[translation].priceInfo;
            }
        }
    };


    Part.prototype = {
        /**
         *
         * @returns {number}
         */
        get discount() {

            if (partDictionary[this.partCode] !== undefined) {
                return partDictionary[this.partCode].priceInfo.discount;
            }
            return this._discount;


        },
        /**
         *
         * @param {number} val
         */
        set discount(val) {
            var newDiscount = parseFloat(val);
            if (newDiscount !== this._discount) {
                if (!isNaN(newDiscount) &&
                    newDiscount >= 0 &&
                    newDiscount <= 100) {
                    this._discount = newDiscount;
                } else if (isNaN(newDiscount)) {
                    this._discount = 0;
                }
            }
        },

        /**
         *
         * @returns {string}
         */
        get longName() {
            if (partDictionary[this.partCode] !== undefined) {
                return partDictionary[this.partCode].longName;
            }
            return 'missing';
        },
        get dataSheetUrl() {
            if (partDictionary[this.partCode] !== undefined) {
                return partDictionary[this.partCode].dataSheetUrl;
            }
            return 'missing';
        },
        get image() {
            if (partDictionary[this.partCode] !== undefined) {
                return partDictionary[this.partCode].image;
            }
            return -1;
        }, get resCode() {
            if (partDictionary[this.partCode] !== undefined) {
                return partDictionary[this.partCode].resCode;
            }
            return -1;
        },
        get collection() {
            if (partDictionary[this.partCode] !== undefined) {
                return partDictionary[this.partCode].collection;
            }
            return -1;
        },
        set collection(val) {
            if (partDictionary[this.partCode] !== undefined) {
                partDictionary[this.partCode].collection = val;
            }
        },
        get price() {
            if (partDictionary[this.partCode] !== undefined) {
                return partDictionary[this.partCode].priceInfo.price;
            }
            return -1;
        },
        set price(val) {
            if (partDictionary[this.partCode] !== undefined) {
                partDictionary[this.partCode].priceInfo.price = val;
            }
        },
        get isAdditional() {
            if (partDictionary[this.partCode] !== undefined) {
                return partDictionary[this.partCode].isAdditional;
            }
            return -1;
        },
        set isAdditional(val) {
            if (partDictionary[this.partCode] !== undefined) {
                partDictionary[this.partCode].isAdditional = val;
            }
        },

        get role(){
            return this._role;
        },
        set role(val){
            if (partDictionary[this.partCode] !== undefined && partDictionary[this.partCode].collection === 'Both'){
                this._role = val;
            }
        }
    };

    /**
     * Return the net price of the part (discount is taken into account)
     * @returns {number}
     */
    Part.prototype.getNetPrice = function () {
        var priceInfo = partDictionary[this.partCode].priceInfo;
        if (priceInfo !== undefined) {
            return priceInfo.price * (1 - priceInfo.discount / 100);

        }
        return -1;
    };


    return Part;
});