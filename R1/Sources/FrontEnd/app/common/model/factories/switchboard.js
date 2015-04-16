'use strict';

/**
 * @class angular_module.business.Switchboard
 * @description Switchboard data model
 */
angular.module('model').factory('Switchboard', function(_, characteristicsHelper, Basket, Network, Characteristic) {

    /**
     * @property {boolean} isSolutionDirty
     * @property {boolean} isSmartPanelDirty
     * @property {Characteristic[]} contextCharacteristics
     * @property {Characteristic[]} enclosureCharacteristics
     * @property {Characteristic[]} mainDistributionCharacteristics
     * @property {Solution} enclosureSolution
     * @property {Number} version
     * @property {Basket} electricBasket
     * @property {Basket} mechanicBasket
     * @property {Basket} distributionBasket
     * @property {Function} onSwitchboardChanged
     * @property (Object) enclosureSolutionWishes
     *
     * @param {String} name
     * @param {Function} onSwitchboardChanged
     * @constructor
     */
    var Switchboard = function (name, onSwitchboardChanged) {

        this._name = name;
        this._enclosureSolutionWishes = {};

        this.isSolutionDirty = false;
        this.isSmartPanelDirty = false;

        this.contextCharacteristics = [];
        this.enclosureCharacteristics = [];
        this.mainDistributionCharacteristics = [];
        this.enclosureSolution = null;

        this.electricBasket = new Basket('electricBasket');
        this.mechanicBasket =  new Basket('mechanicBasket');
        this.distributionBasket =  new Basket('distributionBasket');
        this.functionalUnitsBasket =  new Basket('functionalUnitsBasket');
        this.additionalProductsBasket =  new Basket('additionalProductsBasket');
        this.additionalItemsBasket = new Basket('additionalItemsBasket');
        this.network = new Network('electricalDevicesNetwork');

        this.setBasketChangedCallback();

        this.onSwitchboardChanged = onSwitchboardChanged;
    };

    Switchboard.prototype = {
        /**
         *
         * @returns {String}
         */
        get name() {
            return this._name;
        },
        /**
         *
         * @param {String} val
         */
        set name(val) {
            if (val !== this._name && val && val.trim().length > 0) {
                this._name = val;
                if (this.onSwitchboardChanged) {
                    this.onSwitchboardChanged();
                }
            }
        },
        /**
         *
         * @returns {Object}
         */
        get enclosureSolutionWishes() {
            return this._enclosureSolutionWishes;
        },
        /**
         *
         * @param {Object} val
         */
        set enclosureSolutionWishes(val) {
            if (val) {
                this._enclosureSolutionWishes = val;
            }
        }
    };

    /**
     *
     * @param hasImpactOnSmartPanel {boolean} true if a change has an impact on the smart panel. False otherwise
     * @returns {Function}
     */
    Switchboard.prototype.onBasketChanged = function(hasImpactOnSmartPanel) {
        var that = this;
        return function () {
            that.isSolutionDirty = true;
            if(hasImpactOnSmartPanel) {
                that.isSmartPanelDirty = true;
            }
            if (that.onSwitchboardChanged) {
                that.onSwitchboardChanged();
            }
        };
    };

    Switchboard.prototype.setBasketChangedCallback = function() {
        this.electricBasket.onElementChanged = this.onBasketChanged(true);
        this.mechanicBasket.onElementChanged = this.onBasketChanged(false);
        this.distributionBasket.onElementChanged = this.onBasketChanged(false);
        this.functionalUnitsBasket.onElementChanged = this.onBasketChanged(false);
        this.additionalProductsBasket.onElementChanged = this.onBasketChanged(true);
        this.additionalItemsBasket.onElementChanged = this.onBasketChanged(true);
    };

    /**
     *
     * @returns {void}
     */
    Switchboard.prototype.loadContextCharacteristics = function(characteristics,onCharacteristicChanged,reloadContextCharacteristics) {
        var that=this;
        if (that.contextCharacteristics.length === 0 || reloadContextCharacteristics) {

            that.contextCharacteristics = [];

            _.each(characteristics.contextCharacteristics.characteristics, function (characteristic) {
                //if the array possibleValues is empty, it means that this characteristic is bound to database
                that.contextCharacteristics.push(new Characteristic(
                    characteristic.name,
                    characteristic.defaultValue,
                    characteristic.additionalValues,
                    characteristic.filterElectric,
                    characteristic.filterMechanic,
                    characteristic.sourcedFromEnclosuresDB,
                    characteristic.unit,
                    characteristic.displayFilter,
                    characteristic.displayInProjectContext,
                    characteristic.displayTooltip
                ));
            });
        }

        if (that.enclosureCharacteristics.length === 0) {
            _.each(characteristics.enclosureCharacteristics.characteristics, function (characteristic) {
                //if the array possibleValues is empty, it means that this characteristic is bound to database
                that.enclosureCharacteristics.push(new Characteristic(
                    characteristic.name,
                    characteristic.defaultValue,
                    characteristic.additionalValues,
                    characteristic.filterElectric,
                    characteristic.filterMechanic,
                    characteristic.sourcedFromEnclosuresDB,
                    characteristic.unit,
                    characteristic.displayFilter
                ));
            });
        }

        if (that.mainDistributionCharacteristics.length === 0) {
            _.each(characteristics.mainDistributionCharacteristics.characteristics, function (characteristic) {
                //if the array possibleValues is empty, it means that this characteristic is bound to database
                that.mainDistributionCharacteristics.push(new Characteristic(
                    characteristic.name,
                    characteristic.defaultValue,
                    characteristic.additionalValues,
                    characteristic.filterElectric,
                    characteristic.filterMechanic,
                    characteristic.sourcedFromEnclosuresDB,
                    characteristic.unit,
                    characteristic.displayFilter
                ));
            });
        }

        for (var i = 0; i < this.contextCharacteristics.length; i++) {
            that.contextCharacteristics[i].onSelectedValueChanged = onCharacteristicChanged;
        }


    };
    /**
     *
     * @returns {number}
     */
    Switchboard.prototype.getTotalPrice = function() {
        var price = this.electricBasket.getTotalPrice() + this.mechanicBasket.getTotalPrice() + this.distributionBasket.getTotalPrice()  + this.functionalUnitsBasket.getTotalPrice() + this.additionalProductsBasket.getTotalPrice() + this.additionalItemsBasket.getTotalPrice();
        return Math.round(price * 100) / 100;
    };

    /**
     * @description Return the net price of the project (discount is taken into account)
     * @returns {number}
     */
    Switchboard.prototype.getNetPrice = function() {
        return this.electricBasket.getNetPrice() + this.mechanicBasket.getNetPrice() + this.distributionBasket.getNetPrice()  + this.functionalUnitsBasket.getNetPrice() + this.additionalProductsBasket.getNetPrice() + this.additionalItemsBasket.getNetPrice();
    };

    /**
     *
     * @returns {Filter[]}
     */
    Switchboard.prototype.getElectricFilters = function() {
        return characteristicsHelper.getElectricFilters(this.contextCharacteristics, function (a) {
            return a.filterElectric === '';
        });
    };

    /**
     *
     * @returns {Filter[]}
     */
    Switchboard.prototype.getMechanicFilters = function() {
        return characteristicsHelper.getMechanicFilters(this.contextCharacteristics, function (a) {
            return a.filterMechanic === '';
        });
    };

    /**
     *
     * @returns {Basket[]}
     */
    Switchboard.prototype.getBaskets = function () {
        return [this.electricBasket, this.mechanicBasket, this.distributionBasket, this.functionalUnitsBasket, this.additionalProductsBasket];
    };


    /**
     * @description Is there at list an electrical device
     * @returns {boolean}
     */
    Switchboard.prototype.hasElectricalDevices = function () {
        return this.hasElectricalDeviceList() && this.electricBasket.list.length > 0;
    };
    /**
     * @description Is there at list an electrical list
     * @returns {boolean}
     */
    Switchboard.prototype.hasElectricalDeviceList = function () {
        return !!(this.electricBasket && this.electricBasket.list);
    };

    /**
     * @description Is there at list a mechanical device
     * @returns {boolean}
     */
    Switchboard.prototype.hasMechanicalDevices = function () {
        return this.hasMechanicalDeviceList() && this.mechanicBasket.list.length > 0;
    };

    /**
     * @description Is there at list an mechanical list
     * @returns {boolean}
     */
    Switchboard.prototype.hasMechanicalDeviceList = function () {
        return !!(this.mechanicBasket && this.mechanicBasket.list);
    };

    /**
     * @description Is there at list a Distribution device
     * @returns {boolean}
     */
    Switchboard.prototype.hasDistributionDevices = function () {
        return this.hasDistributionDeviceList() && this.distributionBasket.list.length > 0;
    };

    /**
     * @description Is there at list an Distribution list
     * @returns {boolean}
     */
    Switchboard.prototype.hasDistributionDeviceList = function () {
        return !!(this.distributionBasket && this.distributionBasket.list);
    };

    /**
     * @description Is there at list a Functional Units device
     * @returns {boolean}
     */
    Switchboard.prototype.hasFunctionalUnitsDevices = function () {
        return this.hasDistributionDeviceList() && this.functionalUnitsBasket.list.length > 0;
    };

    /**
     * @description Is there at list an Functional Units list
     * @returns {boolean}
     */
    Switchboard.prototype.hasFunctionalUnitsDeviceList = function () {
        return !!(this.functionalUnitsBasket && this.functionalUnitsBasket.list);
    };

    /**
     * @description Is there at list a Functional Units device
     * @returns {boolean}
     */
    Switchboard.prototype.hasAdditionalProductsDevices = function () {
        return this.hasDistributionDeviceList() && this.additionalProductsBasket.list.length > 0;
    };

    /**
     * @description Is there at list an Functional Units list
     * @returns {boolean}
     */
    Switchboard.prototype.hasAdditionalProductsDeviceList = function () {
        return !!(this.additionalProductsBasket && this.additionalProductsBasket.list);
    };

    /**
     * @description Is there at least an additional items in BOM
     * @returns {boolean}
     */
    Switchboard.prototype.hasAdditionalItems = function () {
        return this.hasAdditionalItemsList() && this.additionalItemsBasket.list.length > 0;
    };

    /**
     * @description Is there at least an additional item list
     * @returns {boolean}
     */
    Switchboard.prototype.hasAdditionalItemsList = function () {
        return !!(this.additionalItemsBasket && this.additionalItemsBasket.list);
    };

    Switchboard.prototype.addEnclosureSolutionWishes = function(enclosureSolutionWishes) {
        for(var wish in enclosureSolutionWishes) {
            if (enclosureSolutionWishes.hasOwnProperty(wish)) {
                if(enclosureSolutionWishes[wish].selectedValue !== Characteristic.indifferentValue) {
                    this._enclosureSolutionWishes[wish] = angular.copy(enclosureSolutionWishes[wish]);
                }
                else {
                    delete this._enclosureSolutionWishes[wish];
                }
            }
        }
    };

    Switchboard.prototype.clearEnclosureSolutionWishes = function() {
        for(var index in this.contextCharacteristics){
            if(this._enclosureSolutionWishes[this.contextCharacteristics[index].name]) {
                // TODO : what if indifferent is not in the available values
                this.contextCharacteristics[index].selectedValue = Characteristic.indifferentValue;
                this.contextCharacteristics[index].displayValue = Characteristic.indifferentValue;
            }
        }
        this._enclosureSolutionWishes = {};
    };

    Switchboard.prototype.getSmartStatus = function() {
        var that = this;
        var hasSmartProducts = that.additionalProductsBasket.getTotalProductCount() > 0;

        if(hasSmartProducts && !that.isSmartPanelDirty) {
             return 'SMART';
        } else if(hasSmartProducts && that.isSmartPanelDirty) {
            return 'HYBRID';
        } else {
            return 'BASIC';
        }
    };

    return Switchboard;
});