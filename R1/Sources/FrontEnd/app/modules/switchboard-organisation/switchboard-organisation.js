'use strict';

/**
 * switchboard-distribution controller
 */
angular.module('switchboardOrganisation').controller('switchboardOrganisation', function(_, $timeout, $scope,
                                                                                         switchboardOrganisationService, Project, networkService, deviceConfigurationService,
                                                                                         distributionConfigurationService, gettextCatalog, logger, d3, dialogService, ProductPack, detailedDeviceModalService, quantityDeviceModalService,
                                                                                         Part, switchboardOrganisationLayoutService, switchboardOrganisationNetworkFlatArrayService, switchboardOrganisationNetworkDecorationService, switchboardOrganisationDragAndDropService, switchboardOrganisationUpdateService) {

        var network = Project.current.selectedSwitchboard.network;

        var configureRequestKey = 'configure';
        var modifyRequestKey = 'modify';

        //D3 objects
        var switchboardOrganisationContainer = d3.select(switchboardOrganisationLayoutService.switchboardOrganisationContainerSelector);
        var svgOrganisationContainer = d3.select(switchboardOrganisationLayoutService.svgOrganisationContentContainerSelector);
        var svgOrganisationHeaderContainer = d3.select(switchboardOrganisationLayoutService.svgOrganisationHeaderContainerSelector);
        var svOrganisationContainerLevelColumn = d3.selectAll(switchboardOrganisationLayoutService.svOrganisationContainerLevelColumnSelector);
        var svOrganisationContainerLevelSeparatorColumn = d3.selectAll(switchboardOrganisationLayoutService.svOrganisationContainerLevelColumnSeparatorSelector);

        switchboardOrganisationNetworkFlatArrayService.network = network;
        switchboardOrganisationNetworkFlatArrayService.clearNetworkFlatArray();
        switchboardOrganisationNetworkFlatArrayService.transformNetworkTreeIntoFlatArray();
        switchboardOrganisationNetworkFlatArrayService.initDeviceTypesJustAdded();
        switchboardOrganisationDragAndDropService.init();

        $scope.networkWarnings = function() {
            return _.filter(switchboardOrganisationNetworkFlatArrayService.networkFlatArray, function(device){
                return (device.warnings.concat(device.product.warnings).length > 0);
            }).length ;
        };

        //region Drag and drop
        /**
         * @description Callback called only once when drag start
         */
        var dragstarted = function (d) {
            var draggingDevice = d;
            var draggingDeviceClasses = d3.event.sourceEvent.target.className.animVal;
            if (draggingDeviceClasses.indexOf('non-draggable-zone') === -1) {
                d3.select(this).attr('pointer-events', 'none');
                switchboardOrganisationDragAndDropService.fillDropAreaDataTab(draggingDevice);
                switchboardOrganisationDragAndDropService.generateDragDropDebugGrid(svgOrganisationContainer);
                var matrix = this.transform.baseVal.getItem(0).matrix;
                var x0 = matrix.e;
                var y0 = matrix.f;
                switchboardOrganisationDragAndDropService.hideSubTreeAndCount(this.__data__, x0, y0);
                switchboardOrganisationUpdateService.hideAddIncomerButton();
            } else {
                // prevent mouse click event when click outside of draggable zone
                var x = d3.event.sourceEvent.pageX;
                var y = d3.event.sourceEvent.pageY;

                var mouseEvt = document.createEvent('MouseEvents');
                mouseEvt.initMouseEvent('mouseup', true, true, window, 1, x, y, x, y, false, false, false, false, 0, null);
                this.dispatchEvent(mouseEvt);

                return null;
            }
        };

        /**
         * @description Callback called every time pointer is moved
         */
        var dragged = function (d) {
            var draggingDevice = d;
            var draggingDeviceClasses = d3.event.sourceEvent.target.className.animVal;
            if (draggingDeviceClasses.indexOf('non-draggable-zone') === -1){
                var svgOrg = d3.select(switchboardOrganisationLayoutService.switchboardOrganisationContainerSelector);
                var coordinates = d3.mouse(svgOrganisationContainer.node());
                var y = coordinates[1] * switchboardOrganisationLayoutService.zoomCoeff;
                var h = svgOrg.node().getBoundingClientRect().height, sT = svgOrg.property('scrollTop');

                draggingDevice.x = d3.event.x;
                draggingDevice.y = d3.event.y;

                d3.select(this).classed('dragging', true).attr('pointer-events', 'none');
                d3.select(this).attr('transform', 'translate(' + draggingDevice.x + ',' + (draggingDevice.y) + ')');

                var droppingArea = switchboardOrganisationDragAndDropService.getDroppingArea(coordinates);

                switchboardOrganisationDragAndDropService.highlightDropArea(droppingArea);

                var bottomMargin = 0;
                if (y > h + sT + bottomMargin) {
                    svgOrg.property('scrollTop',y - h - bottomMargin);
                } else if (y < sT) {
                    svgOrg.property('scrollTop',y);
                }
            } else {
                return null;
            }
        };
        /**
         * @description Callback called when drop
         */
        var dragended = function (d) {
            var draggingDevice = d;
            d3.select(this).attr('pointer-events', 'all').classed('dragging', false);
            switchboardOrganisationDragAndDropService.removeDragDropGrid();

            var svgPointerCoordinates = d3.mouse(this.parentNode);
            var droppingArea = switchboardOrganisationDragAndDropService.getDroppingArea(svgPointerCoordinates);
            var cancel =
                !droppingArea ||
                (droppingArea.row === switchboardOrganisationNetworkFlatArrayService.networkFlatArray.indexOf(draggingDevice) &&
                droppingArea.level === switchboardOrganisationNetworkDecorationService.convertToLevelNumber(switchboardOrganisationNetworkDecorationService.getDeviceLevelAttribute(draggingDevice)));
            switchboardOrganisationDragAndDropService.showSubTreeHideCount(draggingDevice, cancel);
            switchboardOrganisationUpdateService.showAddIncomerButton();

            var result = null;
            var ungroupedDevices = [];
            if (droppingArea !== null && droppingArea !== undefined && droppingArea.droppableZone) {
                var hadChildren = draggingDevice.children && draggingDevice.children.length > 0;
                if (droppingArea.parent===draggingDevice.parent && droppingArea.row > switchboardOrganisationNetworkFlatArrayService.networkFlatArray.indexOf(draggingDevice)) {
                    result = networkService.moveDevice(draggingDevice, droppingArea.parent, droppingArea.childIndex - 1, droppingArea.distributionDownstream);
                } else {
                    if (droppingArea.parent === null || droppingArea.parent.quantity === 1) {
                        result = networkService.moveDevice(draggingDevice, droppingArea.parent, droppingArea.childIndex, droppingArea.distributionDownstream);
                    } else {
                        ungroupedDevices = networkService.ungroupDevice(droppingArea.parent, droppingArea.parent.quantity-1);
                        if (ungroupedDevices.length === 2) {
                            result = networkService.moveDevice(draggingDevice, ungroupedDevices[0], droppingArea.childIndex, droppingArea.distributionDownstream);
                            //hypothesis : addedDevices contains only one distribution (if there was already other children, we wouldn't be in a case where we need to ungroup devices)
                            result.addedDevices = result.addedDevices.concat([ungroupedDevices[1]]);
                        } else {
                            //Internal error : ungrouping devices failed
                            logger.warning(gettextCatalog.getString('SWITCHBOARD_ORGANISATION_OPERATION_NOT_YET_SUPPORTED'), '', 'switchboard-organisation', true, null, { timeOut: 7000, showUser: true });
                        }
                    }
                }

                switchboardOrganisationNetworkFlatArrayService.moveDeviceInNetworkFlatArray(result, droppingArea, hadChildren);

                if (result.deletedDevice !== null) {
                    //delete device node in D3 : we do it here because it is easy to spot which node to delete right now
                    var updateNode = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.deviceContainerSelector);
                    updateNode.filter(function (device) {
                        return device === result.deletedDevice;
                    }).remove();
                }
            }

            Project.current.isProjectDirty = true;
            Project.current.selectedSwitchboard.isSolutionDirty = true;
            switchboardOrganisationDragAndDropService.clearDropAreaTab();
            update();
            if (ungroupedDevices !== null && ungroupedDevices.length === 2) {
                highlightDevice(switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(ungroupedDevices[0]));
                highlightDevice(switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(ungroupedDevices[1]));
            }

            if (ungroupedDevices !== null && ungroupedDevices.length > 0) {
                scrollToDevice(switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(ungroupedDevices[0]), true, 50);
            }
        };

        var drag = d3.behavior.drag()
            .origin(function (d) {
                var row = switchboardOrganisationNetworkDecorationService.getDeviceIndex(d);
                var level = switchboardOrganisationNetworkDecorationService.convertToLevelNumber(switchboardOrganisationNetworkDecorationService.getDeviceLevelAttribute(d));
                var coordinates = {};
                coordinates.x = level * 340;
                coordinates.y = row * 125;
                return coordinates;
            })
            .on('dragstart', dragstarted)
            .on('drag', dragged)
            .on('dragend', dragended);

        //endregion

        //region Actions for one device
        /**
         * @description Defines the behaviour of the device : if it is possible to add a downstream device, etc.
         * @param {D3_Data} the device containers node data
         * @returns {} Nothing.
         */
        var defineDeviceErgonomicBehaviours = function (deviceContainerNodeData) {

            /**
             * Hides all drop down menus
             * @param device
             */
            var hideDropDown = function () {
                deviceContainerNodeData.select(switchboardOrganisationLayoutService.dropDownSelector).style('display', 'none');
            };
            //=========\\

            //=========\\
            // ADD A DOWNSTREAM DEVICE
            //
            //if device is a final leaf, or if device is already distributed, then user can't add downstream devices to it
            deviceContainerNodeData.select(switchboardOrganisationLayoutService.deviceAddDownstreamDeviceButtonSelector).attr(switchboardOrganisationLayoutService.dataHideAddDownstreamDeviceButtonAttribute, function (device) {
                return (switchboardOrganisationNetworkDecorationService.isDeviceAFinalLeaf(device) || switchboardOrganisationNetworkDecorationService.hasAlreadyADownstreamDistribution(device) || switchboardOrganisationNetworkDecorationService.wouldCreateASecondMainDistribution(device));
            });

            deviceContainerNodeData.selectAll(switchboardOrganisationLayoutService.deviceAddDownstreamDeviceButtonHiddenSelector).style('visibility', 'hidden');
            deviceContainerNodeData.selectAll(switchboardOrganisationLayoutService.deviceAddDownstreamDeviceButtonVisibleSelector).style('visibility', 'visible');

            //for devices for which user can add downstream devices
            deviceContainerNodeData.select(switchboardOrganisationLayoutService.deviceAddDownstreamDeviceButtonSelector).on('click', function (device) {

                hideDropDown();
                deviceConfigurationService.configureDevice(configureRequestKey).result.then(function (productPackTab) {
                    if (productPackTab.length >= 1) {
                        productPackTab.forEach(function (productPack) {
                            var productPackType = networkService.electricalDeviceType;

                            if (_.contains(productPack.rangeItem.metaRanges, 'metarange-selector-measure')) {
                                productPackType = networkService.measureDeviceType;
                            } else if (_.contains(productPack.rangeItem.metaRanges, 'metarange-selector-surge-arester')) {
                                productPackType = networkService.surgeArresterDeviceType;
                            }

                            var addedDevices = null;
                            var ungroupedDevices = [];
                            for (var i = 0; i < productPack.deviceQuantity; i++) {
                                if (device.children.length >= 1 && device.children[0].type === networkService.distributionType){
                                    addedDevices = networkService.addDownstreamDevice(device.children[0], productPack, productPackType);
                                } else {
                                    if (device.quantity === 1) {
                                        addedDevices = networkService.addDownstreamDevice(device, productPack, productPackType);
                                    } else {
                                        ungroupedDevices = networkService.ungroupDevice(device, device.quantity - 1);
                                        if (ungroupedDevices.length === 2) {
                                            addedDevices = [ungroupedDevices[1]];
                                            var additionalDevices = networkService.addDownstreamDevice(ungroupedDevices[0], productPack, productPackType);
                                            addedDevices = additionalDevices.concat(addedDevices);
                                        } else {
                                            //Internal error : ungrouping devices failed
                                            logger.warning(gettextCatalog.getString('SWITCHBOARD_ORGANISATION_OPERATION_NOT_YET_SUPPORTED'), '', 'switchboard-organisation', true, null, { timeOut: 7000, showUser: true });
                                        }
                                    }
                                }

                                //insert the devices at the right place : under their parent, and under their elder brothers' children
                                if (addedDevices !== null) {
                                    addedDevices.forEach(switchboardOrganisationNetworkFlatArrayService.insertDeviceInNetworkFlatArray);
                                } else {
                                    //several main distributions : not supported
                                    logger.warning(gettextCatalog.getString('SWITCHBOARD_ORGANISATION_OPERATION_NOT_YET_SUPPORTED'), '', 'switchboard-organisation', true, null, { timeOut: 7000, showUser: true });
                                }
                            }
                            delete productPack.deviceQuantity;

                            update();
                            if (ungroupedDevices !== null && ungroupedDevices.length === 2) {
                                highlightDevice(switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(ungroupedDevices[0]));
                                highlightDevice(switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(ungroupedDevices[1]));
                            }
                            if (ungroupedDevices !== null && ungroupedDevices.length > 0) {
                                scrollToDevice(switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(ungroupedDevices[0]), true, 50);
                            }
                        });
                    }
                });
            });
            //=========\\

            //=========\\
            // DRAG AREA
            //
            //if device is a final leaf, or if device is already distributed, then user can't add downstream devices to it
            deviceContainerNodeData.select(switchboardOrganisationLayoutService.deviceDragAreaSelector).style('display', 'initial');

            //=========\\
            // DEVICE QUANTITY
            //
            deviceContainerNodeData.select(switchboardOrganisationLayoutService.deviceQuantityContainerSelector)
                .style('visibility', function(device){
                    if (device.quantity === 1){
                        return 'hidden';
                    } else {
                        return 'visible';
                    }
                }).on('click', function (device){
                    quantityDeviceModalService.quantityDeviceModal(device).result.then(function (result) {
                        if (result === 'ok'){
                            update();
                        }
                    });
                });

            //=========\\
            // DELETE
            //
            deviceContainerNodeData.selectAll(switchboardOrganisationLayoutService.deviceDeleteDeviceButtonHiddenSelector).style('visibility', 'hidden');
            deviceContainerNodeData.selectAll(switchboardOrganisationLayoutService.deviceDeleteDeviceButtonVisibleSelector).style('visibility', 'visible');

            /**
             * @description Remove a device from network
             * @param {D3_Data} the device node data
             * @param {Boolean} true for deleting device's children as well
             * @returns {} Nothing.
             */
            var deleteDevice = function (device, deleteChildren) {
                //delete device from the network in model
                var deletedDevices = [];
                if (deleteChildren) {
                    deletedDevices = networkService.deleteDevice(device);
                } else {
                    deletedDevices = networkService.deleteDeviceAndKeepChildren(device);
                }

                var updateNode = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.deviceContainerSelector);

                var removedElementsNumber = deletedDevices.length;

                //update viewbox
                switchboardOrganisationLayoutService.viewBoxHeight -= removedElementsNumber * (switchboardOrganisationLayoutService.deviceContainerHeight + switchboardOrganisationLayoutService.deviceContainerVerticalMargin);
                $scope.setSvgContainerViewBoxSize();

                //HACK AFT new switcboard organisation manipulation
                deletedDevices.forEach(function(deletedDevice){
                    //delete device from the network flat array (network in view)
                    switchboardOrganisationNetworkFlatArrayService.removeDeviceFromNetworkFlatArray(deletedDevice);

                    //delete device node in D3 : we do it here because it is easy to spot which node to delete right now
                    updateNode.filter(function (device) {
                        return device === deletedDevice;
                    }).remove();
                });
                if (switchboardOrganisationNetworkFlatArrayService.networkFlatArray && switchboardOrganisationNetworkFlatArrayService.networkFlatArray.length < 1) {
                    // delete additional products
                    Project.current.selectedSwitchboard.additionalProductsBasket.clearProducts();

                }
                update();
            };

            var deleteDistribution = function (device) {
                //remove commercial product
                networkService.modifyDistribution(device, null);
                // remove warnings
                device.warnings = [] ;
                //set distributions visual layout
                switchboardOrganisationUpdateService.activateDistribution(switchboardOrganisationNetworkFlatArrayService.distributionFilteredNetwork(), svgOrganisationContainer);
                update();
            };



            deviceContainerNodeData.select(switchboardOrganisationLayoutService.deviceDeleteButtonSelector).on('click', function (device) {
                hideDropDown();
                if (device.type === networkService.distributionType) {
                    dialogService.showYesNoDialog(gettextCatalog.getString('switchboard-organisation-delete-distribution-warning')).result.then(function (result) {
                        if (result) {
                            deleteDistribution(device);
                        }
                    });
                } else if (device.children.length !== 0){
                    var deleteBranchDialogModalTitle = gettextCatalog.getString('delete-branch-dialog-modal-title');
                    var deleteBranchDialogModalMessage = gettextCatalog.getString('delete-branch-dialog-modal-message');
                    var deleteDeviceAndChildrenLabel = gettextCatalog.getString('device-and-children-button-label');
                    var deleteDeviceOnlyLabel = gettextCatalog.getString('device-only-button-label');
                    dialogService.showChoicesDialog(deleteBranchDialogModalTitle, deleteBranchDialogModalMessage, deleteDeviceOnlyLabel, deleteDeviceAndChildrenLabel, false, false).result.then(function (result) {
                        if (result === deleteDeviceAndChildrenLabel) {
                            deleteDevice(device, true);
                        } else if (result === deleteDeviceOnlyLabel) {
                            deleteDevice(device, false);
                        }
                    });
                } else {
                    dialogService.showYesNoDialog(gettextCatalog.getString('switchboard-organisation-delete-simple-device-warning')).result.then(function (result) {
                        if (result) {
                            deleteDevice(device, false);
                        }
                    });
                }
            });

            //=========\\

            //=========\\
            // MODIFY
            //
            var distributionDeviceModifyFunction = function (device) {
                hideDropDown();
                var d3DistributionLevel = switchboardOrganisationNetworkDecorationService.getDeviceLevelAttribute(device);
                var distributionLevel;

                switch (d3DistributionLevel) {
                    case switchboardOrganisationLayoutService.deviceFirstLevel:
                        distributionLevel = 'MAIN';
                        break;
                    case switchboardOrganisationLayoutService.deviceSecondLevel:
                        distributionLevel = 'SECONDARY';
                        break;
                    default:
                        break;
                }

                var requestKey = configureRequestKey;
                if (device.product.parts[0].part.partCode !== '') {
                    requestKey = modifyRequestKey;
                }

                distributionConfigurationService.configureDistribution(distributionLevel, requestKey, device).result.then(function (productPack) {
                    if (productPack !== null) {
                        delete productPack.deviceQuantity;
                        networkService.modifyDistribution(device, productPack);
                        update();
                    }
                });
            };

            deviceContainerNodeData.select(switchboardOrganisationLayoutService.distributionFakeModifySelector).on('click', function(device){
                //TODO hack AFT: when create a new distribution, a first on'click' listener is registered
                //then if you set the device with a distribution range, a second on'click' listener is registered
                //and also binded to the distributionDeviceModifyFunction function
                // >> bad behavior
                if (device.product.parts[0].part.partCode === ''){
                    distributionDeviceModifyFunction(device);
                }
            });
            deviceContainerNodeData.select(switchboardOrganisationLayoutService.distributionDeviceModifyButtonSelector).on('click',  function(device){
                distributionDeviceModifyFunction(device);
            });

            $(document).click(function (event) {
                if (event.target.className.animVal === 'device-delete-drop-down-related') {
                    hideDropDown();
                }
            });

            var electricalDeviceModifyFunction = function (device) {
                deviceConfigurationService.configureDevice(modifyRequestKey, device).result.then(function (productPackTab) {
                    productPackTab.forEach(function (productPack) {
                        if (productPack !== null) {
                            var productPackType = networkService.electricalDeviceType;

                            if (_.contains(productPack.rangeItem.metaRanges, 'metarange-selector-measure')) {
                                productPackType = networkService.measureDeviceType;
                            } else if (_.contains(productPack.rangeItem.metaRanges, 'metarange-selector-surge-arester')) {
                                productPackType = networkService.surgeArresterDeviceType;
                            }

                            if (productPack.deviceQuantity === 1) {
                                delete productPack.deviceQuantity;
                                networkService.modifyDevice(device, productPack);
                                update();
                            } else {
                                delete productPack.deviceQuantity;
                                //device type change or ungrouped quantity change : we do nothing and raise an excuse error message
                                logger.warning(gettextCatalog.getString('SWITCHBOARD_ORGANISATION_OPERATION_NOT_YET_SUPPORTED'), '', 'switchboard-organisation', true, null, { timeOut: 7000, showUser: true });
                            }
                        }
                    });
                });
            };

            deviceContainerNodeData.select(switchboardOrganisationLayoutService.electricalDeviceModifyButtonSelector).on('click', electricalDeviceModifyFunction);
            deviceContainerNodeData.select(switchboardOrganisationLayoutService.measureDeviceModifyButtonSelector).on('click', electricalDeviceModifyFunction);
            deviceContainerNodeData.select(switchboardOrganisationLayoutService.surgeArresterDeviceModifyButtonSelector).on('click', electricalDeviceModifyFunction);

            //=========\\

            //=========\\
            // DUPLICATE
            //
            deviceContainerNodeData.select(switchboardOrganisationLayoutService.deviceDuplicateButtonSelector).on('click', function (device) {
                hideDropDown();

                var duplicateBranchDialogModalTitle = gettextCatalog.getString('duplicate-branch-dialog-modal-title');
                var duplicateBranchDialogModalMessage = gettextCatalog.getString('duplicate-branch-dialog-modal-message');
                var duplicateDeviceAndChildrenLabel = gettextCatalog.getString('device-and-children-button-label');
                var duplicateDeviceOnlyLabel = gettextCatalog.getString('device-only-button-label');
                var disableDuplicateBranchChoice = switchboardOrganisationNetworkDecorationService.wouldCreateASecondMainDistributionIfDuplicated(device);
                if (device.children.length > 0){

                    dialogService.showChoicesDialog(duplicateBranchDialogModalTitle, duplicateBranchDialogModalMessage, duplicateDeviceOnlyLabel, duplicateDeviceAndChildrenLabel, false, disableDuplicateBranchChoice).result.then(function (result) {
                        if (result === ''){
                            return;
                        }
                        var addedDevices = [];
                        if (result === duplicateDeviceAndChildrenLabel) {
                            addedDevices = networkService.duplicateDevice(device, true);
                            for (var i = 0; i < addedDevices.length; i++) {
                                switchboardOrganisationNetworkFlatArrayService.insertDeviceInNetworkFlatArray(addedDevices[i]);
                            }
                        } else if (result === duplicateDeviceOnlyLabel) {
                            addedDevices = networkService.duplicateDevice(device, false);
                            if (addedDevices.length > 0) {
                                switchboardOrganisationNetworkFlatArrayService.insertDeviceInNetworkFlatArray(addedDevices[0]);
                            }
                        }

                        update();
                        if (addedDevices.length > 0) {
                            scrollToDevice(switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(addedDevices[0]), true, 50);
                        }
                    });

                } else {
                    var addedDevices = networkService.duplicateDevice(device, false);
                    if (addedDevices.length > 0) {
                        switchboardOrganisationNetworkFlatArrayService.insertDeviceInNetworkFlatArray(addedDevices[0]);
                    }update();
                    if (addedDevices.length > 0) {
                        scrollToDevice(switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(addedDevices[0]), true, 50);
                    }
                }
            });
            //=========\\

            //=========\\
            // EXPAND INFOS
            //
            deviceContainerNodeData.select(switchboardOrganisationLayoutService.deviceReferenceLabelSelector).on('click', function (device) {
                detailedDeviceModalService.detailedDeviceModal(device);
            });
            //=========\\

            //=========\\
            // DISTRIBUTION WARNING
            //
            deviceContainerNodeData.select(switchboardOrganisationLayoutService.deviceWarningButtonSelector).on('click', function (device) {
                var warnings = device.warnings.concat(device.product.warnings);
                if (warnings.length > 0){
                    dialogService.showWarning([gettextCatalog.getString(warnings[0].message)]);
                }
            });
            //=========\\
        };
        //endregion

        /**
         * @description Defines the behaviour of the global organisation
         * @param {} Nothing.
         * @returns {} Nothing.
         */
        var defineGlobalErgonomicBehaviours = function () {
            //bind click to the same behavior as top button "add incomer devices first level"
            d3.select(switchboardOrganisationLayoutService.addIncomerSelector).on('click', function () {
                $scope.addIncomerDevice();
            });
        };

        //region D3 cycles : update function
        /**
         * @description D3 update function : to be called each time the whole network needs to be updated
         */
        var update = function () {
            //=================================================================================\\
            //  1st UPDATE PHASE : update view for existing elements
            //=================================================================================\\
            //for all existing devices

            var updateNode = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.deviceContainerSelector);
            var updateNodeData = updateNode.data(switchboardOrganisationNetworkFlatArrayService.networkFlatArray);

            svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.polylinesSelector).remove();

            //nothing else seems to be needed here for the moment

            //=================================================================================\\
            //  ENTER PHASE : add new elements to view
            //=================================================================================\\
            //for new devices
            var nodeEnter = updateNodeData.enter();

            //number of new elements
            var enteredElementsNumber = nodeEnter.size();

            //update viewbox
            switchboardOrganisationLayoutService.viewBoxHeight += enteredElementsNumber * (switchboardOrganisationLayoutService.deviceContainerHeight + switchboardOrganisationLayoutService.deviceContainerVerticalMargin);
            $scope.setSvgContainerViewBoxSize();

            //for each new device, add new svg template device code : distribution or electrical device following type
            switchboardOrganisationUpdateService.appendDevices(networkService.distributionType, switchboardOrganisationUpdateService.cloneDistributionTemplateNode, switchboardOrganisationLayoutService.distributionDeviceHTMLType, null, svgOrganisationContainer);
            switchboardOrganisationUpdateService.appendDevices(networkService.electricalDeviceType, switchboardOrganisationUpdateService.cloneElectricalDeviceTemplateNode, switchboardOrganisationLayoutService.electricalDeviceHTMLType, drag, svgOrganisationContainer);
            switchboardOrganisationUpdateService.appendDevices(networkService.measureDeviceType, switchboardOrganisationUpdateService.cloneMeasureDeviceTemplateNode, switchboardOrganisationLayoutService.measureDeviceHTMLType, drag, svgOrganisationContainer);
            switchboardOrganisationUpdateService.appendDevices(networkService.surgeArresterDeviceType, switchboardOrganisationUpdateService.cloneSurgeArresterDeviceTemplateNode, switchboardOrganisationLayoutService.surgeArresterDeviceHTMLType, drag, svgOrganisationContainer);

            switchboardOrganisationNetworkFlatArrayService.clearDeviceTypesJustAdded();

            networkService.checkDistributionsCompatibility().then( function(){
                switchboardOrganisationUpdateService.updateWarnings(switchboardOrganisationLayoutService.distributionDeviceWarningButtonSelector, switchboardOrganisationNetworkFlatArrayService.distributionFilteredNetwork(), svgOrganisationContainer);
                switchboardOrganisationUpdateService.updateWarnings(switchboardOrganisationLayoutService.electricalDeviceWarningButtonSelector, switchboardOrganisationNetworkFlatArrayService.electricalFilteredNetwork(), svgOrganisationContainer);
                switchboardOrganisationUpdateService.updateWarnings(switchboardOrganisationLayoutService.measureDeviceWarningButtonSelector, switchboardOrganisationNetworkFlatArrayService.measureFilteredNetwork(), svgOrganisationContainer);
                switchboardOrganisationUpdateService.updateWarnings(switchboardOrganisationLayoutService.surgeArresterDeviceWarningButtonSelector, switchboardOrganisationNetworkFlatArrayService.surgeArresterFilteredNetwork(), svgOrganisationContainer);

                //=================================================================================\\
                //  2nd UPDATE PHASE : update view for existing and entering elements
                //=================================================================================\\

                //update useful variables
                updateNode = svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.deviceContainerSelector);
                updateNodeData = updateNode.data(switchboardOrganisationNetworkFlatArrayService.networkFlatArray);

                //make a global update : new devices are the real target, but it is easier in D3 to make it this way
                switchboardOrganisationUpdateService.setDeviceHTMLAttributes(svgOrganisationContainer);

                switchboardOrganisationUpdateService.fillDeviceUserInformation(svgOrganisationContainer);

                defineDeviceErgonomicBehaviours(updateNodeData);

                defineGlobalErgonomicBehaviours();

                switchboardOrganisationUpdateService.placeDeviceOnSvgOrganisation(updateNodeData, updateNode, svgOrganisationContainer);

                //=================================================================================\\
                //  EXIT PHASE : remove from view elements that have been removed
                //=================================================================================\\
                //for removed devices
                //var nodeExit = updateNodeData.exit();

                //We are supposed to remove here device svg node from d3
                //However, it is hard to choose the right node corresponding to the deleted device
                //So we remove the d3 node in delete callback command, and do nothing here.

                $scope.applyZoom();
            });

        };
        //endregion

        $scope.$on('languageChanged', function () {
            // change a svg attribute to force recalculation of svg texts
            svgOrganisationContainer.attr('language', new Date().getTime());
            update();
        });

        /**
         * @description Set svg container view box size, adjusting columns, from $scope.viewBoxWidth and $scope.viewBoxHeight
         * @returns {} Nothing.
         */
        $scope.setSvgContainerViewBoxSize = function () {
            svgOrganisationContainer.attr('viewBox', '0 0 ' + switchboardOrganisationLayoutService.viewBoxWidth + ' ' + switchboardOrganisationLayoutService.viewBoxHeight);
            svOrganisationContainerLevelColumn.attr('height', switchboardOrganisationLayoutService.viewBoxHeight);
            svOrganisationContainerLevelSeparatorColumn.attr('y2', switchboardOrganisationLayoutService.viewBoxHeight);

            svgOrganisationHeaderContainer.attr('viewBox', '0 0 ' + switchboardOrganisationLayoutService.viewBoxWidth + ' ' + switchboardOrganisationLayoutService.svgOrganisationHeaderViewBoxHeight);
        };

        //region Zoom
        d3.behavior.zoom().scaleExtent([switchboardOrganisationLayoutService.zoomMin, switchboardOrganisationLayoutService.zoomMax]);
        $scope.zoomDisplayedValue = switchboardOrganisationService.displayedZoom;

        /**
         * @description Apply the current zoom coefficient
         */
        $scope.applyZoom = function () {
            $scope.zoomDisplayedValue = switchboardOrganisationService.displayedZoom;
            switchboardOrganisationLayoutService.svgOrganisationContainerWidth = switchboardOrganisationLayoutService.zoomCoeff * switchboardOrganisationLayoutService.viewBoxWidth;
            switchboardOrganisationLayoutService.svgOrganisationContainerHeight = switchboardOrganisationLayoutService.zoomCoeff * switchboardOrganisationLayoutService.viewBoxHeight;
            svgOrganisationContainer.attr('width', switchboardOrganisationLayoutService.svgOrganisationContainerWidth);
            svgOrganisationContainer.attr('height', switchboardOrganisationLayoutService.svgOrganisationContainerHeight);

            svgOrganisationHeaderContainer.attr('width', switchboardOrganisationLayoutService.svgOrganisationContainerWidth);
        };

        $scope.zoom = function(){
            var maxWidth = parseInt(switchboardOrganisationContainer.style('width'), 10) - 41;
            switchboardOrganisationLayoutService.zoom(maxWidth, switchboardOrganisationLayoutService.zoomStep);
            $scope.applyZoom();
        };

        $scope.dezoom = function(){
            var maxWidth = parseInt(switchboardOrganisationContainer.style('width'), 10) - 41;
            switchboardOrganisationLayoutService.zoom(maxWidth, -switchboardOrganisationLayoutService.zoomStep);
            $scope.applyZoom();
        };
        //endregion

        //region Clear switchboard
        var clrSwitchboard = function() {
            switchboardOrganisationNetworkFlatArrayService.clearNetworkFlatArray();
            networkService.clearNetwork();
            svgOrganisationContainer.selectAll(switchboardOrganisationLayoutService.deviceContainerSelector).remove();
            switchboardOrganisationLayoutService.viewBoxHeight = switchboardOrganisationLayoutService.emptyOrganisationViewBoxHeight;
            $scope.setSvgContainerViewBoxSize();
            update();
        };

        $scope.clearSwitchboard = function () {
            if (network.incomerDevices.length > 0){
                dialogService.showYesNoDialog(gettextCatalog.getString('warning-clear-switchboard')).result.then(function (result) {
                    if (result) {
                        clrSwitchboard() ;
                    }
                });
            } else {
                clrSwitchboard() ;
            }
        };
        //endregion

        //region Add a device
        /**
         * @description scrolls to the device at line lineNumber, with an possible animation
         * @param lineNumber Line number of the item that should be focused
         * @param animateIn if true, animates the device for a visual feedback
         * @param delay delay before animating the device
         */
        var scrollToDevice = function(lineNumber, animateIn, delay) {
            if (lineNumber === null || lineNumber=== undefined) {
                return;
            }
            var element = switchboardOrganisationNetworkDecorationService.getDeviceAtLineSelector(lineNumber);
            try {
                //we use JQuery because of animate and scroll, which are easiest in JQuery than in Angular
                var jQuerySwitchboardOrganisationContainer = $(switchboardOrganisationLayoutService.switchboardOrganisationContainerSelector);
                jQuerySwitchboardOrganisationContainer.animate(
                    {
                        //scrollTop : lineNumber  * 125 * switchboardOrganisationLayoutService.zoomCoeff - ( jQuerySwitchboardOrganisationContainer.height()/2 )
                        scrollTop : lineNumber  * 125 * switchboardOrganisationLayoutService.zoomCoeff
                    }, 600);
            }
            catch (err) {
                console.log(err);
            }

            if (animateIn) {
                if (delay === undefined) {
                    delay = 150;
                }
                d3.select(element).selectAll('g:not(.count)')
                    .attr('transform', 'translate(-50,0)')
                    .attr('opacity', 0);
                $timeout(function () {
                    d3.select(element).selectAll('g:not(.count)')
                        .attr('transform', 'translate(-50,0)')
                        .attr('opacity', 0)
                        .transition()
                        .duration(100)
                        .ease('easeout')
                        .attr('transform', 'translate(0,0)')
                        .attr('opacity', 1);
                    d3.select(element).select('g.device-infos-area rect')
                        .attr('stroke', '#59ba00')
                        .transition()
                        .duration(2000)
                        .ease('easeout')
                        .attr('stroke', '#cbcbcb');
                }, delay);
            }
        };


    /**
     * @description rolling scroll to distributions with an error
     */
    var currentIndexToscrollToDeviceError = 0;

    $scope.scrollToDeviceError = function() {

        //get all distribution in error state
        var deviceArray = d3.selectAll(switchboardOrganisationLayoutService.deviceContainerSelector).data();
        var deviceErrorArray = _.filter(deviceArray, function(device){
            return (device.warnings.concat(device.product.warnings).length > 0);
        });

        //scroll to the appropriate distribution
        if (deviceErrorArray.length > 0){
            var deviceToScrollTo = deviceErrorArray[currentIndexToscrollToDeviceError];

            if (switchboardOrganisationNetworkDecorationService.getDeviceIndex(deviceToScrollTo) === -1){
                currentIndexToscrollToDeviceError = 0;
                deviceToScrollTo = deviceErrorArray[currentIndexToscrollToDeviceError];
            }

            scrollToDevice(switchboardOrganisationNetworkDecorationService.getDeviceIndex(deviceToScrollTo));
            currentIndexToscrollToDeviceError++;
        }
    };


    /**
     * @description highlights the device with animation
     * @param device device to be highlighted
     */
    var highlightDevice = function(lineNumber) {
        try {

            var element = switchboardOrganisationNetworkDecorationService.getDeviceAtLineSelector(lineNumber);
            var delay = 150;

            $timeout(function () {
                    d3.select(element).select('g.device-infos-area rect')
                        .attr('fill-opacity', 0.5)
                        .attr('fill', switchboardOrganisationLayoutService.droppableAreaColor)
                        .transition()
                        .duration(1000)
                        .ease('easeout')
                        .attr('fill-opacity', 1)
                        .attr('fill', 'white');
                }, delay);
        }
        catch (err) {
            console.log(err);
        }
    };

    /**
         * @description adds a new incomer device (device on the first level)
         *              updates the whole network afterwards
         */
        $scope.addIncomerDevice = function () {
            var addedDevices = [];
            var addedDevice = null;
            var i;

            deviceConfigurationService.configureDevice(configureRequestKey).result.then(function (productPackTab) {
                if (productPackTab.length >= 1) {
                    productPackTab.forEach(function (productPack) {
                        var productPackType = networkService.electricalDeviceType;

                        if (_.contains(productPack.rangeItem.metaRanges, 'metarange-selector-measure')) {
                            productPackType = networkService.measureDeviceType;
                        } else if (_.contains(productPack.rangeItem.metaRanges, 'metarange-selector-surge-arester')) {
                            productPackType = networkService.surgeArresterDeviceType;
                        }

                        //quantity : if user adds an ungrouped device, several distinct device are added
                        for (i = 0; i < productPack.deviceQuantity; i++) {
                            if (network.incomerDevices.length === 0) {
                                //first incomer device : start network
                                addedDevice = networkService.startNetwork(productPack, productPackType);
                                switchboardOrganisationUpdateService.showAddIncomerButton();
                            } else {
                                //nth incomer device : add a parallel device to first income device
                                addedDevice = networkService.addParallelDevice(network.incomerDevices[0], productPack, productPackType);
                            }
                            addedDevices.push(addedDevice);
                        }
                        delete productPack.deviceQuantity;
                    });
                }

                //add every added device
                for (i = 0; i < addedDevices.length; i++) {
                    switchboardOrganisationNetworkFlatArrayService.networkFlatArray.push(addedDevices[i]);
                    switchboardOrganisationNetworkFlatArrayService.deviceTypesJustAdded[addedDevices[i].type]++;
                }
                //update the whole network view
                update();

                if (addedDevices.length>0) {
                    scrollToDevice(switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(addedDevices[addedDevices.length-1]), true);
                }
            });
        };

        //endregion

        update();
    });
