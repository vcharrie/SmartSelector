'use strict';

angular.module('switchboardOrganisation').service('switchboardOrganisationUpdateService', function(_, d3, Part, gettextCatalog, networkBasicInformationHelperService, networkService, switchboardOrganisationNetworkDecorationService, switchboardOrganisationLayoutService, switchboardOrganisationService, switchboardOrganisationNetworkFlatArrayService, Project) {

    var service = {
    };

    /**
     * @description Translates the device so that it is placed correctly to the user's view
     * @param {D3_Data} the device containers node data
     * @returns {} Nothing.
     */
    service.placeDeviceOnSvgOrganisation = function (deviceContainerNodeData, updateNode, svgOrganisationContainer) {
        deviceContainerNodeData.attr('transform', function (device) {
            //X depends only on the level of the device
            var level = switchboardOrganisationNetworkDecorationService.getDeviceLevelAttribute(device);
            var translateX = 0;
            if (level === switchboardOrganisationLayoutService.deviceSecondLevel) {
                translateX = switchboardOrganisationLayoutService.electricalDeviceContainerExcludingLeftColorBannerWidth;
            } else if (level === switchboardOrganisationLayoutService.deviceThirdLevel) {
                translateX = 2 * switchboardOrganisationLayoutService.electricalDeviceContainerExcludingLeftColorBannerWidth;
            }

            //Y depends only on the index of the device in the flat array
            var deviceIndex = switchboardOrganisationNetworkDecorationService.getDeviceIndex(device);
            var translateY = 0;

            for (var i = 0; i < deviceIndex; i++) {
                if (switchboardOrganisationNetworkFlatArrayService.networkFlatArray[i].type === networkService.distributionType) {
                    translateY += (switchboardOrganisationLayoutService.deviceContainerHeight + switchboardOrganisationLayoutService.deviceContainerVerticalMargin);
                } else {
                    translateY += (switchboardOrganisationLayoutService.deviceContainerHeight + switchboardOrganisationLayoutService.deviceContainerVerticalMargin);
                }
            }

            return 'translate(' + translateX + ',' + translateY + ')';
        });

        switchboardOrganisationNetworkFlatArrayService.distributionFilteredNetwork().forEach(function (distribution) {

            //wire from distribution to 'add a downstream icon'
            var addDownstreamDeviceWirePoints = switchboardOrganisationNetworkDecorationService.getWirePoints(distribution, null);
            var polyline = svgOrganisationContainer.append('polyline');
            polyline.style('stroke', '#cbcbcb')
                .style('fill', 'none')
                .style('stroke-width', '1');

            polyline.attr('points', addDownstreamDeviceWirePoints);

            var addDownstreamDeviceIconCoordinates = switchboardOrganisationNetworkDecorationService.getDistributionAddDownstreamDeviceIconPoints(distribution);

            var addDownstreamDeviceIconNode = updateNode.filter(function (device) {
                return device === distribution;
            }).select(switchboardOrganisationLayoutService.deviceAddDownstreamDeviceButtonSelector);

            addDownstreamDeviceIconNode.attr('transform', function () {
                return 'translate(' + addDownstreamDeviceIconCoordinates + ')';
            });
        });

        this.updateAddIncomerButtonPosition();

    };

    var hasPartCode = function (device) {
        return device.product.parts[0].part.partCode !== '';
    };

    var hasWarning = function (device) {
        return (device.warnings.concat(device.product.warnings).length > 0);
    };

    /**
     * @description Fills the device left banner with relevant color of all the nodes of a certain type in current network
     * @param {String} filteredLeftColorBannerSelector the selector of the device left banner filtered with the chosen type
     * @param {Array<Device>} filteredNetwork the filtered array of the network with only the chosen type devices
     * @param {D3_Node} svgOrganisationContainer D3 object containing a forest of trees reflecting the SW orga
     * @returns Nothing.
     */
    var fillLeftColorBanner = function(filteredLeftColorBannerSelector, filteredNetwork, svgOrganisationContainer) {
        var deviceType = (filteredNetwork.length !== 0 ? filteredNetwork[0].type : 'none');
        var filteredLeftColorBannerData = svgOrganisationContainer.selectAll(filteredLeftColorBannerSelector).data(filteredNetwork);
        filteredLeftColorBannerData.attr('fill', function() {
            return switchboardOrganisationLayoutService.deviceColors[deviceType];
        });
    };

    /**
     * @description Fills the device left banner with relevant color of all the nodes of a certain type in current network
     * @param {String} filteredDeviceReferenceLabelSelector the selector of the device left banner filtered with the chosen type
     * @param {Array<Device>} filteredNetwork the filtered array of the network with only the chosen type devices
     * @param {D3_Node} svgOrganisationContainer D3 object containing a forest of trees reflecting the SW orga
     * @returns Nothing.
     */
    var colorDeviceReferenceLabel = function(filteredDeviceReferenceLabelSelector, filteredNetwork, svgOrganisationContainer) {
        var deviceType = (filteredNetwork.length !== 0 ? filteredNetwork[0].type : 'none');
        var filteredLeftColorBannerData = svgOrganisationContainer.selectAll(filteredDeviceReferenceLabelSelector).data(filteredNetwork);
        filteredLeftColorBannerData.attr('fill', function() {
            return switchboardOrganisationLayoutService.deviceColors[deviceType];
        });
    };

    /**
     * @description Set correct warning state for each SVG element
     * @param {Array<Device>} the filtered array of the network with only the chosen type devices
     * @param filteredNetwork
     * @param svgOrganisationContainer
     * @return {} Nothing
     */
    service.updateWarnings = function(filteredSelector, filteredNetwork, svgOrganisationContainer) {
        var deviceWarningButtonSelectorData = svgOrganisationContainer.selectAll(filteredSelector).data(filteredNetwork);
        deviceWarningButtonSelectorData.style('visibility', function (device) {
            return (hasWarning(device) && hasPartCode(device))?'visible':'hidden';
        });
    };

    /**
     * @description Set correct state for each SVG element depending of status of distribution : existing or not yet
     * @param {Array<Device>} the filtered array of the network with only the chosen type devices
     * @param filteredNetwork
     * @param svgOrganisationContainer
     * @return {} Nothing
     */
    service.activateDistribution = function (filteredNetwork, svgOrganisationContainer) {
        var distributionInfosAreaData = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionInfosAreaSelector).data(filteredNetwork);
        distributionInfosAreaData.attr('style', function (device) {
            return hasPartCode(device)?'fill:white':'fill:#efefef; cursor:pointer';
        });
        var distributionClickBehavior = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionAreaSelector).data(filteredNetwork);
        distributionClickBehavior.attr('data-fake-distribution', function (device) {
            return hasPartCode(device)?'false':'true';
        });
        var distributionSidePanelSelectorData = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionSidePanelSelector).data(filteredNetwork);
        distributionSidePanelSelectorData.attr('style', function (device) {
            return hasPartCode(device)?'visibility:visible':'visibility:hidden';
        });
        var distributionDeleteButtonSelectorData = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionDeviceDeleteButtonSelector).data(filteredNetwork);
        distributionDeleteButtonSelectorData.style('visibility', function (device) {
            return hasPartCode(device)?'visible':'hidden';
        });
        var distributionDeviceModifyButtonSelectorData = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionDeviceModifyButtonSelector).data(filteredNetwork);
        distributionDeviceModifyButtonSelectorData.text(function (device) {
            return hasPartCode(device)?'\uf040':'\uf067';
        }).style('visibility', function (device) {
            return hasPartCode(device)?'visible':'hidden';
        });
        var filteredReferenceLabelData = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionDeviceReferenceLabelSelector).data(filteredNetwork);
        filteredReferenceLabelData.text(function (device) {
            if (device.product.parts[0].part.partCode === '') {
                return device.product.parts[0].part.longName;
            }

            var referenceLabel = _.map(device.product.parts, function (partPack) {
                return partPack.part.partCode;
            }).toString().replace(/,/g, ' ');

            var referenceLabelSizeLimit = 60;
            if (referenceLabel.length > referenceLabelSizeLimit) {
                referenceLabel = referenceLabel.slice(0, referenceLabelSizeLimit);
                referenceLabel += '...';
            }

            if (device.quantity === 1) {
                return referenceLabel;
            } else {
                return device.quantity + 'x ' + referenceLabel;
            }
        }).attr('style', function (device) {
            return hasPartCode(device)?'visibility:visible':'visibility:hidden';
        });

        var ddMenu = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.dropDownSelector).data(filteredNetwork);
        ddMenu.style('display', function () {
            return 'none';
        });
        var filteredPictureData = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionDevicePictureSelector).data(filteredNetwork);
        filteredPictureData.attr('xlink:href', function (device) {
            return hasPartCode(device)?device.product.parts[0].part.image:'';
        });
        var filteredDescriptionLabelFirstLineData = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionDeviceDescriptionLabelFirstLineSelector).data(filteredNetwork);
        filteredDescriptionLabelFirstLineData.text(function (device) {
            if (hasPartCode(device)) {
                // fill description
                var firstLineLimitSize = 60;
                var descriptionLabel = device.product.parts[0].part.longName + ' ';
                var descriptionLabelFirstLine = descriptionLabel.slice(0, firstLineLimitSize);
                var lastSpaceIndex = descriptionLabelFirstLine.lastIndexOf(' ');
                if (lastSpaceIndex !== -1) {
                    return descriptionLabelFirstLine.slice(0, lastSpaceIndex);
                } else {
                    return descriptionLabelFirstLine;
                }
            } else {
                return gettextCatalog.getString('switchboard-organisation-no-distribution-label');
            }
        });
        filteredDescriptionLabelFirstLineData.attr('style', function (device) {
            return hasPartCode(device)?'':'cursor:pointer';
        });
        var filteredDescriptionLabelSecondLineData = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionDeviceDescriptionLabelSecondLineSelector).data(filteredNetwork);
        filteredDescriptionLabelSecondLineData.text(function (device) {
            var part = device.product.parts[0].part;
            if (part.partCode !== '') {

                // fill description
                var firstLineLimitSize = 60;
                var longName = Part.partDictionary[part.partCode].longName + '';
                var descriptionLabel = longName + ' ';
                var descriptionLabelFirstLine = descriptionLabel.slice(0, firstLineLimitSize);
                var lastSpaceIndexFirstLine = descriptionLabelFirstLine.lastIndexOf(' ');
                var descriptionSecondLine = '';

                if (lastSpaceIndexFirstLine !== -1) {
                    descriptionSecondLine = longName.slice(lastSpaceIndexFirstLine + 1);
                } else {
                    descriptionSecondLine = longName.slice(firstLineLimitSize);
                }

                var secondLineLimitSize = 57;
                if (descriptionSecondLine.length > secondLineLimitSize) {
                    descriptionSecondLine = descriptionSecondLine.slice(0, secondLineLimitSize);
                    descriptionSecondLine += '...';
                }

                return descriptionSecondLine;
            } else {
                return '';
            }
        });
        var filteredDescriptionLabelAreaData = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionDeviceDescriptionLabelAreaSelector).data(filteredNetwork);
        filteredDescriptionLabelAreaData.attr('transform', function (device) {
            var translateX = 0;
            var translateY = 0;
            if (device.product.parts[0].part.partCode === '') {
                // move description label to the left
                translateX = switchboardOrganisationLayoutService.distributionDescriptionLabelLeftShift;
            }
            return 'translate(' + translateX + ',' + translateY + ')';
        });
        var filteredDeviceDeleteData = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.distributionDeviceDeleteButtonLabelSelector).data(filteredNetwork);
        var deleteLabelSizeLimit = 12;
        var deleteLabel = gettextCatalog.getString('switchboard-organisation-delete-device');
        if (deleteLabel.length > deleteLabelSizeLimit) {
            deleteLabel = deleteLabel.slice(0, deleteLabelSizeLimit);
            deleteLabel += '...';
        }
        filteredDeviceDeleteData.text(deleteLabel);
    };


    /**
     * @description Fills the reference label of all the nodes of a certain type in current network
     * @param {String} the selector of the reference labels filtered with the chosen type
     * @param {Array<Device>} the filtered array of the network with only the chosen type devices
     * @returns {} Nothing.
     */
    var fillReferenceLabel = function (filteredReferenceLabelSelector, filteredNetwork, svgOrganisationContainer) {
        var filteredReferenceLabelData = svgOrganisationContainer.selectAll(filteredReferenceLabelSelector).data(filteredNetwork);
        filteredReferenceLabelData.text(function (device) {
            if (device.product.parts[0].part.partCode === '') {
                return device.product.parts[0].part.longName;
            }

            var referenceLabel = _.map(device.product.parts, function (partPack) {
                return partPack.part.partCode;
            }).toString().replace(/,/g, ' ');

            var referenceLabelSizeLimit = 15;
            if (referenceLabel.length > referenceLabelSizeLimit) {
                referenceLabel = referenceLabel.slice(0, referenceLabelSizeLimit);
                referenceLabel += '...';
            }

            return referenceLabel;
        });
    };

    /**
     * @description Fills the reference label of all the nodes of a certain type in current network
     * @param {String} the selector of the reference labels filtered with the chosen type
     * @param {Array<Device>} the filtered array of the network with only the chosen type devices
     * @returns {} Nothing.
     */
    var fillDeviceQuantity = function (filteredDeviceQuantitySelector, filteredNetwork, svgOrganisationContainer) {
        var filteredDeviceQuantityData = svgOrganisationContainer.selectAll(filteredDeviceQuantitySelector).data(filteredNetwork);
        filteredDeviceQuantityData.text(function (device){
            return device.quantity;
        });
    };

    /**
     * @description Fills the description label of all the nodes of a certain type in current network
     * @param {String} the selector of the description labels filtered with the chosen type
     * @param {Array<Device>} the filtered array of the network with only the chosen type devices
     * @returns {} Nothing.
     */
    var firstLineLimitSize = 18;
    var secondLineLimitSize = 16;
    var ratedCurrentCharacteristicName = 'ratedCurrent';
    var breakingCapacityCharacteristicName = 'breakingCapacity';
    var polesDescriptionCharacteristicName = 'polesDescription';
    var curveCodeCharacteristicName = 'curveCode';
    var sensitivityCharacteristicName = 'earthLeakageSensitivityMax';

    var tripUnitCharacteristicName = 'tripUnitName';

    var vigiRanges = ['rangeselector-MCCB-VIGI','rangeselector-MCSD-VIGI'];
    var vigiCharacteristicString = gettextCatalog.getString('switchboard-organisation-basic-information-vigi');

    /**
     * @description Separates device basic information array of strings in two lines
     * @param {String[]} device basic information array (rated current, breaking capacity, poles description, etc.)
     * @returns {String[]} 2 lines of information. These 2 lines do not display unpriotary information (latest elements in device basic information array)
     *                     The 1st line is cut if too long, the 2nd line is cut if too long for getting a new element, and ellipsed if too long for containing the whole first element
     */
    var separateInformationArrayInTwoLines = function(informationArray){
        if (informationArray.length > 0){
            if (informationArray[0] && informationArray[0].length > firstLineLimitSize) {
                //special case : first information is too long for the first line
                //               then we break first information in two for more readibility
                var firstInformationPart1 = informationArray[0].slice(0, firstLineLimitSize);
                var firstInformationPart2 = informationArray[0].slice(firstLineLimitSize, informationArray[0].length);
                var lastSpaceIndex = firstInformationPart1.lastIndexOf(' ');
                if (lastSpaceIndex !== -1) {
                    firstInformationPart1 = informationArray[0].slice(0, lastSpaceIndex);
                    firstInformationPart2 = informationArray[0].slice(lastSpaceIndex, informationArray[0].length);
                }

                //place firstInformationPart1 and firstInformationPart2 back in the informationArray replacing first element
                informationArray.splice(0, 1, firstInformationPart1, firstInformationPart2);
            }

            var basicInformationFirstLine = informationArray[0];
            var basicInformationSecondLine = '';
            var informationArrayIndex = 1;

            while(informationArrayIndex < informationArray.length && informationArray[informationArrayIndex] && (basicInformationFirstLine.length + informationArray[informationArrayIndex].length) < firstLineLimitSize) {
                basicInformationFirstLine += ' - ' + informationArray[informationArrayIndex];
                informationArrayIndex++;
            }

            if (informationArrayIndex < informationArray.length) {
                basicInformationSecondLine = informationArray[informationArrayIndex];
                informationArrayIndex++;
                while (informationArrayIndex < informationArray.length && informationArray[informationArrayIndex] && (basicInformationSecondLine.length + informationArray[informationArrayIndex].length) < secondLineLimitSize) {
                    basicInformationSecondLine += ' - ' + informationArray[informationArrayIndex];
                    informationArrayIndex++;
                }

                //basicInformationSecondLine can overlay the second line max size : we place an ellipsis in this case
                if (basicInformationSecondLine && basicInformationSecondLine.length > secondLineLimitSize) {
                    basicInformationSecondLine = basicInformationSecondLine.slice(0, secondLineLimitSize);
                    basicInformationSecondLine += '...';
                }
            }

            return [basicInformationFirstLine, basicInformationSecondLine];
        } else {
            return '';
        }
    };

    /**
     * @description Fills the text of a device basic information line (1st or 2nd)
     * @param {Device} concerned device
     * @param {Int} Line to fill. 0 => first line, 1 => second line
     * @returns {String} the line of information to be displayed
     */
    var fillDeviceBasicInformationLineText = function(device, line) {
        var deviceProductPack = Project.current.selectedSwitchboard.electricBasket.searchProductPack(device.product);

        var ratedCurrentCharacteristicValue = networkBasicInformationHelperService.getCharacteristicFormattedAndTranslatedValue(deviceProductPack, ratedCurrentCharacteristicName);
        var breakingCapacityCharacteristicValue = networkBasicInformationHelperService.getCharacteristicFormattedAndTranslatedValue(deviceProductPack, breakingCapacityCharacteristicName);
        var polesDescriptionCharacteristicValue = networkBasicInformationHelperService.getCharacteristicFormattedAndTranslatedValue(deviceProductPack, polesDescriptionCharacteristicName);
        var curveCodeCharacteristicValue = networkBasicInformationHelperService.getCharacteristicFormattedAndTranslatedValue(deviceProductPack, curveCodeCharacteristicName);
        var sensitivityCharacteristicValue = networkBasicInformationHelperService.getCharacteristicFormattedAndTranslatedValue(deviceProductPack, sensitivityCharacteristicName);
        var tripUnitCharacteristicValue = networkBasicInformationHelperService.getCharacteristicFormattedAndTranslatedValue(deviceProductPack, tripUnitCharacteristicName);

        //Vigi string is displayed only for (Molded-Case Circuit-Breaker + Vigi) and (Switch-Disconnector + Vigi)
        var vigiCharacteristicValue = '';
        if (_.contains(vigiRanges, deviceProductPack.rangeItem.rangeName)) {
            vigiCharacteristicValue = vigiCharacteristicString;
        }

        //Description label may be replaced by device short name...?
        var descriptionLabel = Part.partDictionary[deviceProductPack.product.parts[0].part.partCode].longName;

        var informationArray = [];
        if (ratedCurrentCharacteristicValue !== '') {
            informationArray.push(ratedCurrentCharacteristicValue);
        }
        if (breakingCapacityCharacteristicValue !== '') {
            informationArray.push(breakingCapacityCharacteristicValue);
        }
        if (polesDescriptionCharacteristicValue !== '') {
            informationArray.push(polesDescriptionCharacteristicValue);
        }
        if (curveCodeCharacteristicValue !== '') {
            informationArray.push(curveCodeCharacteristicValue);
        }
        if (sensitivityCharacteristicValue !== '') {
            informationArray.push(sensitivityCharacteristicValue);
        }
        if (tripUnitCharacteristicValue !== '') {
            informationArray.push(tripUnitCharacteristicValue);
        }
        if (vigiCharacteristicValue !== '') {
            informationArray.push(vigiCharacteristicValue);
        }
        if (descriptionLabel !== '') {
            informationArray.push(descriptionLabel);
        }

        return separateInformationArrayInTwoLines(informationArray)[line];
    };

    /**
     * @description Fills the text of a device basic information 1st line
     * @param {String} the selector of the device picture filtered with the chosen type
     * @param {Array<Device>} the filtered array of the network with only the chosen type devices
     * @returns {String} the line of information to be displayed
     */
    var fillDeviceBasicInformationFirstLine = function (filteredDeviceBasicInformationFirstLineSelector, filteredNetwork, svgOrganisationContainer) {
        var filteredDeviceBasicInformationFirstLineData = svgOrganisationContainer.selectAll(filteredDeviceBasicInformationFirstLineSelector).data(filteredNetwork);
        filteredDeviceBasicInformationFirstLineData.text(function (device) {
            return fillDeviceBasicInformationLineText(device, 0);
        });
    };

    /**
     * @description Fills the text of a device basic information 2nd line
     * @param {String} the selector of the device picture filtered with the chosen type
     * @param {Array<Device>} the filtered array of the network with only the chosen type devices
     * @returns {String} the line of information to be displayed
     */
    var fillDeviceBasicInformationSecondLine = function (filteredDeviceBasicInformationSecondLineSelector, filteredNetwork, svgOrganisationContainer) {
        var filteredDeviceBasicInformationSecondLineData = svgOrganisationContainer.selectAll(filteredDeviceBasicInformationSecondLineSelector).data(filteredNetwork);
        filteredDeviceBasicInformationSecondLineData.text(function (device) {
            return fillDeviceBasicInformationLineText(device, 1);
        });
    };

    /**
     * @description Fills the device picture of all the nodes of a certain type in current network
     * @param {String} the selector of the device picture filtered with the chosen type
     * @param {Array<Device>} the filtered array of the network with only the chosen type devices
     * @returns {} Nothing.
     */
    var fillDevicePicture = function (filteredDevicePictureSelector, filteredNetwork, svgOrganisationContainer) {
        var filteredDevicePictureData = svgOrganisationContainer.selectAll(filteredDevicePictureSelector).data(filteredNetwork);
        filteredDevicePictureData.attr('xlink:href', function (device) {
            return device.product.parts[0].part.image;
        });
    };

    /**
     * @description Fills the device picture of all the nodes of a certain type in current network
     * @param {String} the selector of the device picture filtered with the chosen type
     * @param {Array<Device>} the filtered array of the network with only the chosen type devices
     * @returns {} Nothing.
     */
    var fillDeleteButton = function (filteredDeviceDeleteLabelSelector, filteredNetwork, svgOrganisationContainer) {
        var filteredDeviceDeleteData = svgOrganisationContainer.selectAll(filteredDeviceDeleteLabelSelector).data(filteredNetwork);
        var deleteLabelSizeLimit = 12;
        var deleteLabel = gettextCatalog.getString('switchboard-organisation-delete-device');
        if (deleteLabel.length > deleteLabelSizeLimit) {
            deleteLabel = deleteLabel.slice(0, deleteLabelSizeLimit);
            deleteLabel += '...';
        }
        filteredDeviceDeleteData.text(deleteLabel);
    };

    /**
     * @description Fills the information of all the nodes in current network : it is the information the user will see (references, type, picture...)
     * @returns {} Nothing.
     */
    service.fillDeviceUserInformation = function (svgOrganisationContainer) {
        //we must fill devices by type, so that an electrical device goes with an electrical node (/distribution /measure ...)
        service.activateDistribution(switchboardOrganisationNetworkFlatArrayService.distributionFilteredNetwork(), svgOrganisationContainer);

        fillReferenceLabel(switchboardOrganisationLayoutService.electricalDeviceReferenceLabelSelector, switchboardOrganisationNetworkFlatArrayService.electricalFilteredNetwork(), svgOrganisationContainer);
        fillDeviceQuantity(switchboardOrganisationLayoutService.electricalDeviceQuantityLabelSelector, switchboardOrganisationNetworkFlatArrayService.electricalFilteredNetwork(), svgOrganisationContainer);
        fillDeviceBasicInformationFirstLine(switchboardOrganisationLayoutService.electricalDeviceBasicInformationFirstLineSelector, switchboardOrganisationNetworkFlatArrayService.electricalFilteredNetwork(), svgOrganisationContainer);
        fillDeviceBasicInformationSecondLine(switchboardOrganisationLayoutService.electricalDeviceBasicInformationSecondLineSelector, switchboardOrganisationNetworkFlatArrayService.electricalFilteredNetwork(), svgOrganisationContainer);
        fillDevicePicture(switchboardOrganisationLayoutService.electricalDevicePictureSelector, switchboardOrganisationNetworkFlatArrayService.electricalFilteredNetwork(), svgOrganisationContainer);
        fillDeleteButton(switchboardOrganisationLayoutService.electricalDeviceDeleteButtonLabelSelector, switchboardOrganisationNetworkFlatArrayService.electricalFilteredNetwork(), svgOrganisationContainer);

        fillLeftColorBanner(switchboardOrganisationLayoutService.electricalDeviceLeftColorBannerSelector, switchboardOrganisationNetworkFlatArrayService.electricalFilteredNetwork(), svgOrganisationContainer);
        colorDeviceReferenceLabel(switchboardOrganisationLayoutService.electricalDeviceReferenceLabelSelector, switchboardOrganisationNetworkFlatArrayService.electricalFilteredNetwork(), svgOrganisationContainer);

        fillReferenceLabel(switchboardOrganisationLayoutService.measureDeviceReferenceLabelSelector, switchboardOrganisationNetworkFlatArrayService.measureFilteredNetwork(), svgOrganisationContainer);
        fillDeviceQuantity(switchboardOrganisationLayoutService.measureDeviceQuantityLabelSelector, switchboardOrganisationNetworkFlatArrayService.measureFilteredNetwork(), svgOrganisationContainer);
        fillDeviceBasicInformationFirstLine(switchboardOrganisationLayoutService.measureDeviceBasicInformationFirstLineSelector, switchboardOrganisationNetworkFlatArrayService.measureFilteredNetwork(), svgOrganisationContainer);
        fillDeviceBasicInformationSecondLine(switchboardOrganisationLayoutService.measureDeviceBasicInformationSecondLineSelector, switchboardOrganisationNetworkFlatArrayService.measureFilteredNetwork(), svgOrganisationContainer);
        fillDevicePicture(switchboardOrganisationLayoutService.measureDevicePictureSelector, switchboardOrganisationNetworkFlatArrayService.measureFilteredNetwork(), svgOrganisationContainer);
        fillDeleteButton(switchboardOrganisationLayoutService.measureDeviceDeleteButtonLabelSelector, switchboardOrganisationNetworkFlatArrayService.measureFilteredNetwork(), svgOrganisationContainer);

        fillLeftColorBanner(switchboardOrganisationLayoutService.measureDeviceLeftColorBannerSelector, switchboardOrganisationNetworkFlatArrayService.measureFilteredNetwork(), svgOrganisationContainer);
        colorDeviceReferenceLabel(switchboardOrganisationLayoutService.measureDeviceReferenceLabelSelector, switchboardOrganisationNetworkFlatArrayService.measureFilteredNetwork(), svgOrganisationContainer);

        fillReferenceLabel(switchboardOrganisationLayoutService.surgeArresterDeviceReferenceLabelSelector, switchboardOrganisationNetworkFlatArrayService.surgeArresterFilteredNetwork(), svgOrganisationContainer);
        fillDeviceQuantity(switchboardOrganisationLayoutService.surgeArresterDeviceQuantityLabelSelector, switchboardOrganisationNetworkFlatArrayService.surgeArresterFilteredNetwork(), svgOrganisationContainer);
        fillDeviceBasicInformationFirstLine(switchboardOrganisationLayoutService.surgeArresterBasicInformationFirstLineSelector, switchboardOrganisationNetworkFlatArrayService.surgeArresterFilteredNetwork(), svgOrganisationContainer);
        fillDeviceBasicInformationSecondLine(switchboardOrganisationLayoutService.surgeArresterBasicInformationSecondLineSelector, switchboardOrganisationNetworkFlatArrayService.surgeArresterFilteredNetwork(), svgOrganisationContainer);
        fillDevicePicture(switchboardOrganisationLayoutService.surgeArresterDevicePictureSelector, switchboardOrganisationNetworkFlatArrayService.surgeArresterFilteredNetwork(), svgOrganisationContainer);
        fillDeleteButton(switchboardOrganisationLayoutService.surgeArresterDeviceDeleteButtonLabelSelector, switchboardOrganisationNetworkFlatArrayService.surgeArresterFilteredNetwork(), svgOrganisationContainer);

        fillLeftColorBanner(switchboardOrganisationLayoutService.surgeArresterDeviceLeftColorBannerSelector, switchboardOrganisationNetworkFlatArrayService.surgeArresterFilteredNetwork(), svgOrganisationContainer);
        colorDeviceReferenceLabel(switchboardOrganisationLayoutService.surgeArresterDeviceReferenceLabelSelector, switchboardOrganisationNetworkFlatArrayService.surgeArresterFilteredNetwork(), svgOrganisationContainer);
    };


    /**
     * @description appends all devices in a ddevice category to d3 thanks to svg template
     * @param type devices type to look for
     * @param cloneFunction function to get template
     * @param htmlType html type attribute
     * @param callbak callback to call (drag in our case)
     */
    service.appendDevices = function (type, cloneFunction, htmlType, callbak, svgOrganisationContainer) {
        var i;
        for (i = 0; i < switchboardOrganisationNetworkFlatArrayService.deviceTypesJustAdded[type]; i++) {
            var res = svgOrganisationContainer.append(cloneFunction)
                .attr(switchboardOrganisationLayoutService.dataTypeHTMLAttribute, htmlType)
                .classed('hide', false);
            if (callbak) {
                res.call(callbak);
            }
        }
    };

    /**
     * @description Clones the electrical device template node in order to create a new electrical device
     * @returns {} Nothing.
     */
    service.cloneElectricalDeviceTemplateNode = function () {
        return d3.select(switchboardOrganisationLayoutService.electricalTemplateDeviceSelector).node().cloneNode(true);
    };

    /**
     * @description Clones the distribution template node in order to create a new distribution
     * @returns {} Nothing.
     */
    service.cloneDistributionTemplateNode = function () {
        return d3.select(switchboardOrganisationLayoutService.distributionTemplateDeviceSelector).node().cloneNode(true);
    };

    /**
     * @description Clones the measure device template node in order to create a new measure device
     * @returns {} Nothing.
     */
    service.cloneMeasureDeviceTemplateNode = function () {
        return d3.select(switchboardOrganisationLayoutService.measureTemplateDeviceSelector).node().cloneNode(true);
    };

    /**
     * @description Clones the surge arrester device template node in order to create a new surge arrester device
     * @returns {} Nothing.
     */
    service.cloneSurgeArresterDeviceTemplateNode = function () {
        return d3.select(switchboardOrganisationLayoutService.surgeArresterTemplateDeviceSelector).node().cloneNode(true);
    };

    /**
     * @description Sets the HTML attributes of all the nodes of a certain type in current network : data-level and data-network-type
     * @param {String} the selector of the device containers filtered with the chosen type
     * @param {Array<Device>} the filtered array of the network with only the chosen type devices
     * @returns {} Nothing.
     */
    var setDeviceHTMLAttributesForADeviceType = function (filteredDeviceContainerSelector, filteredNetwork, svgOrganisationContainer) {

        var filteredNodeData = svgOrganisationContainer.selectAll(filteredDeviceContainerSelector).data(filteredNetwork);

        filteredNodeData.attr(switchboardOrganisationLayoutService.dataLevelHTMLAttribute, function (device) {
            return switchboardOrganisationNetworkDecorationService.getDeviceLevelAttribute(device);
        });

        filteredNodeData.attr(switchboardOrganisationLayoutService.dataRowHTMLAttribute, function (device) {
            return switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(device);
        });

        filteredNodeData.attr(switchboardOrganisationLayoutService.dataTypeHTMLAttribute, function (device) {
            return switchboardOrganisationNetworkDecorationService.getDeviceTypeAttribute(device);
        });
    };

    /**
     * @description Sets the HTML attributes of all the nodes in current network : data-level and data-network-type
     * @returns {} Nothing.
     */
    service.setDeviceHTMLAttributes = function (svgOrganisationContainer) {
        setDeviceHTMLAttributesForADeviceType(switchboardOrganisationLayoutService.distributionDeviceContainerSelector, switchboardOrganisationNetworkFlatArrayService.distributionFilteredNetwork(), svgOrganisationContainer);
        setDeviceHTMLAttributesForADeviceType(switchboardOrganisationLayoutService.electricalDeviceContainerSelector, switchboardOrganisationNetworkFlatArrayService.electricalFilteredNetwork(), svgOrganisationContainer);
        setDeviceHTMLAttributesForADeviceType(switchboardOrganisationLayoutService.measureDeviceContainerSelector, switchboardOrganisationNetworkFlatArrayService.measureFilteredNetwork(), svgOrganisationContainer);
        setDeviceHTMLAttributesForADeviceType(switchboardOrganisationLayoutService.surgeArresterDeviceContainerSelector, switchboardOrganisationNetworkFlatArrayService.surgeArresterFilteredNetwork(), svgOrganisationContainer);
    };

    /**
     * @description hides the add incomer button
     * @param Nothing
     */
    service.hideAddIncomerButton = function () {
        d3.select(switchboardOrganisationLayoutService.addIncomerSelector)
            .attr('visibility', 'hidden');
    };

    /**
     * @description shows the add incomer button
     * @param Nothing
     */
    service.showAddIncomerButton = function () {
        d3.select(switchboardOrganisationLayoutService.addIncomerSelector).attr('visibility', 'visible');
        d3.select(switchboardOrganisationLayoutService.addIncomerTextLabelSelector).text('Add incomer device');
    };

    /**
     * @description update translation and position of the add incomer button
     * @param Nothing
     */
    service.updateAddIncomerButtonPosition = function () {
        var translateY = switchboardOrganisationNetworkFlatArrayService.networkFlatArray.length * (switchboardOrganisationLayoutService.deviceContainerHeight + switchboardOrganisationLayoutService.deviceContainerVerticalMargin);
        d3.select(switchboardOrganisationLayoutService.addIncomerSelector).attr('transform', 'translate(0,' + translateY + ')');

        var addIncomerTestLabel = gettextCatalog.getString('switchboard-organisation-add-device-level-one');
        d3.select(switchboardOrganisationLayoutService.addIncomerTextLabelSelector).text(addIncomerTestLabel);
    };

    return service;

});
