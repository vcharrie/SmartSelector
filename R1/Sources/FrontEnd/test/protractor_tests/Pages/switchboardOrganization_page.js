/**
* This file uses the Page Object pattern for protractor tests for switchboard content
*/

var SwitchboardOrganizationPage = function() {
    this.pageUrl = 'switchboard-organisation';

    this.column2oneitem = element(by.css('#svg-organisation > g[data-level="1"].gridRect > rect[fill="#87d200"]'));
    this.allDeviceContainers = by.css('#svg-organisation > g.device-container');
    this.draggableZone = by.css('text.draggable-zone');
    this.addChildButton = by.css('g.device-add-children-icon text');
    this.getElementAtLine = function(line) {
        return element(by.css('#svg-organisation > g[data-row="' + line + '"].device-container'));
    };

    this.getPromiseElementAtLine = function (ptor, line) {
        var deviceContainer;
        var deferred = protractor.promise.defer();
        //console.log('Get element at ' + this.allDeviceContainers);
        ptor.findElements(this.allDeviceContainers).then(function (containers) {
            containers.some(function (container) {
                container.getAttribute('data-row').then(function (foundLine) {
                    //console.log('cur line = ' + foundLine);
                    if (foundLine==line) {
                        deviceContainer = container;
                        return true;
                    } else {
                        //console.log(foundLine + '!=' + line);
                    }
                });
            });
        }).then(function () { deferred.fulfill(deviceContainer); } );
        return deferred.promise;
    };

    this.getDropableZoneAt = function(line, col) {
        return element(by.css('#svg-organisation .gridRect[data-row=' + line + '][data-level=' + col + ']'));
    };

    this.enabledDropZones = by.css('#svg-organisation > g.gridRect > rect[fill="#87d200"]');

    this.allLines = by.css('#svg-organisation > g');

    this.addButton  =  element(by.css('div.network-add-incomer-area > div > button.btn.btn-primary.switchboard-organisation-action-button.svg-button.ng-binding'));
    this.clearButton = element(by.css('div.network-add-incomer-area > div > button.btn.btn-default.switchboard-organisation-action-button.svg-button.ng-binding'));

    // modal
    this.getCategory = function(index) {
        return element(by.css('div.modal-body > div.device-configuration-ranges-selection-area > div:nth-child(' + (index+2) + ')'));
    };
    this.validAddProduct = element(by.css('.modal-footer button.btn.btn-primary.ng-binding'));

    this.allLabelButton = by.css('.device-configuration-ranges-selection-area .rangeItem .catalog-label');
    // constants
    this.circuitBreakerLabel = 'Circuit breaker';

    this.getLabelButton = function (ptor, label) {
        var ret;
        var deferred = protractor.promise.defer();
        ptor.findElements(this.allLabelButton)
            .then(function (buttons) {
                buttons.some(function (button) {
                    button.getInnerHtml().then(function doesSpanMatch(spancontent) {
                        if (spancontent.indexOf(label) !== -1 && spancontent.trim().length===label.trim().length) {
                            ret = button;
                            return true;
                        }
                    });
                });
            }).then(function () { deferred.fulfill(ret); } );
        return deferred.promise;
    };


    this.clickLabelButton = function (ptor, label) {
        this.getLabelButton(ptor, label).then(function clickOption(f) {
            if (f) {
                f.click();
            } else {
                console.log('NOT FOUND ' + label);
            }
        });
    };

    this.characteristicDropdown = element(by.css('.characts-list .caract-line:nth-child(2) .dropdown-toggle'));
    this.characteristicDropdowns = by.css('.characts-list .caract-line .dropdown-toggle .dropdown-btn-selected-value');
    this.characteristicDropdownsOpen = by.css('.characts-list .caract-line .open .dropdown-toggle .dropdown-btn-selected-value');
    this.openCharacteristicDropdownsItems = by.css('.characts-list .caract-line .open .dropdown-menu li a');

    this.quantity = element(by.css('.modal-footer .product-item-quantity'));
    this.quantityPlusButton = element(by.css('.modal-footer .fa-plus'));
    this.quantityMinusButton = element(by.css('.modal-footer .fa-minus'));

    this.deviceHeight = 125;

};


module.exports = new SwitchboardOrganizationPage();