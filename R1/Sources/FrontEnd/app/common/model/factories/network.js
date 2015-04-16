'use strict';

/**
 * @class angular_module.business.Network
 * @description Network data model
 */
angular.module('model').factory('Network', function() {

    /**
     * @property {String} name
     * @property {[Device]} devices in the network
     * @param {String} network name
     * @constructor
     */
    var Network = function(name) {
        this.name = name;
        this.incomerDevices = [];
    };

    /**
     * @description adds an incomer device
     * @param {Device} the incomer device to add
     */
    Network.prototype.addIncomerDevice = function (device) {
        this.incomerDevices.push(device);
    };

    /**
     * @description searches an incomer device index
     * @param {Device} the incomer device to spot
     * @returns {Number} incomer device index. 0 if first incomer device, -1 if not found
     */
    Network.prototype.searchIncomerDeviceIndex = function(device) {
        var deviceIndex = -1;
        for (var i = 0; i < this.incomerDevices.length; i++) {
            if (this.incomerDevices[i] === device) {
                deviceIndex = i;
            }
        }
        return deviceIndex;
    };

    /**
     * @description removes an incomer device
     * @param {Device} the incomer device to remove
     * @returns {boolean} true if the device has been correctly deleted
     */
    Network.prototype.deleteIncomerDevice = function (device) {
        var deviceIndex = this.searchIncomerDeviceIndex(device);
        if (deviceIndex !== -1) {
            this.incomerDevices.splice(deviceIndex, 1);
            return true;
        } else {
            return false;
        }
    };

    /**
     * @description moves an incomer device to another position among incomer devices
     * @param {Device} the incomer device to move
     * @param {Number} child index : the new position of this device among the incomer devices (0 for being the first incomer device)
     * @returns {boolean} true if the device has been correctly moved
     */
    Network.prototype.moveIncomerDevice = function (device, childIndex) {
        var deviceIndex = this.searchIncomerDeviceIndex(device);
        if (deviceIndex !== -1) {
            this.incomerDevices.splice(deviceIndex, 1);
            this.incomerDevices.splice(childIndex, 0, device);
            return true;
        } else {
            return false;
        }
    };

    /**
     * @description clears the network : devices list turns empty
     */
    Network.prototype.clearNetwork = function () {
        this.incomerDevices = [];
    };

    return Network;
});