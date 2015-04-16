/**
* This file uses the Page Object pattern for protractor tests for switchboard content
*/

var SwitchboardContentPage = function() {
    this.pageUrl = 'switchboard-content';

    //this.catalogPictureButton = element(by.css('.catalog-panel .rangeItem:nth-child(2) .catalog-picture'));
    this.allLabelButton = by.css('.catalog-panel .rangeItem .catalog-label');
    this.addButton = element(by.css('.product-item-add-button:not(.ng-hide)'));
    
    this.characteristicDropdown = element(by.css('.characts-list .caract-line:nth-child(2) .dropdown-toggle'));
    this.characteristicDropdowns = by.css('.characts-list .caract-line .dropdown-toggle .dropdown-btn-selected-value');
    this.characteristicDropdownsOpen = by.css('.characts-list .caract-line .open .dropdown-toggle .dropdown-btn-selected-value');
    this.openCharacteristicDropdownsItems = by.css('.characts-list .caract-line .open .dropdown-menu li a');
    this.characteristicDropdownValuesSelector = by.css('.characts-list .caract-line:nth-child(2) .product-configuration-dropdown-menu li a');

    this.clearButton = element(by.css('.caract-banner .btn-default'));

    this.quantity = element(by.css('.product-item-quantity'));
    this.quantityPlusButton = element(by.css('.fa-plus'));
    this.quantityMinusButton = element(by.css('.fa-minus'));

    this.basketNotificationBadgeBottom = element(by.css('.link-basket-button .badge-bottom .notification-badge'));
	
	this.switchboardContentSwitchButton = element(by.css('.link-basket-button'));
    this.switchboardContentConfigurationButton = element(by.css('.link-configuration-button'));
	this.basketPanel = element(by.css('.selected-products-view'));
	this.basketLastElement = element(by.css('.selected-products .list-group-item:last-child'));
	this.basketFirstElement = element(by.css('.selected-products .list-group-item:first-child'));
	this.basketFirstElementRemoveButton = element(by.css('.selected-products .list-group-item:first-child .fa-trash-o'));
	this.basketLastElementApplyModificationButton = element(by.css('.selected-products .list-group-item:last-child .btn-primary'));
	this.catalogPanel = element(by.css('.catalog-panel'));
	this.configurePanel = element(by.css('.configure-panel'));

    // constants
    var circuitBreakerLabel = 'Circuit breaker';

    this.getCircuitBreakerLabelButton = function (ptor) {
        var circuitbreaker;
        var deferred = protractor.promise.defer();
        ptor.findElements(this.allLabelButton)
            .then(function (buttons) {
                buttons.some(function (button) {
                    button.getInnerHtml().then(function doesSpanMatch(spancontent) {
                        if (spancontent.indexOf(circuitBreakerLabel) != -1) {
                            circuitbreaker = button;
                            return true;
                        }
                    });
                });
            }).then(function () { deferred.fulfill(circuitbreaker); } );
        return deferred.promise;
    };


    this.clickCircuitBreakerLabelButton = function (ptor) {
        this.getCircuitBreakerLabelButton(ptor).then(function clickOption(circuitbreaker) {
            if (circuitbreaker) {
                circuitbreaker.click();
            } else {
                console.log('NOT FOUND circuitbreaker');
            }
        })
    }
};


module.exports = new SwitchboardContentPage();