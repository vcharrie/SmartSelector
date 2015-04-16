'use strict';

/**
 * @description save load service : contains methods to serialize/deserialize model objects
 * @class angular_module.business.saveLoadService
 */
angular.module('business').service('saveLoadService', function(_, Network, Device, Product, Part, ProductPack, Basket, PartPack, Solution, Filter, Characteristic, RangeItem, Switchboard, SwitchboardPack) {
    /*
   * Service public interface
   */
    var service = {

    };

    /**
     * @param {Filter} filter part to savepriceListId
     * @return {Object} : object containing information needed to create new instance of the filter
     */
    service.saveFilter = function(filter) {
        if (!filter) {
            return filter;
        }
        var savedObject = {};
        savedObject.characteristic = filter.characteristic;
        savedObject.constraint = filter.constraint;
        savedObject.value = filter.value;

        return savedObject;
    };

    /**
     * @param {Object} savedObject object containing information needed to create new instance of the filter
     * @return {Filter} : filter to load
     */
    service.loadFilter = function(savedObject) {
        if (!savedObject) {
            return null;
        }
        return new Filter(savedObject.characteristic,
            savedObject.constraint,
            savedObject.value);
    };

    /**
     *
     * @param {RangeItem} rangeItem
     * @returns {Object}
     */
    service.saveRangeItem = function(rangeItem) {
        if (!rangeItem) {
            return rangeItem;
        }
        var savedObject = {};
        savedObject.rangeName = rangeItem.rangeName;
        // TODO : use a real object mainCharacteristics property
        savedObject.mainCharacteristics = rangeItem.mainCharacteristics;
        savedObject.type = rangeItem.type;
        savedObject.levelType = rangeItem.levelType;
        savedObject.metaRanges = rangeItem.metaRanges;
        savedObject.auxiliariesRangeName = rangeItem.auxiliariesRangeName;
        savedObject.auxiliariesFilters = rangeItem.auxiliariesFilters;
        savedObject.sections = rangeItem.sections;
        savedObject.projectContextFiltersIgnored = rangeItem.projectContextFiltersIgnored ;
        savedObject.permanentFilters = [];
        if (rangeItem.permanentFilters) {
            rangeItem.permanentFilters.forEach(function(permanentFilter) {
                savedObject.permanentFilters.push(service.saveFilter(permanentFilter));
            });
        }
        return savedObject;
    };

    /**
     *
     * @param {Object} savedObject
     * @returns {RangeItem}
     */
    service.loadRangeItem = function(savedObject) {
        if (!savedObject) {
            return null;
        }
        var permanentFilters = [];
        savedObject.permanentFilters.forEach(function(permanentFilter) {
            permanentFilters.push(service.loadFilter(permanentFilter));
        });
        return new RangeItem(savedObject.rangeName, savedObject.type, null, savedObject.mainCharacteristics, permanentFilters, savedObject.projectContextFiltersIgnored, savedObject.metaRanges, savedObject.auxiliariesRangeName, savedObject.auxiliariesFilters, savedObject.sections, savedObject.levelType);
    };

    /**
     * @param {Characteristic} characteristic to save
     * @return {Object} : object containing information needed to create new instance of the characteristic
     */
    service.saveCharacteristic = function(characteristic) {
        if (!characteristic) {
            return characteristic;
        }
        var savedObject = {};
        savedObject.name = characteristic.name;
        savedObject.selectedValue = characteristic.selectedValue;
        savedObject.displayValue = characteristic.displayValue;
        savedObject.values = characteristic.values;
        savedObject.additionalValues = characteristic.additionalValues;
        savedObject.filterElectric = characteristic.filterElectric;
        savedObject.filterMechanic = characteristic.filterMechanic;
        savedObject.sourcedFromEnclosuresDB = characteristic.sourcedFromEnclosuresDB;
        savedObject.unit = characteristic.unit;
        savedObject.displayFilter = characteristic.displayFilter;
        savedObject.displayInProjectContext = characteristic.displayInProjectContext;

        return savedObject;
    };

    /**
     * @param {Object} savedObject object containing information needed to create new instance of the characteristic
     * @return {Characteristic} : characteristic to load
     */
    service.loadCharacteristic = function(savedObject) {
        if (!savedObject) {
            return null;
        }

        var selectedValue = savedObject.selectedValue;
        if(!selectedValue) {
            selectedValue = savedObject._selectedValue;
        }

        var characteristic = new Characteristic(savedObject.name,
            selectedValue,
            savedObject.additionalValues,
            savedObject.filterElectric,
            savedObject.filterMechanic,
            savedObject.sourcedFromEnclosuresDB,
            savedObject.unit,
            savedObject.displayFilter,
            savedObject.displayInProjectContext,
            savedObject.displayTooltip);

        characteristic.values = savedObject.values;
        characteristic.displayValue = savedObject.displayValue;

        return characteristic;
    };

    /**
     * @param {Part} part to save
     * @return {Object} : object containing information needed to create new instance of the part
     */
    service.savePart = function(part) {
        if (!part) {
            return part;
        }
        var savedObject = {};
        savedObject.partCode = part.partCode;
        savedObject.longName = part.longName;
        savedObject.price = part.price;
        savedObject.resCode = part.resCode;
        savedObject.discount = part.discount;
        savedObject.isAdditional = part.isAdditional;
        savedObject.collection = part.collection;
        savedObject.role = part.role;
        return savedObject;
    };

    /**
     * @param {Object} savedObject object containing information needed to create new instance of the part
     * @return {Part} : part to load
     */
    service.loadPart = function(savedObject) {
        if (!savedObject) {
            return null;
        }
        var part = new Part(savedObject.partCode,
            savedObject.longName,
            savedObject.resCode,
            savedObject.price,
            savedObject.discount);

        part.isAdditional = savedObject.isAdditional;
        part.collection = savedObject.collection ;

        if (savedObject.role){
            part.role = savedObject.role;
        }

        return part;
    };

    /**
     * @param {PartPack} partPack pack to save
     * @return {Object} : object containing information needed to create new instance of the part pack
     */
    service.savePartPack = function(partPack) {
        if (!partPack) {
            return partPack;
        }
        var savedObject = {};
        savedObject.part = service.savePart(partPack.part);
        savedObject.quantity = partPack.quantity;
        return savedObject;
    };

    /**
     * @param {Object} savedObject object containing information needed to create new instance of the part pack
     * @return {PartPack} : part pack to load
     */
    service.loadPartPack = function(savedObject) {
        if (!savedObject) {
            return null;
        }
        return new PartPack(service.loadPart(savedObject.part),
            savedObject.quantity);
    };

    /**
     * @param {Product} product to save
     * @return {Object} : object containing information needed to create new instance of the product
     */
    service.saveProduct = function(product) {
        if (!product) {
            return product;
        }
        var savedObject = {};
        savedObject.parts = [];
        product.parts.forEach(function(partPack) {
            savedObject.parts.push(service.savePartPack(partPack));
        });
        return savedObject;
    };

    /**
     * @param {Object}savedObject  object containing information needed to create new instance of the product
     * @return {Product} : product to load
     */
    service.loadProduct = function(savedObject) {
        if (!savedObject) {
            return null;
        }
        var parts = [];
        savedObject.parts.forEach(function(partPack) {
            parts.push(service.loadPartPack(partPack));
        });
        var product = new Product(parts);
        return product;
    };

    /**
     * @param {ProductPack} productPack product item to save
     * @return {Object} : object containing information needed to create new instance of the product item
     */
    service.saveProductPack = function(productPack) {
        if (!productPack) {
            return productPack;
        }
        var savedObject = {};
        savedObject.product = service.saveProduct(productPack.product);
        savedObject.quantity = productPack.quantity;
        savedObject.characteristics = [];
        if (productPack.characteristics !== undefined && productPack.characteristics !== null){
            productPack.characteristics.forEach(function(characteristic) {
                savedObject.characteristics.push(service.saveCharacteristic(characteristic));
            });
        }

        if (productPack.rangeItem !== undefined && productPack.rangeItem !== null){
            savedObject.rangeItem = service.saveRangeItem(productPack.rangeItem);
        }
        return savedObject;
    };

    /**
     * @param {Object} savedObject object containing information needed to create new instance of the product item
     * @return {ProductPack} : product item to load
     */
    service.loadProductPack = function(savedObject) {
        if (!savedObject) {
            return null;
        }
        var characteristics = [];

        if (savedObject.characteristics !== undefined && savedObject.characteristics !== null){
            savedObject.characteristics.forEach(function(characteristic) {
                characteristics.push(service.loadCharacteristic(characteristic));
            });
        }

        return new ProductPack(service.loadProduct(savedObject.product), savedObject.quantity, service.loadRangeItem(savedObject.rangeItem), characteristics);
    };

    /**
     * @param {Solution}  solution to save
     * @return {Object} : object containing information needed to create new instance of the solution
     */
    service.saveSolution = function(solution) {
        if (!solution) {
            return null;
        }
        var savedObject = {};

        savedObject.quantity = solution.quantity;
        savedObject.parts = solution.parts;
        savedObject.name = solution.name;
        savedObject.height = solution.height;
        savedObject.width = solution.width;
        savedObject.depth = solution.depth;
        savedObject.range = solution.range;
        savedObject.ip = solution.ip;
        savedObject.rows = solution.rows;
        savedObject.numberOfVerticalModules = solution.numberOfVerticalModules;
        savedObject.door = solution.door;
        savedObject.ductDoor = solution.ductDoor;
        savedObject.installation = solution.installation;
        savedObject.isolation = solution.isolation;
        savedObject.modulesWidth = solution.modulesWidth;
        savedObject.freeSpace = solution.freeSpace;
        savedObject.products = [];
        solution.products.forEach(function(productPack) {
            savedObject.products.push(service.saveProductPack(productPack));
        });
        savedObject.mainDistribution = solution.mainDistribution ;
        savedObject.distributions = [] ;
        solution.distributions.forEach(function(distributionItem) {
            savedObject.distributions.push(service.saveProductPack(distributionItem));
        });
        savedObject.functionalUnits = [];
        solution.functionalUnits.forEach(function(functionalUnitItem) {
            savedObject.functionalUnits.push(service.saveProductPack(functionalUnitItem));
        });
        savedObject.compositionScript = solution.compositionScript;
        savedObject.messages = solution.messages;

        return savedObject;
    };

    /**
     * @param {Object} savedObject object containing information needed to create new instance of the solution
     * @return {Solution} : solution to load
     */
    service.loadSolution = function(savedObject) {
        if (!savedObject) {
            return null;
        }
        var products = [];
        savedObject.products.forEach(function(productPack) {
            products.push(service.loadProductPack(productPack));
        });

        var distributions = [];
        savedObject.distributions.forEach(function(distributionItem) {
            distributions.push(service.loadProductPack(distributionItem));
        });

        var functionalUnits = [];
        savedObject.functionalUnits.forEach(function(item) {
            functionalUnits.push(service.loadProductPack(item));
        });

        var solution = new Solution(savedObject.name,
            savedObject.quantity,
            savedObject.parts,
            savedObject.height,
            savedObject.width,
            savedObject.depth,
            savedObject.range,
            savedObject.ip,
            savedObject.rows,
            savedObject.numberOfVerticalModules,
            savedObject.door,
            savedObject.installation,
            savedObject.isolation,
            savedObject.modulesWidth,
            savedObject.ductDoor,
            savedObject.freeSpace,
            savedObject.mainDistribution,
            savedObject.messages,
            []);

        solution.price = 0;
        solution.products = products;
        solution.distributions = distributions;
        solution.functionalUnits = functionalUnits;
        solution.compositionScript = savedObject.compositionScript;

        return solution;
    };



    /**
     * @param {Basket} basket to save
     * @return {Object} : object containing information needed to create new instance of the basket
     */
    service.saveBasket = function(basket) {
        if (!basket) {
            return basket;
        }
        var savedObject = {};
        savedObject.name = basket.name;
        savedObject.list = [];
        basket.list.forEach(function(productPack) {
            savedObject.list.push(service.saveProductPack(productPack));
        });
        return savedObject;
    };

    /**
     * @param {Object} savedObject object containing information needed to create new instance of the basket
     * @return {Basket} : basket to load
     */
    service.loadBasket = function(savedObject) {
        if (!savedObject) {
            return null;
        }
        var basket = new Basket(savedObject.name);
        savedObject.list.forEach(function(productPack) {
            basket.list.push(service.loadProductPack(productPack));
        });
        return basket;
    };

    /**
     * @param {Device} device to save
     * @return {Object} : object containing information needed to create new instance of the device
     */
    service.saveDevice = function(device, electricBasket, distributionBasket) {
        if (!device) {
            return device;
        }
        var savedObject = {};
        savedObject.type = device.type;
        savedObject.quantity = device.quantity;

        var basket = (savedObject.type === 'distribution') ? distributionBasket : electricBasket;
        savedObject.basketIndex = basket.list.indexOf(basket.searchProductPack(device.product));

        savedObject.children = [];
        device.children.forEach(function(child){
            savedObject.children.push(service.saveDevice(child, electricBasket, distributionBasket));
        });

        return savedObject;
    };

    // create fake distribution if distribution Device is "empty"
    var getNoDistributionFakeProduct = function() {
        var partCode = '';
        var longName = 'switchboard-organisation-no-distribution-label';
        var resCode ='';
        var price = 0;
        var discount = 0;
        var dataSheetUrl = '';

        var part = new Part(partCode, longName, resCode, price, discount, dataSheetUrl);
        var partPack = new PartPack(part, 1);
        return  new Product([partPack]);
    };

    /**
     * @param {Object} savedObject object containing information needed to create new instance of the device
     * @param {Function} onElementChanged
     * @return {Device} : device to load
     */
    service.loadDevice = function(savedObject, network, electricBasket, distributionBasket) {
        if (!savedObject) {
            return null;
        }

        var basket = (savedObject.type === 'distribution') ? distributionBasket : electricBasket;

        var device = null;
        if(savedObject.basketIndex !== -1) {
            device = new Device(basket.list[savedObject.basketIndex].product, basket.list[savedObject.basketIndex], savedObject.type, null, network, savedObject.quantity);
        }
        else {
            var fakeProduct = getNoDistributionFakeProduct();
            var fakeProductPack = new ProductPack(fakeProduct, savedObject.quantity, null, null);
            device = new Device(fakeProduct, fakeProductPack, savedObject.type, null, network, savedObject.quantity);
        }

        savedObject.children.forEach(function(child){
            var childDevice = service.loadDevice(child, network, electricBasket, distributionBasket);
            childDevice.parent = device;
            device.children.push(childDevice);
        });

        return device;
    };


    /**
     * @param {Network} network to save
     * @return {Object} : object containing information needed to create new instance of the network
     */
    service.saveNetwork = function(network, electricBasket, distributionBasket) {
        if (!network) {
            return network;
        }
        var savedObject = {};
        savedObject.name = network.name;
        savedObject.incomerDevices = [];
        network.incomerDevices.forEach(function(device) {
            savedObject.incomerDevices.push(service.saveDevice(device, electricBasket, distributionBasket));
        });
        return savedObject;
    };

    /**
     * @param {Object} savedObject object containing information needed to create new instance of the network
     * @param {Basket} electricBasket (needed for linking network and baskets)
     * @param {Basket} distributionBasket (needed for linking network and baskets)
     * @return {Network} : network to load
     */
    service.loadNetwork = function(savedObject, electricBasket, distributionBasket) {
        if (!savedObject) {
            return null;
        }
        var network = new Network(savedObject.name);
        savedObject.incomerDevices.forEach(function(device) {
            network.incomerDevices.push(service.loadDevice(device, network, electricBasket, distributionBasket));
        });
        return network;
    };

    /**
     * @param {Switchboard} switchboard to save
     * @return {Object} : object containing information needed to create new switchboard
     */
    service.saveSwitchboard = function(switchboard) {
        if (!switchboard) {
            return switchboard;
        }
        var savedObject = {};
        savedObject.name = switchboard.name;

        savedObject.isSolutionDirty = switchboard.isSolutionDirty;
        savedObject.isSmartPanelDirty = switchboard.isSmartPanelDirty;
        savedObject.electricBasket = service.saveBasket(switchboard.electricBasket);
        savedObject.mechanicBasket = service.saveBasket(switchboard.mechanicBasket);
        savedObject.distributionBasket = service.saveBasket(switchboard.distributionBasket);
        savedObject.functionalUnitsBasket = service.saveBasket(switchboard.functionalUnitsBasket);
        savedObject.additionalProductsBasket = service.saveBasket(switchboard.additionalProductsBasket);
        savedObject.additionalItemsBasket = service.saveBasket(switchboard.additionalItemsBasket);
        savedObject.enclosureSolutionWishes = switchboard.enclosureSolutionWishes;

        var characteristics = [];
        switchboard.contextCharacteristics.forEach(function(characteristic) {
            characteristics.push(service.saveCharacteristic(characteristic));
        });
        savedObject.contextCharacteristics = characteristics;

        savedObject.network = service.saveNetwork(switchboard.network, switchboard.electricBasket, switchboard.distributionBasket);

        // don't save enclosure solutions if solution is dirty (it will force a new solution computing when the project is open)
        if (!savedObject.isSolutionDirty) {
            savedObject.enclosureSolution = service.saveSolution(switchboard.enclosureSolution);
        }

        //BEGIN crade
        if (savedObject.isSolutionDirty) {
            savedObject.mechanicBasket.list = [];
            savedObject.functionalUnitsBasket.list = [];
        }
        //END crade

        return savedObject;
    };

    /**
     * @param {SwitchboardPack} switchboardPack to save
     * @return {Object} : object containing information needed to create new switchboard pack
     */
    service.saveSwitchboardPack = function(switchboardPack) {
        if (!switchboardPack) {
            return switchboardPack;
        }
        var savedObject = {};
        savedObject.quantity = switchboardPack.quantity;
        savedObject.type = switchboardPack.type;
        savedObject.isSelectedForBom = switchboardPack.isSelectedForBom;
        savedObject.switchboard = service.saveSwitchboard(switchboardPack.switchboard);
        return savedObject;
    };

    /**
     * @param {Array} switchboardPacks to save
     * @return {Array} : array containing information needed to create new switchboard packs
     */
    service.saveSwitchboardPacks = function(switchboardPacks) {
        if (!switchboardPacks) {
            return switchboardPacks;
        }
        var savedObject = [];
        switchboardPacks.forEach(function(switchboardPack) {
           savedObject.push(service.saveSwitchboardPack(switchboardPack));
        });
        return savedObject;
    };

    /**
     * @param {Object} savedObject switchboard to load
     * @param {Function} onSwitchboardChanged callback
     * @return {Switchboard} : loaded switchboard
     */
    service.loadSwitchboard = function(savedObject, onSwitchboardChanged) {
        if (!savedObject) {
            return savedObject;
        }

        var switchboard = new Switchboard(savedObject.name, onSwitchboardChanged);
        switchboard.isSolutionDirty = savedObject.isSolutionDirty;
        switchboard.isSmartPanelDirty = (typeof savedObject.isSmartPanelDirty === 'undefined' ? true : savedObject.isSmartPanelDirty);
        switchboard.electricBasket = service.loadBasket(savedObject.electricBasket);
        switchboard.mechanicBasket = service.loadBasket(savedObject.mechanicBasket);
        switchboard.distributionBasket = service.loadBasket(savedObject.distributionBasket);
        switchboard.functionalUnitsBasket = service.loadBasket(savedObject.functionalUnitsBasket);
        switchboard.additionalProductsBasket = service.loadBasket(savedObject.additionalProductsBasket);
        switchboard.additionalItemsBasket = service.loadBasket(savedObject.additionalItemsBasket);
        switchboard.setBasketChangedCallback();

        for(var wishName in savedObject.enclosureSolutionWishes) {
            if (savedObject.enclosureSolutionWishes.hasOwnProperty(wishName)) {
                var wish = service.loadCharacteristic(savedObject.enclosureSolutionWishes[wishName]);
                switchboard.enclosureSolutionWishes[wishName] = wish;
            }
        }

        // load characteristics
        var characteristics = [];
        savedObject.contextCharacteristics.forEach(function(characteristic) {
            characteristics.push(service.loadCharacteristic(characteristic));
        });
        switchboard.contextCharacteristics = characteristics;

        switchboard.network = service.loadNetwork(savedObject.network, switchboard.electricBasket, switchboard.distributionBasket);
        switchboard.enclosureSolution = service.loadSolution(savedObject.enclosureSolution);
        return switchboard;
    };

    /**
     * @param {Object} savedObject switchboardPack to load
     * @param {Function} onSwitchboardChanged callback
     * @return {SwitchboardPack} : loaded switchboard pack
     */
    service.loadSwitchboardPack = function(savedObject, onSwitchboardChanged) {
        if (!savedObject) {
            return savedObject;
        }
        return new SwitchboardPack(service.loadSwitchboard(savedObject.switchboard, onSwitchboardChanged), savedObject.quantity, savedObject.isSelectedForBom, savedObject.type);
    };

    /**
     * @param {Array} savedObjects switchboardPacks to load
     * @param {Function} onSwitchboardChanged callback
     * @return {Array} : array containing loaded switchboard packs
     */
    service.loadSwitchboardPacks = function(savedObjects, onSwitchboardChanged) {
        if (!savedObjects) {
            return savedObjects;
        }
        var switchboardPacks = [];
        savedObjects.forEach(function(savedObject) {
            switchboardPacks.push(service.loadSwitchboardPack(savedObject, onSwitchboardChanged));
        });
        return switchboardPacks;
    };

    return service;
});