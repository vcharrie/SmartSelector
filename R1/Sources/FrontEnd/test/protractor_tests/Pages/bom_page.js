/**
* This file uses the Page Object pattern for protractor tests for bom page
*/

var BomPage = function() {
    this.pageUrl = 'bom';

    this.totalPrice = element(by.css('.bom-totalprice-area h3 span:last-child'));

    this.allCategoryProductTables = by.css('div.bom-products-lists-scrollable-area table tbody.ng-scope');
    this.firstItemQuantity = element(by.css('div.bom-products-lists-scrollable-area > div:nth-child(1) > table > tbody.ng-scope.bom-row-even > tr > td.alncenter.col-xs-1.ng-binding'));
};


module.exports = new BomPage();