'use strict';

angular.module('switchboardOrganisation').service('switchboardOrganisationNetworkFlatArrayService', function(_, projectService, networkService) {

    var service = {
    };

    //Adapt project network to view : create a flat array where all devices of the network are listed
    //This is necessary for D3 to work correctly : it watches the array, looking for new or deleted elements
    //Devices' links to their parent and children remain
    //
    //When initialising the controller, the model network is flattened, following a simple logic
    //When user adds a device, the added device is placed at the right place following the same logic
    // (-> function insertDeviceInNetworkFlatArray())

    service.networkFlatArray = [];

    /**
     * @description Recursive method to transform a subtree into a flat array
     * @param {Device} parent device of the subtree to transform
     * @returns {} nothing : builds a part of the object networkFlatArray
     */
    service.transformSubTree = function (device) {
        service.networkFlatArray.push(device);
        device.children.forEach(function (childDevice) {
            service.transformSubTree(childDevice);
        });
    };

    /**
     * @description Transforms the whole tree which forms the network into a flat array
     * @returns {} nothing : builds the object networkFlatArray
     */
    service.transformNetworkTreeIntoFlatArray = function () {
        service.network.incomerDevices.forEach(function (incomerDevice) {
            service.transformSubTree(incomerDevice);
        });
    };

    //record the number of devices of each types that have just been added for the next enter cycle of D3
    service.deviceTypesJustAdded = [];

    service.clearDeviceTypesJustAdded = function () {
        service.deviceTypesJustAdded[networkService.distributionType] = 0;
        service.deviceTypesJustAdded[networkService.electricalDeviceType] = 0;
        service.deviceTypesJustAdded[networkService.surgeArresterDeviceType] = 0;
        service.deviceTypesJustAdded[networkService.measureDeviceType] = 0;
    };

    service.initDeviceTypesJustAdded = function () {
        service.clearDeviceTypesJustAdded();
        service.networkFlatArray.forEach(function (device) {
            service.deviceTypesJustAdded[device.type]++;
        });
    };

    /**
     * @description Finds the lowest child downstream a device (it may be a distribution or a normal device)
     * @param {D3_Data} the device node data
     * @returns {Device} the lowest device downstream nodeData
     */
    service.findLowestChildDevice = function (nodeData) {
        var lowestChild = nodeData;
        while (lowestChild.children.length > 0) {
            lowestChild = lowestChild.children[lowestChild.children.length - 1];
        }
        return lowestChild;
    };

    /**
     * @description Place a device at the right index in networkFlatArray
     * @param {D3_Data} the device node data
     * @returns {} Nothing. Adds the device networkFlatArray at the right index
     */
    service.insertDeviceInNetworkFlatArray = function (nodeData) {
        var lastDeviceAbove = nodeData.parent;
        var index = -1;

        if (lastDeviceAbove !== null) {

            //if device is not an incomer
            if (nodeData.parent.children.indexOf(nodeData) > 0) {
                //if device has got brothers, take its younger brother
                lastDeviceAbove = nodeData.parent.children[nodeData.parent.children.indexOf(nodeData) - 1];
                //then take the lowest child of this younger brother
                lastDeviceAbove = service.findLowestChildDevice(lastDeviceAbove);
            }

            //if device has got no brother, take its parent (in particular, distributions never have got any brother)

            //the index where to add te device is the last device above index, incremented
            index = service.networkFlatArray.indexOf(lastDeviceAbove) + 1;

            service.networkFlatArray.splice(index, 0, nodeData);
        } else {
            //device is level 0 : place the device under the lowest child of its brother right above
            index = service.network.incomerDevices.indexOf(nodeData);
            if (index > 0){
                lastDeviceAbove = service.findLowestChildDevice(service.network.incomerDevices[index - 1]);
                index = service.networkFlatArray.indexOf(lastDeviceAbove) + 1;
            }
            service.networkFlatArray.splice(index, 0, nodeData);
        }

        //place device
        service.deviceTypesJustAdded[nodeData.type]++;
    };


    /**
     * @description Remove a device from networkFlatArray
     * @param {D3_Data} the device node data
     * @returns {} Nothing.
     */
    service.removeDeviceFromNetworkFlatArray = function (nodeData) {
        service.networkFlatArray.splice(service.networkFlatArray.indexOf(nodeData), 1);
    };

    service.countChildren = function (childrenArray) {
        var count = 0;
        if (childrenArray && childrenArray.length > 0) {
            for (var i=0; i<childrenArray.length; i++) {
                count += 1 + service.countChildren(childrenArray[i].children);
            }
        }
        return count;
    };

    service.countDistributions = function (parentDevice) {
        var count = 0;
        for (var i=0; i<parentDevice.children.length; i++) {
            var child = parentDevice.children[i];
            count += service.countDistributions(child);
            if (child.type==='distribution') {
                count += 1;
            }
        }
        return count;
    };

    /**
     * @description Checks if subtree can move to root without creating a second main distribution
     * @param draggedDevice
     * @returns {boolean}
     */
    service.subTreeCanBeMovedToRoot = function (draggedDevice) {
        return (networkService.getMainDistributionUpstreamDevice().children[0].children.length === 1 &&
            // + move a subtree outside of a distrib => move from col 1 to 0 item with 1 distribution, only if no other main distrib!!!
            draggedDevice === networkService.getMainDistributionUpstreamDevice().children[0].children[0]);
    };

    /**
     * @description Move a device at the right index in networkFlatArray
     * @param {D3_Data} the device node data
     * @returns {} Nothing. Adds the device networkFlatArray at the right index
     */
    service.moveDeviceInNetworkFlatArray = function (devicesModified, droppingArea, hadChildren) {
        var addedDevices = devicesModified.addedDevices;
        var deletedDevice = devicesModified.deletedDevice;
        var movedDevice = devicesModified.movedDevice;

        //delete device
        if (deletedDevice !== null) {
            var deletedDeviceIndexInFlatArray = service.networkFlatArray.indexOf(deletedDevice);
            service.networkFlatArray.splice(deletedDeviceIndexInFlatArray, 1);
        }

        //move device
        if (movedDevice !== null) {
            var movedDeviceIndexInFlatArray = service.networkFlatArray.indexOf(movedDevice);
            var movedDeviceIndex;
            var itemCount = 1 + service.countChildren(movedDevice.children);
            var dropAfter = false;
            if (droppingArea.row > movedDeviceIndexInFlatArray) {
                dropAfter = true;
                if (deletedDevice !== null) {
                    movedDeviceIndex = droppingArea.row - 2;
                } else {
                    movedDeviceIndex = droppingArea.row - 1;
                }
            } else {
                movedDeviceIndex = droppingArea.row;
            }
            if (itemCount===1 || !hadChildren) {
                service.networkFlatArray.splice(movedDeviceIndex, 0, service.networkFlatArray.splice(movedDeviceIndexInFlatArray, 1)[0]);
            } else {
                var movedDevices = service.networkFlatArray.splice(movedDeviceIndexInFlatArray, itemCount);
                var insertIndex = movedDeviceIndex - (dropAfter?(itemCount - 1):0);
                var newTab = service.networkFlatArray.slice(0, insertIndex);
                newTab = newTab.concat(movedDevices);
                newTab = newTab.concat(service.networkFlatArray.slice(insertIndex, service.networkFlatArray.length));
                service.networkFlatArray = newTab;
            }
        }

        //add device
        if (addedDevices.length > 0) {
            for (var i=0; i<addedDevices.length; i++){
                service.insertDeviceInNetworkFlatArray(addedDevices[i]);
            }
        }
    };

    /**
     * @description Returns the network filtered : taking only distribution devices
     * @returns {Array<Device>} An array of all the distributions of the network
     */
    service.distributionFilteredNetwork = function () {
        return _.filter(service.networkFlatArray, function (device) {
            return device.type === networkService.distributionType;
        });
    };

    /**
     * @description Returns the network filtered : taking only electrical devices
     * @returns {Array<Device>} An array of all the electrical devices of the network
     */
    service.electricalFilteredNetwork = function () {
        return _.filter(service.networkFlatArray, function (device) {
            return device.type === networkService.electricalDeviceType;
        });
    };

    /**
     * @description Returns the network filtered : taking only measure devices
     * @returns {Array<Device>} An array of all the measure devices of the network
     */
    service.measureFilteredNetwork = function () {
        return _.filter(service.networkFlatArray, function (device) {
            return device.type === networkService.measureDeviceType;
        });
    };

    /**
     * @description Returns the network filtered : taking only surgeArrester devices
     * @returns {Array<Device>} An array of all the surgeArrester devices of the network
     */
    service.surgeArresterFilteredNetwork = function () {
        return _.filter(service.networkFlatArray, function (device) {
            return device.type === networkService.surgeArresterDeviceType;
        });
    };

    service.clearNetworkFlatArray = function(){
        service.networkFlatArray = [];
    };

    return service;

});
