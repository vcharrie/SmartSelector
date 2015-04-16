'use strict';

angular.module('switchboardOrganisation').service('switchboardOrganisationNetworkDecorationService', function(networkService, switchboardOrganisationService, switchboardOrganisationLayoutService, switchboardOrganisationNetworkFlatArrayService) {

    var service = {
    };

    /**
     * @description Gets the level of a device in the organisation, depending on its type and on its parents
     * @param {D3_Data} the device node data
     * @returns {String} Level enum among [deviceFirstLevel, deviceSecondLevel, deviceThirdLevel].
     *                   null if unexpected data
     */
    service.getDeviceLevelAttribute = function (nodeData) {
        if (nodeData.type !== networkService.distributionType && nodeData.parent === null) {
            return switchboardOrganisationLayoutService.deviceFirstLevel;
        } else if (nodeData.type === networkService.distributionType && nodeData.parent.parent === null) {
            return switchboardOrganisationLayoutService.deviceFirstLevel;
        } else if (nodeData.type !== networkService.distributionType && nodeData.parent.parent.parent === null) {
            return switchboardOrganisationLayoutService.deviceSecondLevel;
        } else if (nodeData.type === networkService.distributionType && nodeData.parent.parent.parent.parent === null) {
            return switchboardOrganisationLayoutService.deviceSecondLevel;
        } else if (nodeData.type !== networkService.distributionType && nodeData.parent.parent.parent.parent.parent === null) {
            return switchboardOrganisationLayoutService.deviceThirdLevel;
        } else {
            return null;
        }
    };

    service.convertToLevelNumber = function (deviceLevel) {
        if (deviceLevel === switchboardOrganisationLayoutService.deviceFirstLevel) {
            return 0;
        } else if (deviceLevel === switchboardOrganisationLayoutService.deviceSecondLevel) {
            return 1;
        } else if (deviceLevel === switchboardOrganisationLayoutService.deviceThirdLevel) {
            return 2;
        } else {
            return -1;
        }
    };

    /**
     * @description Gets the row of a device in the organisation
     * @param {D3_Data} the device node data
     * @returns {String} row int
     *                   null if unexpected data
     */
    service.getDeviceRowAttribute = function (nodeData) {
        var row = switchboardOrganisationNetworkFlatArrayService.networkFlatArray.indexOf(nodeData);
        if (row > -1) {
            return row;
        } else {
            return null;
        }
    };

    /**
     * @description Gets the index of a device in the organisation, i.e. the row where to place it
     * @param {D3_Data} the device node data
     * @returns {Number} The index where to place the device node
     */
    service.getDeviceIndex = function (nodeData) {
        return switchboardOrganisationNetworkFlatArrayService.networkFlatArray.indexOf(nodeData);
    };

    /**
     * @description Gets the type attribute of a device in the organisation, depending on its type
     * @param {D3_Data} the device node data
     * @returns {String} Type enum among [electricalDeviceHTMLType, distributionDeviceHTMLType, measureDeviceHTMLType, surgeArresterDeviceHTMLType].
     *                   null if unexpected data
     */
    service.getDeviceTypeAttribute = function (nodeData) {
        if (nodeData.type === networkService.electricalDeviceType) {
            return switchboardOrganisationLayoutService.electricalDeviceHTMLType;
        } else if (nodeData.type === networkService.distributionType) {
            return switchboardOrganisationLayoutService.distributionDeviceHTMLType;
        } else if (nodeData.type === networkService.measureDeviceType) {
            return switchboardOrganisationLayoutService.measureDeviceHTMLType;
        } else if (nodeData.type === networkService.surgeArresterDeviceType) {
            return switchboardOrganisationLayoutService.surgeArresterDeviceHTMLType;
        } else {
            return null;
        }
    };

    /**
     * @description Gets the device on a certain row of the network
     * @param {Number} lineNumber the row of the device
     * @returns {String} D3 Selector for this device
     */
    service.getDeviceAtLineSelector = function (lineNumber) {
        return $(switchboardOrganisationLayoutService.getDeviceAtLinePrefixSelector + lineNumber + ']').last()[0];
    };

    //Devices test linked to layout
    /**
     * @description Checks if a device has already got a distribution downstream (interesting only for electrical devices,  measures and surge arrester)
     * @param {D3_Data} nodeData the device node data
     * @returns {Boolean} True if this device has already got a distribution downstream
     */
    service.hasAlreadyADownstreamDistribution = function (nodeData) {
        return (nodeData.type !== networkService.distributionType && !nodeData.hasNoChildren());
    };

    /**
     * @description Checks if a device is a final leaf, i.e. a device at the third level or a device in a multiple quantity
     * @param {D3_Data} nodeData the device node data
     * @returns {Boolean} True if this device is a final leaf
     */
    service.isDeviceAFinalLeaf = function (nodeData) {
        return (service.getDeviceLevelAttribute(nodeData) === switchboardOrganisationLayoutService.deviceThirdLevel);
    };

    /**
     * @description Checks if a device cannot take a downstream device because it would create a second main distribution to the network
     * @param {D3_Data} nodeData the device node data
     * @returns {Boolean} True if this device cannot take a downstream device because it would create a second main distribution to the network
     */
    service.wouldCreateASecondMainDistribution = function (nodeData) {
        if (service.getDeviceLevelAttribute(nodeData) !== switchboardOrganisationLayoutService.deviceFirstLevel || nodeData.type === networkService.distributionType) {
            return false;
        }
        var mainDistributionUpstreamDevice = networkService.getMainDistributionUpstreamDevice();
        return (mainDistributionUpstreamDevice !== null && mainDistributionUpstreamDevice !== nodeData);
    };

    /**
     * @description Checks if a device cannot be duplicated with children because it would create a second main distribution to the network
     * @param {D3_Data} nodeData the device node data
     * @returns {Boolean} True if this device cannot duplicated with children because it would create a second main distribution to the network
     */
    service.wouldCreateASecondMainDistributionIfDuplicated = function (nodeData) {
        if (service.getDeviceLevelAttribute(nodeData) !== switchboardOrganisationLayoutService.deviceFirstLevel || nodeData.type === networkService.distributionType) {
            return false;
        }
        return (nodeData.children.length > 0);
    };

    service.isLastChildUnderDistribution = function (device) {
        if (device.parent !== null) {
            var distributionDepth = device.parent.children.length;
            return (networkService.getChildIndex(device) + 1) === distributionDepth;
        } else {
            return false;
        }
    };

    //Wires under distribution coordinates
    /**
     * @description Gets SVG coordinates for wire between a distribution and one of its child device
     * @param {Device} distribution upstream the wire
     * @param {Device} device downstream the wire
     * @returns {String} SVG points attribute content
     */
    service.getWirePoints = function (distribution, device) {
        var wirePoints = '';

        var numericDistributionRow = service.getDeviceIndex(distribution);
        var numericDistributionLevel = 0;
        switch (service.getDeviceLevelAttribute(distribution)) {
            case switchboardOrganisationLayoutService.deviceFirstLevel:
                numericDistributionLevel = 0;
                break;
            case switchboardOrganisationLayoutService.deviceSecondLevel:
                numericDistributionLevel = 1;
                break;
            default :
                //impossible
                numericDistributionLevel = -1;
        }

        //distribution X : standard wire left margin + (distribution level * standard device width)
        var distributionPointX = (numericDistributionLevel *switchboardOrganisationLayoutService.electricalDeviceContainerWidth) + switchboardOrganisationLayoutService.wireLeftMargin;
        var distributionPointY = ((numericDistributionRow + 1) * (switchboardOrganisationLayoutService.deviceContainerHeight + switchboardOrganisationLayoutService.deviceContainerVerticalMargin)) - switchboardOrganisationLayoutService.wireMagicNumber;

        var devicePointX = 0;
        var devicePointY = 0;

        if (device !== null) {
            var numericDeviceRow = service.getDeviceIndex(device);
            var numericDeviceLevel = 0;
            switch (service.getDeviceLevelAttribute(device)) {
                case switchboardOrganisationLayoutService.deviceFirstLevel:
                    numericDeviceLevel = 0;
                    break;
                case switchboardOrganisationLayoutService.deviceSecondLevel:
                    numericDeviceLevel = 1;
                    break;
                case switchboardOrganisationLayoutService.deviceThirdLevel:
                    numericDeviceLevel = 2;
                    break;
                default :
                    //impossible
                    numericDeviceLevel = -1;
            }

            devicePointX = (numericDeviceLevel * switchboardOrganisationLayoutService.electricalDeviceContainerExcludingLeftColorBannerWidth);
            devicePointY = (numericDeviceRow * (switchboardOrganisationLayoutService.deviceContainerHeight + switchboardOrganisationLayoutService.deviceContainerVerticalMargin)) + switchboardOrganisationLayoutService.wireTopMargin;
        } else {
            //device null : wire to the icon 'add a downstream device'

            devicePointX = ((numericDistributionLevel + 1) * switchboardOrganisationLayoutService.electricalDeviceContainerExcludingLeftColorBannerWidth) + switchboardOrganisationLayoutService.wireDownstreamLeftMargin;

            var lowestChildRow = service.getDeviceIndex(switchboardOrganisationNetworkFlatArrayService.findLowestChildDevice(distribution));
            devicePointY = ((lowestChildRow + 1) * (switchboardOrganisationLayoutService.deviceContainerHeight + switchboardOrganisationLayoutService.deviceContainerVerticalMargin)) + (switchboardOrganisationLayoutService.deviceContainerVerticalMargin / 2) - switchboardOrganisationLayoutService.wireMagicNumber;

            //the central wire is taken by the 'add downstream button' icon
            wirePoints += distributionPointX + ',' + distributionPointY + ' ';
        }

        //the wire between a child device and the central vertical wire
        wirePoints += distributionPointX + ',' + devicePointY + ' ' + devicePointX + ',' + devicePointY;
        return wirePoints;
    };

    //Add downstream icon under device coordinates
    /**
     * @description Gets SVG coordinates for 'add downstream button' icon under a distribution
     * @param {Device} distribution upstream the wire
     * @returns {String} SVG translate parameters : 'x,y'
     */
    service.getDistributionAddDownstreamDeviceIconPoints = function (distribution) {
        var distributionRow = service.getDeviceIndex(distribution);
        var lowestChild = switchboardOrganisationNetworkFlatArrayService.findLowestChildDevice(distribution);
        var lowestChildRow = service.getDeviceIndex(lowestChild);

        //'add downstream button' icon X : always the same translation, as the icon goes to the next column
        var pointX = switchboardOrganisationLayoutService.electricalDeviceContainerWidth;
        var pointY = ((lowestChildRow - distributionRow) * (switchboardOrganisationLayoutService.deviceContainerHeight + switchboardOrganisationLayoutService.deviceContainerVerticalMargin)) + (switchboardOrganisationLayoutService.deviceContainerVerticalMargin / 2) - switchboardOrganisationLayoutService.wireMagicNumber;

        return pointX + ',' + pointY;
    };

    return service;

});
