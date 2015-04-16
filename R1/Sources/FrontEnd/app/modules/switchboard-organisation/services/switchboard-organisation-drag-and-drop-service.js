'use strict';

angular.module('switchboardOrganisation').service('switchboardOrganisationDragAndDropService', function(_, networkService, switchboardOrganisationService, switchboardOrganisationNetworkFlatArrayService, switchboardOrganisationLayoutService, switchboardOrganisationNetworkDecorationService, d3, $timeout) {

    var service = {
    };

    var dropAreaTab = [];

    var highlightedDropArea = null;

    service.clearDropAreaTab = function () {
        dropAreaTab = [];
    };

    service.init = function () {
        service.clearDropAreaTab();
    };

    /**
     * @description DropArea constructor
     * @param x coordinate of the up-right corner of the drop area
     * @param y coordinate of the up-right corner of the drop area
     * @param row of the drop area
     * @param level of the drop area
     * @param new parent of the device that will be dropped
     * @param distribution which will be placed downstream the device that will be dropped
     * @param new child index of the device that will be dropped
     * @param droppableZone boolean : true if a device can be dropped in this area
     * @param height of the drop area
     * @param width of the drop area
     */
    var DropArea = function (x, y, row, level, parent, distributionDownstream, childIndex, droppableZone, height, width) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.level = level;
        this.parent = parent;
        this.distributionDownstream = distributionDownstream;
        this.childIndex = childIndex;
        this.droppableZone = droppableZone;
        this.height = height;
        this.width = width;
    };

    /**
     * @description get the row of the mouse pointer
     * @param yPosition second coordinate of the mouse pointer
     */
    var getPointerRow = function (yPosition) {
        if (yPosition < (switchboardOrganisationLayoutService.deviceContainerVerticalMargin + switchboardOrganisationLayoutService.deviceContainerHeight / 2)) {
            return 0;
        } else {
            return Math.floor(yPosition / (switchboardOrganisationLayoutService.deviceContainerVerticalMargin + switchboardOrganisationLayoutService.deviceContainerHeight));
        }
    };

    /**
     * @description get the dropping area that the mouse pointer is currently pointing
     * @param svgPointerCoordinates coordinates of the mouse pointer
     */
    service.getDroppingArea = function (svgPointerCoordinates) {
        var pointerLevel = Math.floor(svgPointerCoordinates[0] / switchboardOrganisationLayoutService.electricalDeviceContainerExcludingLeftColorBannerWidth);
        var pointerRow = getPointerRow(svgPointerCoordinates[1]);

        if (dropAreaTab[pointerRow] !== undefined) {
            var droppingArea = dropAreaTab[pointerRow][pointerLevel];
            return droppingArea;
        } else {
            return null;
        }
    };

    /**
     * @description fill the information for each drop area.
     *              For this, the algorithm iterates through all devices in the network, and fills the information for all the drop areas that are "around" the iterated device
     * @param draggingDevice device being dragged
     */
    var setDropAreaModelData = function (draggedDevice) {
        switchboardOrganisationNetworkFlatArrayService.networkFlatArray.forEach(function (device) {

            if (device.type !== networkService.distributionType) {
                var deviceRow = switchboardOrganisationNetworkFlatArrayService.networkFlatArray.indexOf(device);
                var deviceLevel = switchboardOrganisationNetworkDecorationService.convertToLevelNumber(switchboardOrganisationNetworkDecorationService.getDeviceLevelAttribute(device));

                //set top of device area data model
                var dropAreaTop = dropAreaTab[deviceRow][deviceLevel];
                dropAreaTop.parent = device.parent;
                dropAreaTop.distributionDownstream = null;
                dropAreaTop.childIndex = networkService.getChildIndex(device);
                dropAreaTop.droppableZone = true;

                //set down device area data model
                var dropAreaDown = dropAreaTab[deviceRow + 1][deviceLevel];
                dropAreaDown.parent = device.parent;
                if (device.children.length !== 0) {
                    dropAreaDown.distributionDownstream = device.children[0];
                    dropAreaDown.childIndex = networkService.getChildIndex(device) + 1;
                    if (draggedDevice.children.length !== 0) {
                        dropAreaDown.droppableZone = false;
                    } else if (draggedDevice.quantity > 1) { // current device has a distrib but dragged device has more than one element
                        dropAreaDown.droppableZone = false;
                    } else {
                        dropAreaDown.droppableZone = true;
                    }
                } else {
                    dropAreaDown.distributionDownstream = null;
                    dropAreaDown.childIndex = networkService.getChildIndex(device) + 1;
                    if (draggedDevice.children.length !== 0) {
                        if (deviceLevel === 0) {
                            dropAreaDown.droppableZone = false;
                        } else if (deviceLevel === 1) {
                            dropAreaDown.droppableZone = true;
                        } else {
                            dropAreaDown.droppableZone = false;
                        }
                    } else {
                        if (angular.equals(draggedDevice, device)) {
                            dropAreaDown.droppableZone = false;
                        } else {
                            dropAreaDown.droppableZone = true;
                        }
                    }
                }

                //set down right device area data model
                var dropAreaDownRight = dropAreaTab[deviceRow + 1][deviceLevel + 1];
                if (dropAreaDownRight !== undefined) {
                    if (device.children.length !== 0) {
                        dropAreaDownRight.parent = null;
                        dropAreaDownRight.distributionDownstream = null;
                        dropAreaDownRight.childIndex = null;
                        dropAreaDownRight.droppableZone = false;
                    } else {
                        dropAreaDownRight.parent = device;
                        dropAreaDownRight.distributionDownstream = null;
                        dropAreaDownRight.childIndex = 0;
                        if (switchboardOrganisationNetworkFlatArrayService.networkFlatArray.indexOf(draggedDevice) === switchboardOrganisationNetworkFlatArrayService.networkFlatArray.indexOf(device)){
                            dropAreaDownRight.droppableZone = false;
                        } else {
                            if (dropAreaDownRight.level === 1 && networkService.getMainDistributionUpstreamDevice() !== null) {
                                if (networkService.getMainDistributionUpstreamDevice().children[0].children.length === 1 && draggedDevice === networkService.getMainDistributionUpstreamDevice().children[0].children[0]) {
                                    dropAreaDownRight.droppableZone = true;
                                } else {
                                    dropAreaDownRight.droppableZone = false;
                                }
                            } else {
                                dropAreaDownRight.droppableZone = true;
                            }
                        }
                    }
                }

                var dropAreaDownLeft = dropAreaTab[deviceRow + 1][deviceLevel - 1];
                if (dropAreaDownLeft !== undefined) {
                    if (switchboardOrganisationNetworkDecorationService.isLastChildUnderDistribution(device) && device.children.length === 0) {
                        dropAreaDownLeft.parent = device.parent.parent.parent;
                        dropAreaDownLeft.distributionDownstream = null;
                        dropAreaDownLeft.childIndex = networkService.getChildIndex(device.parent.parent) + 1;
                        dropAreaDownLeft.droppableZone = true;
                    }
                }
                var dropAreaDownFullLeft = dropAreaTab[switchboardOrganisationNetworkFlatArrayService.networkFlatArray.length][0];
                if (dropAreaDownFullLeft !== undefined) {
                    if (deviceLevel === 2) {
                        dropAreaDownFullLeft.parent = null;
                        dropAreaDownFullLeft.childIndex = networkService.getChildIndex(device.parent.parent.parent.parent) + 1;
                    } else if (deviceLevel === 1) {
                        dropAreaDownFullLeft.parent = null;
                        dropAreaDownFullLeft.childIndex = networkService.getChildIndex(device.parent.parent) + 1;
                    }
                    dropAreaDownFullLeft.distributionDownstream = null;
                    dropAreaDownFullLeft.droppableZone = true;
                }

                if (draggedDevice.children && draggedDevice.children.length > 0) {
                    var draggedDeviceLevel = switchboardOrganisationNetworkDecorationService.convertToLevelNumber(switchboardOrganisationNetworkDecorationService.getDeviceLevelAttribute(draggedDevice));
                    if (dropAreaDown) {
                        dropAreaDown.droppableZone = (dropAreaDown.droppableZone &&
                        (deviceLevel === draggedDeviceLevel ||
                        ( 1 === draggedDeviceLevel && deviceLevel === 0 &&
                        switchboardOrganisationNetworkFlatArrayService.countDistributions(draggedDevice)===1 &&
                        switchboardOrganisationNetworkFlatArrayService.subTreeCanBeMovedToRoot(draggedDevice))));
                    }
                    if (dropAreaTop) {
                        dropAreaTop.droppableZone = (dropAreaTop.droppableZone &&
                        (deviceLevel === draggedDeviceLevel ||
                        ( 1 === draggedDeviceLevel && deviceLevel === 0 &&
                        switchboardOrganisationNetworkFlatArrayService.countDistributions(draggedDevice)===1 &&
                        switchboardOrganisationNetworkFlatArrayService.subTreeCanBeMovedToRoot(draggedDevice))));
                    }
                    if (dropAreaDownRight) {
                        dropAreaDownRight.droppableZone = (dropAreaDownRight.droppableZone &&
                        ((deviceLevel + 1) === draggedDeviceLevel) ||
                        (draggedDeviceLevel === 0 &&    // dragged device has the current main distribution
                        deviceLevel === 0 &&        // current device is a root device
                        draggedDevice!==device &&   // current device is not the dragged device
                        switchboardOrganisationNetworkFlatArrayService.countDistributions(draggedDevice) <= 1)); // dragged device has only one distribution, to be able to add a level
                    }
                    if (dropAreaDownLeft) {
                        dropAreaDownLeft.droppableZone = (dropAreaDownLeft.droppableZone &&
                        ((deviceLevel - 1) === draggedDeviceLevel));
                    }
                    if (dropAreaDownFullLeft) {
                        dropAreaDownFullLeft.droppableZone = (dropAreaDownFullLeft.droppableZone &&
                        (0 === draggedDeviceLevel || // root item
                        ( 1 === draggedDeviceLevel &&
                        switchboardOrganisationNetworkFlatArrayService.countDistributions(draggedDevice)===1 &&
                        switchboardOrganisationNetworkFlatArrayService.subTreeCanBeMovedToRoot(draggedDevice))));
                    }
                }
            }
        });
    };

    /**
     * @description computes all the drop areas of the network, and fill the information for each area
     * @param draggingDevice device being dragged
     */
    service.fillDropAreaDataTab = function (draggingDevice) {
        var rowLength = switchboardOrganisationNetworkFlatArrayService.networkFlatArray.length + 1;
        var columnLength = 3;
        var row, level, i, j, rowHeight;

        for (i = 0; i < rowLength; i++) {
            row = i;
            dropAreaTab[row] = [];
            for (j = 0; j < columnLength; j++) {
                var x, y;
                x = switchboardOrganisationLayoutService.electricalDeviceContainerExcludingLeftColorBannerWidth * j;
                level = j;

                if (i === 0) {
                    rowHeight = switchboardOrganisationLayoutService.deviceContainerVerticalMargin + switchboardOrganisationLayoutService.deviceContainerHeight / 2;
                    y = 0;
                } else if (i === 1) {
                    rowHeight = switchboardOrganisationLayoutService.deviceContainerVerticalMargin + switchboardOrganisationLayoutService.deviceContainerHeight;
                    y = switchboardOrganisationLayoutService.deviceContainerVerticalMargin + switchboardOrganisationLayoutService.deviceContainerHeight / 2;
                }
                else {
                    rowHeight = switchboardOrganisationLayoutService.deviceContainerVerticalMargin + switchboardOrganisationLayoutService.deviceContainerHeight;
                    y = (switchboardOrganisationLayoutService.deviceContainerHeight + switchboardOrganisationLayoutService.deviceContainerVerticalMargin) * (i - 1) + (switchboardOrganisationLayoutService.deviceContainerVerticalMargin + switchboardOrganisationLayoutService.deviceContainerHeight / 2);
                }
                dropAreaTab[row][level] = new DropArea(x, y, row, level, null, null, null, null, rowHeight, switchboardOrganisationLayoutService.electricalDeviceContainerExcludingLeftColorBannerWidth);
            }
        }

        setDropAreaModelData(draggingDevice);
    };

    /**
     * @description Clones the grid rect template
     * @returns {} grid rect template
     */
    var cloneRectGridTemplate = function () {
        return d3.select('[' + switchboardOrganisationLayoutService.dataRowHTMLAttribute + '=' + switchboardOrganisationLayoutService.switchboardOrganisationDragAndDropGridRowValue + ']').node().cloneNode(true);
    };

    /**
     * @description generates the grid of the network (SVG elements) which are associated to the drop areas
     * @param draggingDevice device being dragged
     */
    service.generateDragDropDebugGrid = function (svgOrganisationContainer) {
        var rowLength = switchboardOrganisationNetworkFlatArrayService.networkFlatArray.length + 1;
        var columnLength = 3;
        var row, level, i, j;

        for (i = 0; i < rowLength; i++) {
            for (j = 0; j < columnLength; j++) {
                row = i;
                level = j;

                svgOrganisationContainer.insert(cloneRectGridTemplate, ':first-child')
                    .attr(switchboardOrganisationLayoutService.dataRowHTMLAttribute, row)
                    .attr(switchboardOrganisationLayoutService.dataLevelHTMLAttribute, level);

                var droppableZoneRect = svgOrganisationContainer.selectAll('[' + switchboardOrganisationLayoutService.dataRowHTMLAttribute + '="' + row + '"][' +
                    switchboardOrganisationLayoutService.dataLevelHTMLAttribute + '="' + level + '"] rect');

                droppableZoneRect.attr('x', dropAreaTab[row][level].x + 10)
                    .attr('y', dropAreaTab[row][level].y)
                    .attr('width', dropAreaTab[row][level].width)
                    .attr('height', dropAreaTab[row][level].height);

                if (dropAreaTab[row][level].droppableZone) {
                  droppableZoneRect.attr('fill', switchboardOrganisationLayoutService.droppableAreaColor)
                    .attr('opacity', switchboardOrganisationLayoutService.unlightDeviceOpacity)
                    .attr('class', 'droppable-zone');
                }
            }
        }
    };

    /**
     * @description Removes drag and drop grid and flush dropAreaTab
     * @returns {} Nothing
     */
    service.removeDragDropGrid = function () {
        var rowLength = switchboardOrganisationNetworkFlatArrayService.networkFlatArray.length + 1;
        for (var i = 0; i < rowLength; i++) {
            d3.selectAll(switchboardOrganisationLayoutService.switchboardOrganisationDragAndDropGridSelector + '[' + switchboardOrganisationLayoutService.dataRowHTMLAttribute + '="' + i + '"]').remove();
        }
    };

    // ---- UI for sub tree drag and drop -----

    /**
     * @description hides an item for drag and drop of a sub tree animation
     * @param selector of the item to hide
     * @param x
     * @param y
     * @param delay duration of the animation
     */
    var hideItem = function (selector, x, y, delay) {
        d3.select(selector).attr('oldTransform', d3.select(selector).attr('transform'));
        d3.select(selector)
            .attr('transform', 'translate(' + d3.select(selector)[0][0].transform.baseVal.getItem(0).matrix.e + ',' + d3.select(selector)[0][0].transform.baseVal.getItem(0).matrix.f + ')')
            .attr('opacity', 1.0);
        d3.select(selector).transition()
            .attr('transform', 'translate(' + d3.select(selector)[0][0].transform.baseVal.getItem(0).matrix.e + ',' + d3.select(selector)[0][0].transform.baseVal.getItem(0).matrix.f + ')')
            .attr('opacity', 1.0)
            .duration(switchboardOrganisationLayoutService.hideItemMinDuration + delay)
            .ease('easein')
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .attr('opacity', 0.0)
            .each('start', function () {
                d3.select(selector).select(switchboardOrganisationLayoutService.draggableZoneSelector).style('display', 'none');
            });
        return 1;
    };

    /**
     * @description shows an item for drag and drop of a sub tree animation
     * @param selector of the item to hide
     * @param delay duration of the animation
     * @param cancel
     */
    var showItem = function (selector, delay, cancel) {
        if (cancel) {
            $timeout(function () {
                if (d3.select(selector).attr('oldTransform')) {
                    d3.select(selector).transition()
                        .attr('transform', 'translate(' + d3.select(selector)[0][0].transform.baseVal.getItem(0).matrix.e + ',' + d3.select(selector)[0][0].transform.baseVal.getItem(0).matrix.f + ')')
                        .attr('opacity', 0.0)
                        .duration(switchboardOrganisationLayoutService.showItemMinDurationOnCancel)
                        .ease('easein')
                        .attr('transform', d3.select(selector).attr('oldTransform'))
                        .attr('opacity', 1.0)
                        .each('start', function () {
                            d3.select(selector).select(switchboardOrganisationLayoutService.draggableZoneSelector).style('display', 'none');
                        })
                        .each('end', function () {
                            d3.select(selector).select(switchboardOrganisationLayoutService.draggableZoneSelector).style('display', 'block');
                            d3.select(selector).attr('oldTransform', null);
                        });
                }
            }, switchboardOrganisationLayoutService.showItemDelayOnCancel);
        } else {
            d3.select(selector).transition()
                .attr('opacity', 0.0)
                .duration(switchboardOrganisationLayoutService.showItemMinDuration)
                .ease('easein')
                .attr('opacity', 1.0)
                .each('end', function () {
                    d3.select(selector).select(switchboardOrganisationLayoutService.draggableZoneSelector).style('display', 'block');
                    d3.select(selector).attr('oldTransform', null);
                });
        }
    };

    /**
     * @description hides the polyline of a distribution for drag and drop of a sub tree animation
     * @param polyline coordinates
     */
    var hideDistributionPolyline = function (polyline) {
        var selector = $(switchboardOrganisationLayoutService.svgOrganisationContentContainerSelector + ' ' + switchboardOrganisationLayoutService.polylinesSelector + '[points="' + polyline + '"]').last()[0];
        d3.select(selector).attr('opacity', 0.0);
    };

    /**
     * @description shows the polyline of a distribution for drag and drop of a sub tree animation
     * @param polyline coordinates
     */
    var showDistributionPolyline = function (polyline) {
        var selector = $(switchboardOrganisationLayoutService.svgOrganisationContentContainerSelector + ' ' + switchboardOrganisationLayoutService.polylinesSelector + '[points="' + polyline + '"]').last()[0];
        d3.select(selector).attr('opacity', 1.0);
    };

    /**
     * @description hides a sub tree for drag and drop of a sub tree animation
     * @param parentDevice of the subtree
     * @param x
     * @param y
     */
    var hideSubTree = function (parentDevice, x, y) {
        var count = 0;
        for (var i=0; i<parentDevice.children.length; i++) {
            var child = parentDevice.children[i];
            var childRow = switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(child);
            var childSelector = switchboardOrganisationNetworkDecorationService.getDeviceAtLineSelector(childRow);
            var delay = i * switchboardOrganisationLayoutService.hideItemMaxDuration / parentDevice.children.length;
            hideItem(childSelector,x,y, delay);
            if (child.type===networkService.distributionType) {
                var polyline = switchboardOrganisationNetworkDecorationService.getWirePoints(child, null);
                hideDistributionPolyline(polyline);
            } else {
                count += child.quantity;
            }
            count += hideSubTree(child,x,y);
        }
        return count;
    };

    /**
     * @description shows a sub tree for drag and drop of a sub tree animation
     * @param parentDevice of the subtree
     * @param cancel
     */
    var showSubTree = function (parentDevice, cancel) {
        for (var i=0; i<parentDevice.children.length; i++) {
            var child = parentDevice.children[i];
            showSubTree(child, cancel);
            var childRow = switchboardOrganisationNetworkDecorationService.getDeviceRowAttribute(child);
            var childSelector = switchboardOrganisationNetworkDecorationService.getDeviceAtLineSelector(childRow);
            var delay = i * switchboardOrganisationLayoutService.showItemMaxDuration / parentDevice.children.length;
            showItem(childSelector, delay, cancel);
            if (child.type===networkService.distributionType) {
                var polyline = switchboardOrganisationNetworkDecorationService.getWirePoints(child, null);
                showDistributionPolyline(polyline);
            }
        }
    };

    /**
     * @description count SVG element X coordinate (coordinate where the count SVG element will be translated)
     */
    var getXcount = function () {
        return 0;
    };

    /**
     * @description count SVG element Y coordinate (coordinate where the count SVG element will be translated)
     */
    var getYcount = function () {
        return switchboardOrganisationLayoutService.deviceContainerHeight + 30;
    };

    /**
     * @description count element JQuery selector
     */
    var getCountSelector = function (device) {
        var childRow = switchboardOrganisationNetworkDecorationService.getDeviceIndex(device);
        return $(switchboardOrganisationLayoutService.getDeviceAtLinePrefixSelector + childRow + '] g.count').last()[0];
    };

    /**
     * @description count element text JQuery selector
     */
    var getCountTextSelector = function (device) {
        var childRow = switchboardOrganisationNetworkDecorationService.getDeviceIndex(device);
        return $(switchboardOrganisationLayoutService.getDeviceAtLinePrefixSelector + childRow + '] g.count > text').last()[0];
    };

    /**
     * @description hides the count of hidden devices
     * @param parentDevice of the subtree
     * @param cancel
     */
    var hideCount = function (device, cancel) {
        var selector = getCountSelector(device);
        if (cancel) {
            $timeout(function () {
                d3.select(selector).transition()
                    .attr('transform', 'translate(' + getXcount() + ',' + (getYcount()) + ')')
                    .attr('opacity', 1.0)
                    .duration(switchboardOrganisationLayoutService.hideCountDurationOnCancel)
                    .ease('easein')
                    .attr('transform', 'translate(' + getXcount() + ',' + (getYcount()+100) + ')')
                    .attr('opacity', 0.0)
                    .each('end', function () {
                        d3.select(selector).style('display', 'none');
                    });
            }, switchboardOrganisationLayoutService.hideCountDelayOnCancel);
        } else {
            d3.select(selector).attr('opacity', 0.0);
        }
    };

    /**
     * @description shows the count of hidden devices
     * @param parentDevice of the subtree
     * @param count count of the hidden devices
     */
    var showCount = function (device, count) {
        if (count<1) {
            return;
        }
        var selector = getCountSelector(device);
        var textSelector = getCountTextSelector(device);
        d3.select(textSelector).text(function () {
            return '+' + count;
        });
        d3.select(selector).attr('transform', 'translate(' + getXcount() + ',' + (getYcount()+100) + ')');
        d3.select(selector).transition()
            .attr('transform', 'translate(' + getXcount() + ',' + (getYcount()+100) + ')')
            .attr('opacity', 0.0)
            .duration(switchboardOrganisationLayoutService.showCountDuration)
            .ease('easeout')
            .attr('transform', 'translate(' + getXcount() + ',' + getYcount() + ')')
            .attr('opacity', 1.0)
            .each('start', function () {
                d3.select(selector).style('display', 'block');
            });
    };

    /**
     * @description hides a sub tree for drag and drop of a sub tree animation, and shows the count of hidden devices
     * @param parentDevice of the subtree
     * @param x
     * @param y
     */
    service.hideSubTreeAndCount = function (parentDevice, x, y) {
        var count = hideSubTree(parentDevice, x, y);
        showCount(parentDevice, count);
    };

    /**
     * @description shows a sub tree for drag and drop of a sub tree animation, and hides the count of hidden devices
     * @param parentDevice of the subtree
     * @param cancel
     */
    service.showSubTreeHideCount = function (parentDevice, cancel) {
        showSubTree(parentDevice, cancel);
        hideCount(parentDevice, cancel);
    };


    /**
     * @description set the color of the hovered drop zone depending on dragged device
     * @param parentDevice of the subtree
     */
    service.highlightDropArea = function (hoveredDropZone) {
        //'unlight' dropzone if needed
        if (this.getHighlightedDropArea() !== hoveredDropZone && this.getHighlightedDropArea() !== null){
            var dropAreaToUnlight = this.getHighlightedDropArea();
            $(switchboardOrganisationLayoutService.getDragZoneSelector(dropAreaToUnlight.row, dropAreaToUnlight.level))
                .attr('opacity',switchboardOrganisationLayoutService.unlightDeviceOpacity);
        }

        if (hoveredDropZone.droppableZone){
            this.setHighlightedDropArea(hoveredDropZone);
            $(switchboardOrganisationLayoutService.getDragZoneSelector(hoveredDropZone.row, hoveredDropZone.level))
              .attr('opacity',switchboardOrganisationLayoutService.highlightDeviceOpacity);
        }
    };

    /**
     * @description set the highlighted drop zone, used to improve drag behavior
     */
    service.setHighlightedDropArea = function (dropArea) {
        highlightedDropArea = dropArea;
    };

    /**
     * @description get the highlighted drop zone, used to improve drag behavior
     */
    service.getHighlightedDropArea = function () {
        return highlightedDropArea;
    };

    return service;

});
