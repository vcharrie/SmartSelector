'use strict';

/**
 * @class angular_module.business.networkService
 */
angular.module('business').service('networkService', function(_, $q, logger, gettextCatalog,
                                                              Project, productConfigurationTrackingService, rangeService, modifyProductService, distributionService,
                                                              Device, Product, ProductPack, Characteristic, PartPack, Part, Warning) {

    var service = {
        electricalDeviceType : 'electrical',
        measureDeviceType : 'measure',
        distributionType : 'distribution',
        surgeArresterDeviceType : 'surgeArrester'
    };

    var getDeviceLevel = function(deviceToFind, devicesToCheck, level) {

        for(var i = 0; i < devicesToCheck.length; i++) {
            if(angular.equals(deviceToFind, devicesToCheck[i])) {
                return level;
            }
            var nextLevel = level+1;
            var productLevel = getDeviceLevel(deviceToFind, devicesToCheck[i].children, nextLevel);
            if(productLevel !== -1) {
                return productLevel;
            }
        }
        return -1;
    };

    service.getDeviceLevelInNetwork = function(deviceToFind) {
        var switchboard = Project.current.selectedSwitchboard;
        return getDeviceLevel(deviceToFind, switchboard.network.incomerDevices, 1);
    };

    /**
     * @description (private recursive method) iterate over network devices to find the matcher device
     * @param {Product} productToFind : device to match
     * @param {Device[]} devicesToCheck : devices to analyze
     * @return {Device} a device matching the deviceToFind, null if not found
     */
    var walkThroughDevices = function(productToFind, devicesToCheck) {

        for(var i = 0; i < devicesToCheck.length; i++) {
            if(angular.equals(productToFind, devicesToCheck[i].product)) {
                return devicesToCheck[i];
            }
            var device = walkThroughDevices(productToFind, devicesToCheck[i].children);
            if(device !== null) {
                return device;
            }
        }

        return null;
    };

    /**
     * @description (private method) check if distributions are still compatible with distributions categories
     */
    service.checkDistributionsCompatibility = function(){

        var deferred = $q.defer();

        var promises = [];
        var distributionDevices = [];
        var switchboard = Project.current.selectedSwitchboard;
        switchboard.distributionBasket.list.forEach(function(productPack) {

            // get device from product pack
            var distributionDevice = walkThroughDevices(productPack.product, switchboard.network.incomerDevices);
            distributionDevice.warnings = [] ;
            if(!distributionDevice) {
                console.log('No distribution device found for product pack ' + productPack.product.references());
            }

            distributionDevices.push(distributionDevice);

            // get ranges of upstream and downstream devices
            promises.push(distributionService.getTopologyRanges(distributionDevice));
        });

        $q.all(promises).then(function(rangesArray) {
            promises = [];
            rangesArray.forEach(function(ranges) {
                // find compatible distributions categories
                promises.push(rangeService.getCompatibleDistributions(ranges));
            });

            $q.all(promises).then(function(compatibleDistributions) {
                // check if the distribution is still compatible with distributions categories
                for (var index in compatibleDistributions) {

                    // add a warning to the distribution if it is not compatible anymore
                    if (!_.contains(compatibleDistributions[index], Project.current.selectedSwitchboard.distributionBasket.list[index].rangeItem.rangeName)){
                        distributionDevices[index].warnings.push(new Warning(Warning.prototype.distributionNotCompatible));
                    }
                }

                deferred.resolve();
            });
        });

        return deferred.promise;
    };

    /**
     * @description (private method) matches the right basket corresponding to a given type
     * @param {String} type of a device
     * @returns {Basket} the corresponding basket
     */
    var matchDeviceTypeWithBasket = function(type) {
        var basket = null;
        switch(type) {
            case service.electricalDeviceType :
            case service.measureDeviceType :
            case service.surgeArresterDeviceType :
                basket = Project.current.selectedSwitchboard.electricBasket;
                break;
            case service.distributionType :
                basket = Project.current.selectedSwitchboard.distributionBasket;
                break;
            default:
                logger.error(gettextCatalog.getString('ERROR_UNEXPECTED'), 'unknown commercial type (network-service)', 'mapTypeWithBasket', false);
                return null;
        }
        return basket;
    };

    /**
     * @description (private method) adds a product to the right basket depending on the type of the product
     * @param {ProductPack} productPackToAdd : product to add
     * @param {String} type of the product to add
     * @returns {Product} the added product (which has been cloned)
     */
    var addCommercialProduct = function(productPackToAdd, type) {
        productConfigurationTrackingService.productAdded(productPackToAdd);
        var basket = matchDeviceTypeWithBasket(type);
        var addedProductPack = productPackToAdd.clone();
        var addSuccess = basket.addProduct(addedProductPack);
        if (addSuccess) {
            return addedProductPack.product;
        }
        return null;
    };

    /**
     * @description (private method) Adds an incomer device to the network
     * @param {ProductPack} productPack configuration of this incomer device
     * @param {String} type of a device
     * @returns {Device} the added incomer device. null if there was an error
     */
    var addIncomerDeviceToNetwork = function(productPack, type) {
        var addedProduct = addCommercialProduct(productPack, type);
        var incomerDevice = new Device(addedProduct, productPack, type, null, Project.current.selectedSwitchboard.network, productPack.quantity);
        Project.current.selectedSwitchboard.network.addIncomerDevice(incomerDevice);
        return incomerDevice;
    };

    /**
     * @description (public method) Starts the network, filling the first incomer device
     * @param {ProductPack} productPack : first incomer product configuration
     * @param {String} type of the product to add
     * @returns {Device} the added device. null if there was an error
     */
    service.startNetwork = function(productPack, type) {
        return addIncomerDeviceToNetwork(productPack, type);
    };

    /**
     * @description (private method) Sets a fake product for 'no distribution'
     * @returns {Product} the fake product
     */
    var getNoDistributionFakeProduct = function() {
        var partCode ='';
        var longName = gettextCatalog.getString('switchboard-organisation-no-distribution-label');
        var resCode ='';
        var price = 0;
        var discount = 0;
        var dataSheetUrl = '';

        var part = new Part(partCode, longName, resCode, price, discount, dataSheetUrl);
        var partPack = new PartPack(part, 1);
        return  new Product([partPack]);
    };

    /**
     * @description (private method) adds a distribution downstream a device
     * @param {Device} parentDevice : parent of the distribution to add
     * @returns {Device} the added distribution device. null if there was an error
     */
    var addDistribution = function(parentDevice) {
        var fakeProduct = getNoDistributionFakeProduct();
        var fakeProductPack = new ProductPack(fakeProduct, 1, null, null);
        return parentDevice.addDownstreamDevice(fakeProduct, fakeProductPack, service.distributionType, 1);
    };

    /**
     * @description (public method) gets the main distribution upstream device
     * @returns {Device} the device which is upstream from main distribution. Null if there is no main distribution
     */
    service.getMainDistributionUpstreamDevice = function(){
        var upstreamDevice = null;
        Project.current.selectedSwitchboard.network.incomerDevices.forEach(function(device) {
            if (device.children.length > 0) {
                upstreamDevice = device;
            }
        });
        return upstreamDevice;
    };

    /**
     * @description (public method) gets the first main distribution upstream device that can have chidren
     * @returns {Device} the device which is upstream and can have children. Null otherwise
     */
    service.getFirstParentalEligibleUpstreamDevice = function() {
        var firstEligible = _.find(Project.current.selectedSwitchboard.network.incomerDevices, function(incomerDevice) {
            return incomerDevice.quantity === 1;
        });
        return firstEligible === undefined ? null : firstEligible;
    };

    /**
     * @description (public method) adds a downstream device in the network, and updates the whole project consequently
     * @param {Device} parentDevice : parent of the new device to add
     * @param {ProductPack} newProductPackConfiguration : new product pack configuration
     * @param {String} newProductType : type of the new product
     * @returns {Array<Device>} the added devices (including eventually added distribution). [] if there was an error
     */
    service.addDownstreamDevice = function(parentDevice, newProductPackConfiguration, newProductType) {
        //if parent device is level 1, check we won't create 2 main distributions => if we would, cancel the adding

        if (parentDevice.parent === null) {
            var mainDistributionUpstreamDevice = service.getMainDistributionUpstreamDevice();
            if (mainDistributionUpstreamDevice !== null && mainDistributionUpstreamDevice !== parentDevice) {
                return null;
            }
        }

        var addedProduct = addCommercialProduct(newProductPackConfiguration, newProductType);
        var addedDevices = [];
        var addedDevice = null;

        if (addedProduct !== null) {
            if (parentDevice.hasNoChildren()) {
                //we must create a distribution between the parent electrical device and the child
                var distributionDevice = addDistribution(parentDevice);
                addedDevices.push(distributionDevice);
                if (distributionDevice !== null) {
                    addedDevice = distributionDevice.addDownstreamDevice(addedProduct, newProductPackConfiguration, newProductType, newProductPackConfiguration.quantity);
                    addedDevices.push(addedDevice);
                }
            } else {
                //the parent already has children => the parent is already a distribution. We can place the device directly downstream
                addedDevice = parentDevice.addDownstreamDevice(addedProduct, newProductPackConfiguration, newProductType, newProductPackConfiguration.quantity);
                addedDevices.push(addedDevice);
            }
        }

        return addedDevices;
    };

    /**
     * @description (public method) adds a parallel device in the network, and updates the whole project consequently
     * @param {Device} brotherDevice : brother of the new device to add
     * @param {ProductPack} newProductPackConfiguration : new product pack configuration
     * @param {String} newProductType : type of the new product
     * @returns {Device} the added device. null if there was an error
     */
    service.addParallelDevice = function(brotherDevice, newProductPackConfiguration, newProductType) {
        var addedDevice = null;
        if (brotherDevice.parent === null) {
            //the device is to be placed at the root of the network
            addedDevice = addIncomerDeviceToNetwork(newProductPackConfiguration, newProductType);
        } else {
            //the parent device is by construction a distribution
            var addedProduct = addCommercialProduct(newProductPackConfiguration, newProductType);
            if (addedProduct !== null) {
                addedDevice = brotherDevice.parent.addDownstreamDevice(addedProduct, newProductPackConfiguration, newProductType, newProductPackConfiguration.quantity);
            }
        }

        return addedDevice;
    };

    /**
     * @description (public method) modifies device in the network, and updates the whole project consequently. The modification must leave the device type intact
     * @param {Device} device : device to modify
     * @param {ProductPack} newProductPackConfiguration : new product pack configuration
     * @returns {Device} the modified device. null if there was an error
     */
    service.modifyDevice = function(device, newProductPackConfiguration) {
        var basket = matchDeviceTypeWithBasket(device.type);
        var oldProductPack = basket.searchProductPack(device.product);

        modifyProductService.modifyElectricProductPack(oldProductPack, newProductPackConfiguration);

        device.product = newProductPackConfiguration.product;
        device.productPack = newProductPackConfiguration;
        device.quantity = newProductPackConfiguration.quantity;

        return device;
    };

    /**
     * @description (public method) modifies device quantity in the network, and updates the whole project consequently. The modification must leave the device type intact
     * @param {ProductPack} device : device to modify
     * @param {Device} newProductPackConfiguration : new product pack configuration
     * @returns {Device} the modified device. null if there was an error
     */
    service.updateDeviceQuantity = function(device, quantity) {
        device.quantity = quantity;

        //HACK AFT: synchronization pb between basket and switchboard device productPack, quantity has to be updated on the two objects
        //basket productPack
        var basket = matchDeviceTypeWithBasket(device.type);
        var basketProductPack = basket.searchProductPack(device.product);
        basketProductPack.quantity  = quantity;
        //switchboard device productPack
        device.productPack.quantity = quantity;
    };

    /**
     * @description (public method) modifies distribution in the network, and updates the whole project consequently.
     *              No distribution is a possible value for old distribution product and for newProductPackConfiguration...
     * @param {Device} distributionDevice : distribution device to modify
     * @param {ProductPack} newProductPackConfiguration : new product pack configuration
     * @returns {Device} the modified distribution. null if there was an error
     */
    service.modifyDistribution = function(distributionDevice, newProductPackConfiguration) {
        var oldProductPack = Project.current.selectedSwitchboard.distributionBasket.searchProductPack(distributionDevice.product);

        if (newProductPackConfiguration === null) {
            Project.current.selectedSwitchboard.distributionBasket.searchAndDecreaseProductPack(distributionDevice.product);
            distributionDevice.product = getNoDistributionFakeProduct();
            return distributionDevice;
        } else if (oldProductPack === null) {
            var addedProduct = addCommercialProduct(newProductPackConfiguration, service.distributionType);
            distributionDevice.product = addedProduct;
            return distributionDevice;
        } else {
            modifyProductService.modifyDistributionProductPack(oldProductPack, newProductPackConfiguration);
        }

        distributionDevice.product = newProductPackConfiguration.product;

        return distributionDevice;
    };

    /**
     * @description (Private recursive method) deletes a device in the network, with its children
     * @param {Device} deviceToDelete : device to delete
     */
    var deleteDeviceRecursively = function(deviceToDelete) {
        if(deviceToDelete === undefined) {
            return [];
        }

        var deletedDevices = [];
        //decrease the quantity of the product corresponding to this device
        var basket = matchDeviceTypeWithBasket(deviceToDelete.type);
        basket.searchAndRemoveProductPack(deviceToDelete.product);

        //delete all children of this device
        _.each(deviceToDelete.children, function(child) {
            var deletedChildren = deleteDeviceRecursively(child);
            deletedDevices = deletedDevices.concat(deletedChildren);
        });

        //delete finally this device
        deviceToDelete.deleteDevice();
        deletedDevices.push(deviceToDelete);

        return deletedDevices;
    };

    /**
     * @description (public method) deletes a device in the network, with its children
     * @param {Device} deviceToDelete : device to delete
     */
    service.deleteDevice = function(deviceToDelete) {
        var oldParent = deviceToDelete.parent;

        var deletedDevices = deleteDeviceRecursively(deviceToDelete);

        if (oldParent === null) {
            Project.current.selectedSwitchboard.network.deleteIncomerDevice(deviceToDelete);
        } else {
            if (oldParent.children.length === 0) {
                var deletedParent = deleteDeviceRecursively(oldParent);
                deletedDevices = deletedDevices.concat(deletedParent);
            }
        }

        return deletedDevices;
    };

    /**
     * @description (public method) deletes a device in the network, keeping its children in network. Children are placed at the old place of the deleted device
     * @param {Device} deviceToDelete : device to delete
     */
    service.deleteDeviceAndKeepChildren = function(deviceToDelete){
        var deletedDevices = [];
        var deviceToDeleteParent = deviceToDelete.parent;

        if (deviceToDelete.children.length > 0) {
            var deviceToDeleteIndex = service.getChildIndex(deviceToDelete);

            //place children device right after their parent
            _.each(deviceToDelete.children[0].children, function(child) {
                deviceToDeleteIndex++;
                var deletedDistribution = service.moveDevice(child, deviceToDeleteParent, deviceToDeleteIndex, null).deletedDevice;
                if (deletedDistribution !== null) {
                    deletedDevices.push(deletedDistribution);
                }
            });
        }

        var basket = matchDeviceTypeWithBasket(deviceToDelete.type);
        basket.searchAndRemoveProductPack(deviceToDelete.product);
        if (deviceToDeleteParent === null) {
            Project.current.selectedSwitchboard.network.deleteIncomerDevice(deviceToDelete);
        } else {
            deviceToDelete.deleteDevice();
            //If parent has no more children, delete it
            if(deviceToDeleteParent.children.length === 0){
                basket = matchDeviceTypeWithBasket(deviceToDeleteParent.type);
                basket.searchAndRemoveProductPack(deviceToDeleteParent.product);
                deviceToDeleteParent.deleteDevice();
                deletedDevices.push(deviceToDeleteParent);
            }
        }
        deletedDevices.push(deviceToDelete);

        return deletedDevices;
    };

    /**
     * @description (public method) find the device matching the product to remove then delete it
     * @param {Product} productToDelete : product to delete
     * @param {boolean} deleteChildren
     */
    service.deleteProduct = function(productToDelete, deleteChildren) {
        var foundDevice = walkThroughDevices(productToDelete, Project.current.selectedSwitchboard.network.incomerDevices);

        if(foundDevice !== null) {
            if (deleteChildren){
                this.deleteDevice(foundDevice);
            } else {
                this.deleteDeviceAndKeepChildren(foundDevice);
            }

        }
    };

    /**
     * @description (public method) find the device matching the product to update and proceed if found
     * @param {Product} oldProduct : product to update
     * @param {ProductPack} newProductPack : new version to use
     */
    service.modifyProduct = function(oldProduct, newProductPack) {
        var foundDevice = walkThroughDevices(oldProduct, Project.current.selectedSwitchboard.network.incomerDevices);

        if(foundDevice !== null) {
            this.modifyDevice(foundDevice, newProductPack);
        }
    };

    /**
     * @description (public method) moves a device in the network, with its children
     * @param {Device} deviceToMove : device to move
     * @param {Device} newParentDevice : new parent device. null if the device becomes an incomer
     * @param {Number} childIndex : the position of this device among its parent's children (0 for becoming the first child). This parameter is necessary only if the device is not alone on its new position
     * @param {Device} distributionDownstream : distribution and children to be linked to the device to move
     * @returns {Object} a composed object reflecting the operations of this move, with 3 properties :
     *      -{Device} movedDevice
     *      -{Device} deletedDevice
     *      -{Device} addedDevices
     */
    service.moveDevice = function(deviceToMove, newParentDevice, childIndex, distributionDownstream) {
        var returnedObject = {
          'movedDevice' : deviceToMove,
          'deletedDevice' : null,
          'addedDevices' : []
        };

        //region pre-moving (business) rules
        // do not move a device if it would create a second main distribution
        if (newParentDevice !== null && newParentDevice.parent === null) {
            var mainDistributionUpstreamDevice = service.getMainDistributionUpstreamDevice();
            // check if by moving the device, we would delete the main distribution
            if (mainDistributionUpstreamDevice !== null && (mainDistributionUpstreamDevice !== deviceToMove)) {
                var distributionFirstChildren = mainDistributionUpstreamDevice.children[0].children[0];
                if (mainDistributionUpstreamDevice.children[0].children.length === 1 && deviceToMove === distributionFirstChildren){
                    // we are deleting it => do the move
                } else {
                    // we are not deleting it => return here
                    return returnedObject;
                }
            }
        }
        //endregion

        // keep state before moving the device in order to apply post-moving rules correctly
        var oldParent = deviceToMove.parent;

        //region Move the device
        if (newParentDevice === null) {
            if (deviceToMove.parent !== null) {
                // move the device to the root of the network
                deviceToMove.cutFromParent();
                Project.current.selectedSwitchboard.network.addIncomerDevice(deviceToMove);
            }

            Project.current.selectedSwitchboard.network.moveIncomerDevice(deviceToMove, childIndex);

        } else {
            if (newParentDevice.hasNoChildren()) {

                deviceToMove.cutFromParent();
                //move the device to a leaf => add a distribution, then add the child
                var distributionDevice = addDistribution(newParentDevice);
                if (distributionDevice !== null) {
                    //as we needed a new distribution, there is no other child => child index is 0
                    deviceToMove.connectToParent(distributionDevice, 0);
                    returnedObject.addedDevices.push(distributionDevice);
                } else {
                    logger.error(gettextCatalog.getString('ERROR_UNEXPECTED'), 'impossible to create distribution', 'moveDevice', false);
                    return null;
                }
            } else {
                //move the device as a child
                deviceToMove.moveDevice(newParentDevice, childIndex);
            }
        }
        //endregion

        //region post-moving (business) rules
        if (oldParent === null && newParentDevice !== null) {
            //remove deviceToMove from the list of the incomer devices
            Project.current.selectedSwitchboard.network.deleteIncomerDevice(deviceToMove);
        } else if (oldParent !== null && oldParent.children.length === 0) {
            // only one distribution is removed
            returnedObject.deletedDevice = deleteDeviceRecursively(oldParent)[0];
        }

        // in case of insertion between device and its downstream distribution: replace old parent device by new
        if (distributionDownstream !== null && deviceToMove.children.length === 0 && distributionDownstream !== returnedObject.deletedDevice ) {
            distributionDownstream.cutFromParent();
            distributionDownstream.connectToParent(deviceToMove, 0);
        }
        //endregion

        return returnedObject;
    };

    /**
     * @description (public method) clears network completely
     */
    service.clearNetwork = function() {
        var switchboard = Project.current.selectedSwitchboard;
        switchboard.network.clearNetwork();
        switchboard.electricBasket.clearProducts();
        switchboard.mechanicBasket.clearProducts();
        switchboard.distributionBasket.clearProducts();
        switchboard.additionalProductsBasket.clearProducts();
    };

    /**
     * @description (public method) find if the given product have children
     * @param {Product} product : product to check
     * @return {Boolean} True if the product has at least one child, false otherwise
     */
    service.productHaveChildren = function(product) {
        var foundDevice = walkThroughDevices(product, Project.current.selectedSwitchboard.network.incomerDevices);

        return (foundDevice !== null && foundDevice.children.length > 0);
    };

    /**
     * @description (public method) Returns the index of a device among its parent's children
     * @returns {Number} if the device is the first child of its parent, returns 0
     *                   if the device is the second child of its parent, returns 1
     *                   etc.
     */
    service.getChildIndex = function(device) {
        var parentChildren;
        if (device.parent !== null) {
            parentChildren = device.parent.children;
        } else {
            parentChildren = Project.current.selectedSwitchboard.network.incomerDevices;
        }

        for (var i=0; i< parentChildren.length; i++){
            if (device === parentChildren[i]) {
                return i;
            }
        }
        return null;
    };

    /**
     * @description (public method) copy and paste a device
     * @param {Device} device : device to copy
     * @param {Device} newParent : the parent which will be upstream the pasted device (null if the device should be pasted as an incomer)
     * @param {Boolean} true for copying/pasting children as well
     * @return {Device[]} added devices
     */
    service.copyPasteDevice = function(device, newParent, childIndex, duplicateChildren){
        var addedDevices = [];

        //copy paste device
        var basket = matchDeviceTypeWithBasket(device.type);
        var deviceProductPack = basket.searchProductPack(device.product);
        var productPackCopy;
        if (deviceProductPack === null) {
            productPackCopy = new ProductPack(getNoDistributionFakeProduct(), 1, null, null);
        } else {
            productPackCopy = new ProductPack(device.product.clone(), device.quantity, deviceProductPack.rangeItem, deviceProductPack.characteristics);
        }
        var deviceCopy;
        if (newParent === null){
            deviceCopy = [addIncomerDeviceToNetwork(productPackCopy, device.type)];
        } else {
            if (newParent.type === service.electricalDeviceType && newParent.children.length > 0){
                deviceCopy = service.addDownstreamDevice(newParent.children[0], productPackCopy, device.type);
            } else {
                deviceCopy = service.addDownstreamDevice(newParent, productPackCopy, device.type);
            }
        }
        addedDevices = addedDevices.concat(deviceCopy);

        if (duplicateChildren && device.children.length > 0) {
            //copy paste its children
            var childrenAddedDevices = [];
            //get the device copy (excluding the distribution we might have added)
            var parentDevice = deviceCopy[deviceCopy.length - 1];

            for (var i = 0; i < device.children[0].children.length; i++) {
                childrenAddedDevices = childrenAddedDevices.concat(service.copyPasteDevice(device.children[0].children[i], parentDevice, true));
            }

            //modify distribution between device and children (it is already placed in childrenAddedDevices)
            var distributionAddedDevice = parentDevice.children[0];
            if (device.children[0].product.parts[0].part.partCode !== '') {
                var distributionProductPack = Project.current.selectedSwitchboard.distributionBasket.searchProductPack(device.children[0].product);
                distributionAddedDevice = service.modifyDistribution(parentDevice.children[0], distributionProductPack.clone());
            }

            addedDevices = addedDevices.concat(childrenAddedDevices);
        }

        return addedDevices;
    };

    /**
     * @description (public method) duplicates a device
     * @param {Device} device : device to duplicate
     * @param {Boolean} true for duplicating children as well
     * @return {Device[]} duplicated devices
     */
    service.duplicateDevice = function(device, duplicateChildren){
        var duplicatedDevices = service.copyPasteDevice(device, device.parent, service.getChildIndex(device) + 1, duplicateChildren);
        return duplicatedDevices;
    };

    /**
     * @description (public method) ungroup a device in 2 devices side-to-side
     * @param {Device} device : device to ungroup
     * @param {Number} quantity : quantity of the bottom device which will be duplicated - the initial device, placed on the top, will see its quantity decrease from this number
     * @return {Device[]} Array of 2 devices : the initial device and the ungrouped device
     */
    service.ungroupDevice = function(device, quantityToUngroup) {
        var ungroupedDevices = [];

        var deviceProductPack = device.productPack;

        if (deviceProductPack.quantity <= quantityToUngroup || quantityToUngroup <= 0){
            //impossible to ungroup this device with these quantities
            return [];
        }

        //duplicate device
        var duplicatedDevice = service.duplicateDevice(device, false)[0];
        //move the duplicated device right under the original device
        service.moveDevice(duplicatedDevice, device.parent, service.getChildIndex(device) + 1, null);

        //update quantities
        var duplicatedDeviceProductPack = duplicatedDevice.productPack;
        deviceProductPack.quantity -= quantityToUngroup;
        duplicatedDeviceProductPack.quantity = quantityToUngroup;
        service.modifyDevice(device, deviceProductPack);
        service.modifyDevice(duplicatedDevice, duplicatedDeviceProductPack);

        //return ungrouped devices
        ungroupedDevices.push(device);
        ungroupedDevices.push(duplicatedDevice);
        return ungroupedDevices;
    };

    /**
     * @description (public method) ungroup a device in single devices
     * @param {Device} device : device to ungroup
     * @return {Device[]} Array of all single devices
     */
    service.ungroupAllDevice = function(device) {
        var ungroupedDevices = [];

        var quantity = device.quantity;

        //set 'template device' to duplicate at quantity 1
        device.quantity = 1;

        //HACK AFT: synchronization pb between basket and switchboard device productPack, quantity has to be updated on the two objects
        //basket productPack
        var basket = matchDeviceTypeWithBasket(device.type);
        var basketProductPack = basket.searchProductPack(device.product);
        basketProductPack.quantity  = 1;
        //switchboard device productPack
        device.productPack.quantity = 1;

        for (var i = 0; i < (quantity - 1); i++){
            //duplicate device
            var duplicatedDevice = service.duplicateDevice(device, false)[0];
            //move the duplicated device right under the original device
            service.moveDevice(duplicatedDevice, device.parent, service.getChildIndex(device) + i, null);

            ungroupedDevices.push(duplicatedDevice);
        }

        return ungroupedDevices;
    };

    return service;
});
