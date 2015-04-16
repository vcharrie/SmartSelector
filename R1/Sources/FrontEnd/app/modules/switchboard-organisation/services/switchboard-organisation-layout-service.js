'use strict';

angular.module('switchboardOrganisation').service('switchboardOrganisationLayoutService', function(networkService, switchboardOrganisationService) {

    var service = {
    };

    //Layout pixels variables
    service.emptyOrganisationViewBoxWidth = 1070;
    service.emptyOrganisationViewBoxHeight = 550;

    service.svgOrganisationContainerWidth = 200;
    service.svgOrganisationContainerHeight = 200;
    service.svgOrganisationContainerTopPadding = 30;

    service.distributionDeviceContainerWidth = 690;
    service.electricalDeviceContainerWidth = 350;
    service.deviceContainerHeight = 85;
    service.deviceContainerVerticalMargin = 40;
    service.electricalDeviceContainerExcludingLeftColorBannerWidth = service.electricalDeviceContainerWidth - 10;

    service.distributionDescriptionLabelLeftShift = -70;

    //wires variables : arbitrary for good visual layout
    service.wireLeftMargin = 300;
    service.wireDownstreamLeftMargin = 60;
    service.wireTopMargin = 75;
    service.wireMagicNumber = 10;

    //Drag and drop variables
    // When starting drag sub tree
    service.hideItemMinDuration = 70;
    service.hideItemMaxDuration = 150;
    service.showCountDuration = 150;

    // When droping sub tree
    service.showItemMinDuration = 100;
    service.showItemMaxDuration = 100;

    // When droping sub tree on the same area
    service.hideCountDelayOnCancel = 300;
    service.hideCountDurationOnCancel = 150;
    service.showItemDelayOnCancel = 200;
    service.showItemMinDurationOnCancel = 70;

    //Layout HTML attributes
    service.dataLevelHTMLAttribute = 'data-level';
    service.deviceFirstLevel = 'network-first-level';
    service.deviceSecondLevel = 'network-second-level';
    service.deviceThirdLevel = 'network-third-level';
    service.dataRowHTMLAttribute = 'data-row';

    service.dataHideAddDownstreamDeviceButtonAttribute = 'data-hide-add-downstream-device-button';
    service.dataHideDeleteDeviceButtonAttribute = 'data-hide-delete-device-button';

    service.dataTypeHTMLAttribute = 'data-network-type';
    service.distributionTemplateType = 'distribution-template';
    service.electricalTemplateType = 'generic-template';
    service.measureTemplateType = 'generic-template';
    service.surgeArresterTemplateType = 'generic-template';
    service.distributionDeviceHTMLType = 'distribution-device';
    service.electricalDeviceHTMLType = 'electrical-device';
    service.measureDeviceHTMLType = 'measure-device';
    service.surgeArresterDeviceHTMLType = 'surge-arrester-device';

    service.dataFakeDistribution = 'data-fake-distribution';

    //opacity
    service.highlightDeviceOpacity = 1;
    service.unlightDeviceOpacity = 0.4;

    //colors
    service.droppableAreaColor = '#87d200';
    service.notDroppableAreaColor = 'white';
    // Official color request for 3rd type
    service.darkGreenColor = '#4fa600';
    // Idea from EQQ team for better visual difference
    service.oliveGreenColor = '#a2a600';
    service.limeGreenColor = '#009530';
    service.seedingGreenColor = '#87d200';
    service.deviceColors = {
        electrical : service.seedingGreenColor,
        measure : service.limeGreenColor,
        distribution: service.seedingGreenColor,
        surgeArrester : service.oliveGreenColor
    };

    //CSS Selectors
    service.switchboardOrganisationContainerSelector = '.switchboard-organisation';
    service.svgContainerSelector = '.svg-container';
    service.svgOrganisationHeaderContainerSelector = '.svg-organisation-header';
    service.svgOrganisationContentContainerSelector = '.svg-organisation-content';
    service.svOrganisationContainerLevelColumnSelector = '.switchboard-organisation-level-column';
    service.svOrganisationContainerLevelColumnSeparatorSelector = '.switchboard-organisation-level-column-separator';
    service.switchboardOrganisationDragAndDropGridSelector = '.gridRect';
    service.switchboardOrganisationDragAndDropGridRowValue = 'template';
    service.polylinesSelector = 'polyline';
    service.draggableZoneSelector = '.draggable-zone';

    service.electricalTemplateDeviceSelector = '[' + service.dataTypeHTMLAttribute + '=' + service.electricalTemplateType + ']';
    service.distributionTemplateDeviceSelector = '[' + service.dataTypeHTMLAttribute + '=' + service.distributionTemplateType + ']';
    service.measureTemplateDeviceSelector = '[' + service.dataTypeHTMLAttribute + '=' + service.measureTemplateType + ']';
    service.surgeArresterTemplateDeviceSelector = '[' + service.dataTypeHTMLAttribute + '=' + service.surgeArresterTemplateType + ']';
    service.electricalDeviceSelector = '[' + service.dataTypeHTMLAttribute + '=' + service.electricalDeviceHTMLType + ']';
    service.distributionDeviceSelector = '[' + service.dataTypeHTMLAttribute + '=' + service.distributionDeviceHTMLType + ']';
    service.measureDeviceSelector = '[' + service.dataTypeHTMLAttribute + '=' + service.measureDeviceHTMLType + ']';
    service.surgeArresterDeviceSelector = '[' + service.dataTypeHTMLAttribute + '=' + service.surgeArresterDeviceHTMLType + ']';
    service.fakeDistributionSelector = '[' + service.dataFakeDistribution + '=' + 'true]';
    service.trueDistributionSelector = '[' + service.dataFakeDistribution + '=' + 'false]';

    service.deviceAnyContainerSelector = '.device-container';
    service.distributionDeviceContainerSelector = service.distributionDeviceSelector + service.deviceAnyContainerSelector;
    service.electricalDeviceContainerSelector = service.electricalDeviceSelector + service.deviceAnyContainerSelector;
    service.measureDeviceContainerSelector = service.measureDeviceSelector + service.deviceAnyContainerSelector;
    service.surgeArresterDeviceContainerSelector = service.surgeArresterDeviceSelector + service.deviceAnyContainerSelector;
    service.deviceContainerSelector = service.electricalDeviceContainerSelector +
        ',' + service.distributionDeviceContainerSelector +
        ',' + service.surgeArresterDeviceContainerSelector +
        ',' + service.measureDeviceContainerSelector;

    service.distributionDeviceReferenceLabelSelector = service.distributionDeviceSelector + ' text.device-references-label';
    service.electricalDeviceReferenceLabelSelector = service.electricalDeviceSelector + ' text.device-references-label';
    service.measureDeviceReferenceLabelSelector = service.measureDeviceSelector + ' text.device-references-label';
    service.surgeArresterDeviceReferenceLabelSelector = service.surgeArresterDeviceSelector + ' text.device-references-label';
    service.deviceReferenceLabelSelector = 'text.device-references-label';


    service.distributionDeviceDescriptionLabelFirstLineSelector = service.distributionDeviceSelector + ' text.device-description-label.first-line';
    service.electricalDeviceDescriptionLabelFirstLineSelector = service.electricalDeviceSelector + ' text.device-description-label.first-line';
    service.measureDeviceDescriptionLabelFirstLineSelector = service.measureDeviceSelector + ' text.device-description-label.first-line';
    service.surgeArresterDeviceDescriptionLabelFirstLineSelector = service.surgeArresterDeviceSelector + ' text.device-description-label.first-line';
    service.distributionDeviceDescriptionLabelSecondLineSelector = service.distributionDeviceSelector + ' text.device-description-label.second-line';
    service.electricalDeviceDescriptionLabelSecondLineSelector = service.electricalDeviceSelector + ' text.device-description-label.second-line';
    service.measureDeviceDescriptionLabelSecondLineSelector = service.measureDeviceSelector + ' text.device-description-label.second-line';
    service.surgeArresterDeviceDescriptionLabelSecondLineSelector = service.surgeArresterDeviceSelector + ' text.device-description-label.second-line';

    service.distributionDeviceDescriptionLabelAreaSelector = service.distributionDeviceSelector + ' .device-description-label-area';

    service.electricalDeviceLeftColorBannerSelector = service.electricalDeviceSelector + ' .device-left-color-banner rect';
    service.measureDeviceLeftColorBannerSelector = service.measureDeviceSelector + ' .device-left-color-banner rect';
    service.surgeArresterDeviceLeftColorBannerSelector = service.surgeArresterDeviceSelector + ' .device-left-color-banner rect';

    service.electricalDeviceBottomBannerCountSelector = service.electricalDeviceSelector + ' .count rect';
    service.measureDeviceBottomBannerCountSelector = service.measureDeviceSelector + ' .count rect';
    service.surgeArresterDeviceBottomBannerCountSelector = service.surgeArresterDeviceSelector + ' .count rect';

    service.distributionDeviceBasicInformationFirstLineSelector = service.distributionDeviceSelector + ' .device-basic-information-label.first-line';
    service.electricalDeviceBasicInformationFirstLineSelector = service.electricalDeviceSelector + ' .device-basic-information-label.first-line';
    service.measureDeviceBasicInformationFirstLineSelector = service.measureDeviceSelector + ' .device-basic-information-label.first-line';
    service.surgeArresterBasicInformationFirstLineSelector = service.surgeArresterDeviceSelector + ' .device-basic-information-label.first-line';
    service.distributionDeviceBasicInformationSecondLineSelector = service.distributionDeviceSelector + ' .device-basic-information-label.second-line';
    service.electricalDeviceBasicInformationSecondLineSelector = service.electricalDeviceSelector + ' .device-basic-information-label.second-line';
    service.measureDeviceBasicInformationSecondLineSelector = service.measureDeviceSelector + ' .device-basic-information-label.second-line';
    service.surgeArresterBasicInformationSecondtLineSelector = service.surgeArresterDeviceSelector + ' .device-basic-information-label.second-line';

    service.distributionDevicePictureSelector = service.distributionDeviceSelector + ' image.device-picture';
    service.electricalDevicePictureSelector = service.electricalDeviceSelector + ' image.device-picture';
    service.measureDevicePictureSelector = service.measureDeviceSelector + ' image.device-picture';
    service.surgeArresterDevicePictureSelector = service.surgeArresterDeviceSelector + ' image.device-picture';

    service.distributionSidePanelSelector = service.distributionDeviceSelector + ' g.device-side-panel';
    service.distributionInfosAreaSelector = service.distributionDeviceSelector + ' g.device-infos-area rect.bg';
    service.distributionAreaSelector = service.distributionDeviceSelector + ' g.device-infos-area';
    service.distributionFakeModifySelector = service.distributionDeviceSelector + ' g' + service.fakeDistributionSelector;

    service.deviceWarningButtonSelector = ' g.device-intern-actions-panel text.device-warning-button' ;
    service.electricalDeviceWarningButtonSelector = service.electricalDeviceSelector + ' g.device-intern-actions-panel text.device-warning-button';
    service.distributionDeviceWarningButtonSelector = service.distributionDeviceContainerSelector + ' g.device-intern-actions-panel text.device-warning-button';
    service.surgeArresterDeviceWarningButtonSelector = service.surgeArresterDeviceContainerSelector + ' g.device-intern-actions-panel text.device-warning-button';
    service.measureDeviceWarningButtonSelector = service.measureDeviceContainerSelector + ' g.device-intern-actions-panel text.device-warning-button';

    //classes for the buttons 'modify device' : different behavior depending on the type
    service.distributionDeviceModifyButtonSelector = service.distributionDeviceSelector + ' g.device-intern-actions-panel text.device-modify-button';
    service.electricalDeviceModifyButtonSelector = service.electricalDeviceSelector + ' g.device-intern-actions-panel text.device-modify-button';
    service.measureDeviceModifyButtonSelector = service.measureDeviceSelector + ' g.device-intern-actions-panel text.device-modify-button';
    service.surgeArresterDeviceModifyButtonSelector = service.surgeArresterDeviceSelector + ' g.device-intern-actions-panel text.device-modify-button';

    //classes for the buttons 'delete device' : different behavior depending on the type
    service.distributionDeviceDeleteButtonLabelSelector = service.distributionDeviceSelector + ' g.delete-drop-down.device-delete-drop-down-related text.device-delete-label.device-delete-drop-down-related';
    service.electricalDeviceDeleteButtonLabelSelector = service.electricalDeviceSelector + ' g.delete-drop-down.device-delete-drop-down-related text.device-delete-label.device-delete-drop-down-related';
    service.measureDeviceDeleteButtonLabelSelector = service.measureDeviceSelector + ' g.delete-drop-down.device-delete-drop-down-related text.device-delete-label.device-delete-drop-down-related';
    service.surgeArresterDeviceDeleteButtonLabelSelector = service.surgeArresterDeviceSelector + ' g.delete-drop-down.device-delete-drop-down-related text.device-delete-label.device-delete-drop-down-related';

    //classes for the device number
    service.deviceQuantityContainerSelector = ' g.device-quantity';
    service.electricalDeviceQuantityLabelSelector = service.electricalDeviceSelector + service.deviceQuantityContainerSelector + ' text.quantity';
    service.measureDeviceQuantityLabelSelector = service.measureDeviceSelector + service.deviceQuantityContainerSelector + ' text.quantity';
    service.surgeArresterDeviceQuantityLabelSelector = service.surgeArresterDeviceSelector + service.deviceQuantityContainerSelector + ' text.quantity';

    //classes for the buttons 'ungroup devices'
    service.unGroupButtonSelector = 'g.device-intern-actions-panel text.device-ungroup-button';

    //classes for the buttons 'add a downstream device' : we sometimes need to hide these buttons
    service.deviceAddDownstreamDeviceButtonSelector = service.electricalDeviceSelector + ' g.device-add-children-icon' +
        ',' + service.distributionDeviceSelector + ' g.device-add-children-icon' +
        ',' + service.surgeArresterDeviceSelector + ' g.device-add-children-icon' +
        ',' + service.measureDeviceSelector + ' g.device-add-children-icon';

    service.deviceAddDownstreamDeviceButtonHiddenSelector = service.electricalDeviceSelector + ' g.device-add-children-icon' + '[' + service.dataHideAddDownstreamDeviceButtonAttribute + '=true]' +
        ',' + service.distributionDeviceSelector + ' g.device-add-children-icon' + '[' + service.dataHideAddDownstreamDeviceButtonAttribute + '=true]' +
        ',' + service.surgeArresterDeviceSelector + ' g.device-add-children-icon' + '[' + service.dataHideAddDownstreamDeviceButtonAttribute + '=true]' +
        ',' + service.measureDeviceSelector + ' g.device-add-children-icon' + '[' + service.dataHideAddDownstreamDeviceButtonAttribute + '=true]';

    service.deviceAddDownstreamDeviceButtonVisibleSelector = service.electricalDeviceSelector + ' g.device-add-children-icon' + '[' + service.dataHideAddDownstreamDeviceButtonAttribute + '=false]' +
        ',' + service.distributionDeviceSelector + ' g.device-add-children-icon' + '[' + service.dataHideAddDownstreamDeviceButtonAttribute + '=false]' +
        ',' + service.surgeArresterDeviceSelector + ' g.device-add-children-icon' + '[' + service.dataHideAddDownstreamDeviceButtonAttribute + '=false]' +
        ',' + service.measureDeviceSelector + ' g.device-add-children-icon' + '[' + service.dataHideAddDownstreamDeviceButtonAttribute + '=false]';

    //classes for the buttons 'delete device' : we sometimes need to hide these buttons
    service.distributionDeviceDeleteButtonSelector = service.distributionDeviceSelector + ' g.device-intern-actions-panel text.device-delete-button';

    service.dropDownSelector = 'g.delete-drop-down';
    service.deviceDeleteButtonSelector = service.electricalDeviceSelector + ' text.device-delete-button' +
        ',' + service.distributionDeviceSelector + ' text.device-delete-button' +
        ',' + service.surgeArresterDeviceSelector + ' text.device-delete-button' +
        ',' + service.measureDeviceSelector + ' text.device-delete-button';

    service.deviceDeleteDeviceButtonHiddenSelector = service.electricalDeviceSelector + ' text.device-delete-button' + '[' + service.dataHideDeleteDeviceButtonAttribute + '=true]' +
        ',' + service.distributionDeviceSelector + ' text.device-delete-button' + '[' + service.dataHideDeleteDeviceButtonAttribute + '=true]' +
        ',' + service.surgeArresterDeviceSelector + ' text.device-delete-button' + '[' + service.dataHideDeleteDeviceButtonAttribute + '=true]' +
        ',' + service.measureDeviceSelector + ' text.device-delete-button' + '[' + service.dataHideDeleteDeviceButtonAttribute + '=true]';

    service.deviceDeleteDeviceButtonVisibleSelector = service.electricalDeviceSelector + ' text.device-delete-button' + '[' + service.dataHideDeleteDeviceButtonAttribute + '=false]' +
        ',' + service.distributionDeviceSelector + ' text.device-delete-button' + '[' + service.dataHideDeleteDeviceButtonAttribute + '=false]' +
        ',' + service.surgeArresterDeviceSelector + ' text.device-delete-button' + '[' + service.dataHideDeleteDeviceButtonAttribute + '=false]' +
        ',' + service.measureDeviceSelector + ' text.device-delete-button' + '[' + service.dataHideDeleteDeviceButtonAttribute + '=false]';

    //duplicate icon selector
    service.deviceDuplicateButtonSelector = service.electricalDeviceSelector + ' g.device-intern-actions-panel text.device-duplicate-button' +
        ',' + service.measureDeviceSelector + ' g.device-intern-actions-panel text.device-duplicate-button' +
        ',' + service.surgeArresterDeviceSelector + ' g.device-intern-actions-panel text.device-duplicate-button';

    service.deviceExpandDetailsButtonSelector = service.electricalDeviceSelector + ' g.device-side-panel text.device-expand-infos-button' +
        ',' + service.distributionDeviceSelector + ' g.device-side-panel text.device-expand-infos-button' +
        ',' + service.measureDeviceSelector + ' g.device-side-panel text.device-expand-infos-button' +
        ',' + service.surgeArresterDeviceSelector + ' g.device-side-panel text.device-expand-infos-button';

    //drag area selector
    service.deviceDragAreaSelector = service.electricalDeviceSelector + ' g.device-drag' +
        ',' + service.distributionDeviceSelector + ' g.device-drag' +
        ',' + service.surgeArresterDeviceSelector + ' g.device-drag' +
        ',' + service.measureDeviceSelector + ' g.device-drag';

    //add incomer plus button in SVG container
    service.addIncomerSelector = 'g.bottomIncomerButton';
    service.addIncomerTextLabelSelector = 'text.add-incomer-label';

    service.getDeviceAtLinePrefixSelector = service.svgOrganisationContentContainerSelector + ' ' + 'g' + service.deviceAnyContainerSelector + '[' + service.dataRowHTMLAttribute + '=';

    service.getDragZoneSelector = function(row, level){
        return service.svgOrganisationContentContainerSelector + ' ' + 'g' + service.switchboardOrganisationDragAndDropGridSelector + '[' + service.dataRowHTMLAttribute + '=' + row + ']' + '[' + service.dataLevelHTMLAttribute + '=' + level + '] rect';
    };

    //ZOOM
    //when the user zooms :
    // -we modify zoom coeff.
    // -applyZoom : we modify the width and height of the svg container
    //
    //when the user adds an element (or more generally updates the network) :
    // -we update the viewbox size (using static sizes of the elements)
    // -we add the element (cycle update)
    // -applyZoom, using current zoom coeff.

    //zoomMin must be strictly superior to 0
    service.zoomMin = 0.1;
    service.zoomMax = 2;
    service.zoomStep = 0.1;

    service.zoomCoeff = switchboardOrganisationService.zoomCoefficient;

    service.viewBoxWidth = service.emptyOrganisationViewBoxWidth;
    service.viewBoxHeight = service.emptyOrganisationViewBoxHeight;

    service.svgOrganisationHeaderViewBoxHeight = 45;

    /**
     * @description Zooms one step
     */
    service.zoom = function (maxWidth, step) {
        service.zoomMax = maxWidth * 1.0 / service.viewBoxWidth;
        if ((service.zoomCoeff + step) < service.zoomMax && service.zoomCoeff + step > service.zoomMin) {
            service.zoomCoeff += step;
        } else if ((service.zoomCoeff + step) >= service.zoomMax) {
            service.zoomCoeff = service.zoomMax;
        } else {
            service.zoomCoeff = service.zoomMin;
        }
        switchboardOrganisationService.displayedZoom = parseInt(service.zoomCoeff * 100 / service.zoomMax);
        switchboardOrganisationService.zoomCoefficient = service.zoomCoeff;
    };

    return service;

});
