/**
* This file uses the Page Object pattern for protractor tests for home page
*/

var HomePage = function() {
  this.pageUrl = '';

  this.marketingRegistrationLink = element(by.css('.home-marketing-registration-link'));
  //cgu has been removed
  //this.cguLink = element(by.css('.app-footer-link.pull-right'));
  this.openNewProjectButton = element(by.css('.home-create-new-project-area .home-actions-button'));

  this.marketingTitle = element(by.css('.home-marketing-title'));
  this.marketingSubtitle = element(by.css('.home-marketing-subtitle'));
  this.marketingInformation = element(by.css('.home-marketing-information-text'));
};


module.exports = new HomePage();