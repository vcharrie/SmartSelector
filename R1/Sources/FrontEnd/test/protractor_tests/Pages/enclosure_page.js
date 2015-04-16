/**
* This file uses the Page Object pattern for protractor tests for enclosure Page
*/

var EnclosurePage = function() {
    this.pageUrl = 'enclosure';

    this.searchingSolutionLabel = element(by.css('div.enc-content > div.enc-viewer.ng-scope div.loading-indicator'));
    this.enclosureDescription = element(by.css('.enc-panel .enc-side .scrollable'));
	this.enclosureSolutionTimeout = 30000;
};


module.exports = new EnclosurePage();