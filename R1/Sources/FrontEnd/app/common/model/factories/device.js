'use strict';

/**
 * @class angular_module.business.Device
 * @description Device data model
 */
angular.module('model').factory('Device', function(_) {

    /**
     * @property {String} type (possible values in common/business/services/network-service.js)
     * @property {Product} product
     * @property {ProductPack} productPack
     * @property {Device} parent
     * @property {Network} network
     * @property {[Device]} children
     * @property {[Number]} quantity
     * @property {[Warning]} warnings
     * @param {String} type
     * @param {Product} product
     * @param {ProductPack} productPack
     * @param {Device} parent
     * @param {Network} network
     * @param {[Number]} quantity
     * @constructor
     */
    var Device = function(product, productPack, type, parent, network, quantity) {
        this.product = product;
        this.productPack = productPack;
        this.type = type;
        this.parent = parent;
        this.network = network;
        this.children = [];
        this.quantity = quantity;
        this.warnings = [];
    };

    /**
     * @description Cuts this device link with its parent
     */
    Device.prototype.cutFromParent = function() {
        var that = this;
        if (this.parent !== null) {
            this.parent.children = _.filter(this.parent.children, function (child) {
                return child !== that;
            });
        }
        this.parent = null;
    };

    /**
     * @description Creates this device link with its parent
     * @param {Device} parent of this device
     * @param {Number} child index : the position of this device among its parent's children (0 for becoming the first child)
     */
    Device.prototype.connectToParent = function(parent, childIndex) {
        this.parent = parent;
        if (this.parent !== null)
        {
            this.parent.children.splice(childIndex, 0, this);
        } else{
            this.network.addIncomerDevice(this);
        }
    };

    /**
     * @description Returns true if this node has no children (i.e. is a leaf)
     * @returns {boolean}
     */
    Device.prototype.hasNoChildren = function() {
        return this.children.length === 0;
    };

    /**
     * @description Adds a device downstream to this device
     * @param {Product} product corresponding to the device to add
     * @param {String} type of the product
     * @returns {Device} the downstream device
     */
    Device.prototype.addDownstreamDevice = function(product, productPack, type, quantity) {
        var downstreamDevice = new Device(product, productPack, type, this, this.network, quantity);
        this.children.push(downstreamDevice);

        return downstreamDevice;
    };

    /**
     * @description Adds a device parallel to this device
     * @param {Product} product corresponding to the device to add
     * @param {String} type of the product
     * @returns {Device} the parallel device
     */
    Device.prototype.addParallelDevice = function(product, productPack, type, quantity) {
        var parallelDevice = new Device(product, productPack, type, this.parent, this.network, quantity);
        parallelDevice.connectToParent(this.parent, this.parent.children.length - 1);
        return parallelDevice;
    };

    /**
     * @description Deletes device with its children
     * @returns {boolean} true if device has been correctly deleted
     */
    Device.prototype.deleteDevice = function() {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].deleteDevice();
            this.children.splice(i, 1);
        }
        this.children = [];
        this.cutFromParent();
        return true;
    };

    /**
     * @description Move device with its children
     * @param {Device} new parent of the device
     * @param {Number} child index of the device (0 for first child)
     * @returns {boolean} true if device has been correctly moved
     */
    Device.prototype.moveDevice = function(parent, childIndex) {
        this.cutFromParent();
        this.connectToParent(parent, childIndex);
        return true;
    };

    return Device;
});