'use strict';

/**
 * @class angular_module.business.projectService
 */
angular.module('business').factory('projectService', function ($q, $rootScope, _, logger, Project, Basket, ProductPack, Product, Characteristic, characteristicsHelper, appConstants, applicationConfigurationService, saveLoadService, productPriceService, switchboardContentService, adminService, partInfoService, googleAnalyticsService, gettextCatalog, backwardCompatibilityService, Warning) {

    var service = {};

    /**
     *
     * @type {string}
     */
    service.projectExtension = '.eqq';
    /**
     *
     * @type {string}
     */
    service.compatibleProjectExtension = '.json';

    service.productsDeletedAfterLoadingEvent = 'productsDeletedAfterLoadingEvent';

    /**
     * @description Callback when a (project context) characteristic is modified : the project and the solution become dirty
     */
    var onCharacteristicChanged = function () {
        Project.current.isProjectDirty = true;
        if(Project.current.selectedSwitchboard.enclosureSolution) {
            Project.current.selectedSwitchboard.isSolutionDirty = true;
        }
    };

    /**
     * @description Callback when a discount is applied on one or more references : the project become dirty, the solution is not impacted
     */
    var onDiscountChanged = function () {
        Project.current.isProjectDirty = true;
    };

    /**
     * @description Public interface to call onDiscountChanged()
     */
    service.onIndividualBomDiscountChanged = function () {
        onDiscountChanged();
    };

    /**
     * @description Apply discount to all references of the project
     *
     * @param {Number} discount
     */
    service.applyDiscount = function (discount) {

        if (isNaN(parseFloat(discount)) ||
            discount < 0 ||
            discount > 100) {

            return;
        }

        var baskets = Project.current.getBaskets();
        baskets.forEach(function (basket) {
            basket.list.forEach(function (productPack) {
                productPack.product.parts.forEach(function (partPack) {
                    partPack.part.discount = discount;
                });
            });
        });

        onDiscountChanged();
    };

    /**
     * @description Load the application version from the configuration file that contains it. This version is recorded inside project, so that we know if a project is obsolete or not
     */
    service.loadVersion = function () {

        var deferred = $q.defer();

        applicationConfigurationService.getApplicationParameter('version').then(function (parameter) {
            var data = parameter.parameterObject;
            appConstants.version = data.version;

            return deferred.resolve();
        });

        return deferred.promise;
    };

    /**
     * @description Load the application global information
     * @returns {Promise}
     */
    service.loadGlobalConfiguration = function () {

        var deferred = $q.defer();

        service.loadVersion().then(function () {

            applicationConfigurationService.getApplicationParameter('globalConfiguration').then(function (parameter) {
                var data = parameter.parameterObject;
                appConstants.currency = data.currency;
                appConstants.headerCccLink = data.headerCccLink;
                appConstants.schneiderWebsiteLink = data.schneiderWebsiteLink;
                appConstants.rapsodyLink = data.rapsodyLink;
                appConstants.ecodialLink = data.ecodialLink;
                appConstants.feedbackLink = data.feedbackLink;
                appConstants.privacyPolicyLink = data.privacyPolicyLink;
                appConstants.smartPanelLink = data.smartPanelLink;
                appConstants.dialogRegistrationExternalLink = data.dialogRegistrationExternalLink;
                appConstants.hide3dview = data.hide3dview;
                appConstants.skipFindDistribution = data.skipFindDistribution;
                appConstants.skipTermsAndConditions = data.skipTermsAndConditions;
                appConstants.skipSmartPanelLink = data.skipSmartPanelLink;
                appConstants.priceScope = data.priceScope;
                appConstants.skipCloudStorageLink = data.skipCloudStorageLink;

                return deferred.resolve();
            });
        });

        return deferred.promise;
    };

    /**
     * @description
     * @param {Switchboard} switchboard
     */
    service.resetContextCharacteristics = function (switchboard) {
        Project.current.isProjectDirty = true;
        if(switchboard.enclosureSolution) {
            switchboard.isSolutionDirty = true;
        }
        return service.loadCharacteristics(switchboard, true);
    };

    /**
     * @description Get all context and enclosure characteristics and then add appropriate callbacks to track solution state
     * @param {Switchboard} switchboard
     * @param {boolean} reloadContextCharacteristics
     * @returns {Promise}
     */
    service.loadCharacteristics = function (switchboard, reloadContextCharacteristics) {
        var deferred = $q.defer();

        applicationConfigurationService.getApplicationParameter('contextConfigurations').then(function (parameter) {
            var data = parameter.parameterObject;

            if(switchboard) {
                switchboard.loadContextCharacteristics(data, onCharacteristicChanged, reloadContextCharacteristics);
            } else {
                Project.current.switchboardPacks.forEach(function(switchboardPack) {
                    switchboardPack.switchboard.loadContextCharacteristics(data, onCharacteristicChanged, reloadContextCharacteristics);
                });
            }

            deferred.resolve();
        });

        return deferred.promise;
    };

    /**
     *
     * @param {String} projectName
     * @param {String} projectReference
     * @param {String} clientReference
     * @param {String} projectNote
     * @returns {Promise}
     */
    service.createNewProject = function (projectName, projectReference, clientReference, projectNote) {
        var deferred = $q.defer();
        //Creation of the project object
        Project.current = new Project(projectName, projectReference, clientReference, projectNote, 'to-be-defined');
        Project.current.createSwitchboard(gettextCatalog.getString('default-switchboard-name'),1);

        productPriceService.defaultPriceList().then(function (defaultPriceList) {
            Project.current.priceList = defaultPriceList;

            // TODO : these information should not be stored in the project object
            service.loadCharacteristics(Project.current.selectedSwitchboard).then(function () {
                deferred.resolve(Project.current);
            });

            switchboardContentService.displayBasket = false;
            switchboardContentService.displaySelection = true;
            switchboardContentService.lastSelectedRangeItem = {};

        });

        return deferred.promise;
    };

    /**
     * @description Save a project
     * @return {json} : json containing archive of the current project
     */
    service.saveProject = function () {
        var savedObject = {};

        savedObject.name = Project.current.name;
        savedObject.projectReference = Project.current.projectReference;
        savedObject.clientReference = Project.current.clientReference;
        savedObject.projectNote = Project.current.projectNote;
        savedObject.version = appConstants.version;
        savedObject.scope = appConstants.priceScope;
        savedObject._defaultDiscount = Project.current._defaultDiscount;
        savedObject.priceList = Project.current.priceList;

        // Save switchboard packs
        savedObject.switchboardPacks = saveLoadService.saveSwitchboardPacks(Project.current.switchboardPacks);

        return JSON.stringify(savedObject);
    };

    service.downloadProject = function(fileName){
        var json = service.saveProject();

        // not supported by mobile devices
        if (adminService.isMobile.any()) {
            logger.error(gettextCatalog.getString('ERROR_NOT_YET_SUPPORTED_ON_MOBILE_DEVICE'), 'Function not yet supported', 'bom', true, null, { showUser: true });
            return;
        }

        var fileNameWithExt = fileName + service.projectExtension;

        Project.current.isProjectDirty = false;

        // todo JAS move this in an helper class !!!
        if (navigator.msSaveBlob) {
            // IE 10+
            var blob = new Blob([json], {'type': 'application/json;charset=utf-8;'});
            navigator.msSaveBlob(blob, fileNameWithExt);
        } else {
            var element1 = angular.element('a#dlqqp');
            // feature detection
            // Browsers that support HTML5 download attribute
            element1.attr({
                href: 'data:application/json;charset=utf-8,' + encodeURI(json),
                target: '_blank',
                download: fileNameWithExt
            })[0].click();
        }
    };

    /**
     * @description Load a project
     * @param {string} projectJson : json containing archive of a project
     * @return {Promise}
     */
    service.loadProject = function (projectJson) {
        return service.loadProjectFromJson(JSON.parse(projectJson));

    };

    /**
     * @description Load a project
     * @param {json} projectJson : json containing archive of a project
     * @return {Promise}
     */
    service.loadProjectFromJson = function (projectJson) {
        var deferred = $q.defer();

        if (projectJson.scope && projectJson.scope !== appConstants.priceScope) {
            // Opened project has not the same scope than the application
            // Reject project opening
            deferred.reject('Incompatible scope : project is ' + projectJson.scope + '. Application is ' + appConstants.priceScope);
            return deferred.promise;
        }

        backwardCompatibilityService.transformIntoCurrentVersionFormat(projectJson).then(function (projectJson) {
            service.createNewProject('', '', '', '').then(function () {
                try {
                    var savedProject = projectJson;
                    if (savedProject.priceList === undefined) {
                        savedProject.priceList = {id: appConstants.priceScope};
                    }

                    // name, version, default discount, price list
                    Project.current.name = savedProject.name;
                    Project.current.projectReference = savedProject.projectReference;
                    Project.current.clientReference = savedProject.clientReference;
                    Project.current.projectNote = savedProject.projectNote;
                    Project.current.version = appConstants.version;
                    Project.current.scope = appConstants.priceScope;
                    Project.current._defaultDiscount = savedProject._defaultDiscount;
                    Project.current.priceList = savedProject.priceList;

                    //Test if price list exist : if not set to default country list
                    productPriceService.priceList(Project.current.priceList.id).then(function (priceList) {
                        if (priceList !== undefined && priceList.error !== undefined) {
                            productPriceService.defaultCountryPriceList().then(function (defaultCountryPriceList) {
                                Project.current.priceList = defaultCountryPriceList;
                            });
                        }
                    });

                    // Load switchboard packs
                    Project.current.switchboardPacks = saveLoadService.loadSwitchboardPacks(savedProject.switchboardPacks, Project.current.onSwitchboardChanged());
                    service.loadCharacteristics();

                    // Update parts
                    partInfoService.updatePartsInfo(Project.current.priceList.id);

                    backwardCompatibilityService.getInvalidProducts(Project.current.selectedSwitchboard.electricBasket.list.concat(Project.current.selectedSwitchboard.distributionBasket.list)).then(function(invalidProductPacks){
                        invalidProductPacks.forEach(function(productPack){
                            productPack.product.warnings.push(new Warning(Warning.prototype.obsoleteProductWarning));
                        });
                    });

                    deferred.resolve(Project.current);
                }
                catch (err) {
                    deferred.reject(err);
                }
            });
        });

        return deferred.promise;
    };


    /**
     * @description Check that the project file is valid
     * @param {Blob} file
     * @returns {boolean}
     */
    var isProjectValid = function (file) {

        //json files should still be compatible, as Spanish users may have projects in .json

        // If project file extension is not compatible, return !
        return !(file.name.indexOf(service.projectExtension, file.name.length - service.projectExtension.length) === -1 &&
        file.name.indexOf(service.compatibleProjectExtension, file.name.length - service.compatibleProjectExtension.length) === -1);

    };

    /**
     *
     * @param {Blob} file
     * @returns {Promise}
     */
    service.loadFile = function (file) {

        var deferred = $q.defer();

        // Check that project is valid
        if (!isProjectValid(file)) {
            deferred.reject('File extension not recognized');
        }
        else {
            // Read file
            var r = new FileReader();
            r.onloadend = function (e) {
                service.loadProject(e.target.result).then(function () {
                    googleAnalyticsService.sendEvent('Application', 'Project loaded', 'Project loaded', Math.round(Project.current.selectedSwitchboard.getTotalPrice()));
                    deferred.resolve();
                }, function (err) {
                    deferred.reject(err);
                });
            };
            r.readAsText(file);
        }

        return deferred.promise;
    };


    /**
     * @description Is there at list an electrical device
     * @returns {boolean}
     */
    service.hasElectricalDevices = function () {
        return service.hasElectricalDeviceList() && Project.current.selectedSwitchboard.electricBasket.list.length > 0;
    };
    /**
     * @description Is there at list an electrical list
     * @returns {boolean}
     */
    service.hasElectricalDeviceList = function () {
        return !!(Project.current && Project.current.selectedSwitchboard.electricBasket && Project.current.selectedSwitchboard.electricBasket.list);
    };

    /**
     * @description Is there at list a mechanical device
     * @returns {boolean}
     */
    service.hasMechanicalDevices = function () {
        return service.hasMechanicalDeviceList() && Project.current.selectedSwitchboard.mechanicBasket.list.length > 0;
    };

    /**
     * @description Is there at list an mechanical list
     * @returns {boolean}
     */
    service.hasMechanicalDeviceList = function () {
        return !!(Project.current && Project.current.selectedSwitchboard.mechanicBasket && Project.current.selectedSwitchboard.mechanicBasket.list);
    };

    /**
     * @description Is there at list a Distribution device
     * @returns {boolean}
     */
    service.hasDistributionDevices = function () {
        return service.hasDistributionDeviceList() && Project.current.selectedSwitchboard.distributionBasket.list.length > 0;
    };

    /**
     * @description Is there at list an Distribution list
     * @returns {boolean}
     */
    service.hasDistributionDeviceList = function () {
        return !!(Project.current && Project.current.selectedSwitchboard.distributionBasket && Project.current.selectedSwitchboard.distributionBasket.list);
    };

    /**
     * @description Is there at list a Functional Units device
     * @returns {boolean}
     */
    service.hasFunctionalUnitsDevices = function () {
        return service.hasDistributionDeviceList() && Project.current.selectedSwitchboard.functionalUnitsBasket.list.length > 0;
    };

    /**
     * @description Is there at list an Functional Units list
     * @returns {boolean}
     */
    service.hasFunctionalUnitsDeviceList = function () {
        return !!(Project.current && Project.current.selectedSwitchboard.functionalUnitsBasket && Project.current.selectedSwitchboard.functionalUnitsBasket.list);
    };

    /**
     * @description Is there at list a Functional Units device
     * @returns {boolean}
     */
    service.hasAdditionalProductsDevices = function () {
        return service.hasDistributionDeviceList() && Project.current.selectedSwitchboard.additionalProductsBasket.list.length > 0;
    };

    /**
     * @description Is there at list an Functional Units list
     * @returns {boolean}
     */
    service.hasAdditionalProductsDeviceList = function () {
        return !!(Project.current && Project.current.selectedSwitchboard.additionalProductsBasket && Project.current.selectedSwitchboard.additionalProductsBasket.list);
    };

    /**
     * @description Is there at least an additional item
     * @returns {boolean}
     */
    service.hasAdditionalItemsDevices = function () {
        return service.hasDistributionDeviceList() && Project.current.selectedSwitchboard.additionalProductsBasket.list.length > 0;
    };

    /**
     * @description Is there at least an additional item list
     * @returns {boolean}
     */
    service.hasAdditionalItemsDeviceList = function () {
        return !!(Project.current && Project.current.selectedSwitchboard.additionalItemsBasket && Project.current.selectedSwitchboard.additionalItemsBasket.list);
    };

    /**
     * @description check if project loaded
     * @param {function} callback
     * @returns {Promise}
     */
    service.checkProjectExists = function (callback) {

        var deferred = $q.defer();

        // in developer mode, automatically creates a new project if needed
        if (adminService.developerMode() && !Project.current) {
            service.createNewProject('developer project', '', '', '');
        }

        if (Project.current) {
            deferred.resolve(true);
        } else {
            deferred.reject(false);
            if (callback) {
                callback();
            }
        }
        return deferred.promise;
    };

    /**
     * Makes project dirty
     */
    service.makeProjectDirty = function () {
        Project.current.isProjectDirty = true;
    };

    return service;
});