/**
* This file uses the Page Object pattern for protractor tests
*/

var QuickQuotationPage = function() {
  //home link (application title)
  this.homeLinkButton = element(by.css('.app-brand'));

  //tabs
  this.projectContextTab = element(by.css('.app-navigation .navigation-tabs ul li:nth-child(1) a'));
  this.organisationTab = element(by.css('.app-navigation .navigation-tabs ul li:nth-child(3) a'));
   // Uncomment if only 4 tabs
   // this.switchboardContentTab = element(by.css('.app-navigation .navigation-tabs ul li:nth-child(3) a'));
   // this.enclosureTab = element(by.css('.app-navigation .navigation-tabs ul li:nth-child(5) a'));
   // this.bomTab = element(by.css('.app-navigation .navigation-tabs ul li:nth-child(7) a'));
  //this.switchboardContentTab = element(by.css('.app-navigation .navigation-tabs ul li:nth-child(5) a'));
  this.enclosureTab = element(by.css('.app-navigation .navigation-tabs ul li:nth-child(5) a'));
  this.bomTab = element(by.css('.app-navigation .navigation-tabs ul li:nth-child(7) a'));

  //home header
  this.languageSelector = element(by.css('.dropdown-toggle .shell-header-language-dropdown'));
  this.languageSelectorValuesSelector = by.css('.bar-container .dropdown-menu li a');

  //home project buttons
  this.createButton = element(by.css('.home-create-new-project-area .home-actions-button span:first-child'));
  this.openButton = element(by.css('.home-load-project-area:last-child .home-actions-button span:first-child'));

  //wizard buttons
  this.wizardForwardButton = element(by.css('.btn-go-forward'));

  //modal dialog
  this.modalDialog = element(by.css('.modal-dialog'));
  this.modalDialogCloseButton = element(by.css('.modal-close-button'));
  this.modalDialogDefaultButton = element(by.css('.modal-footer .btn-default'));
  this.modalDialogInfoButton = element(by.css('.modal-footer .btn-info'));
  this.modalDialogPrimaryButton = element(by.css('.modal-footer .btn-primary'));

  //project edition
  this.projectEditionProjectNameField = element(protractor.By.model('project.projectName'));

  //shell
  this.shellProjectTitle = element(by.css('.shell-project-title'));

  //toasters
  this.errorToast = element(by.css('.toast-error'));
  this.successToast = element(by.css('.toast-success'));
  this.usualToastTimeout = 4000;
  this.longerToastTimeout = 8000;

  //constants
  this.ruLanguageName = 'Русский';
  this.ruDefaultProjectName = 'Проект';
  this.enLanguageName = 'English';
  this.enDefaultProjectName = 'Project';
  this.ruCurrency = 'руб';

  this.options = {
      'trim_options' : true,
      'console_display_current_test' : true
  };

  this.navigate = function() {
        var browser_url = (process.env.QQ_BROWSER_URL!==undefined?process.env.QQ_BROWSER_URL:'http://127.0.0.1:8080/');
        browser.get(browser_url);
        browser.driver.manage().window().setSize(1280, 1024);
  };

    this.selectDropdownbyNum = function (ptor, elementSelector, optionNum) {
        if (optionNum){
            var options = ptor.findElements(elementSelector).then(function(options){
                options[optionNum].click();
            });
        }
    };

    this.selectDropdownbyValue = function (ptor, elementSelector, textvalue) {
        var desiredOption;
        ptor.findElements(elementSelector)
            .then(function findMatchingOption(options) {
                //console.log("Found " + options.length + " elements");
                options.some(function (option) {
                    option.getInnerHtml().then(function doesOptionMatch(text) {
                        //console.log('Looking for ' + textvalue + ' into ' + text);
                        if (text.indexOf(textvalue) != -1) {
                            //console.log('Found ' + textvalue + ' into ' + text);
                            desiredOption = option;
                            return true;
                        }
                    });
                });
            })
            .then(function clickOption() {
                if (desiredOption) {
                    desiredOption.click();
                }
            });
    };

    this.expectCurrentUrlToMatch = function (ptor, url) {
        if (browser.browserName != 'INTERNET EXPLORER') {
            expect(ptor.getCurrentUrl()).toMatch(url);
        } else {
            expect(ptor.getLocationAbsUrl()).toContain(url);
        }
    }
	
	//Pre-condition : focus is set so that scroll is possible
	this.scrollIntoView = function(element) {
		var script = function () {
			arguments[0].scrollIntoView();
		}
		browser.executeScript(script, element);
	}

    this.expectCyrilic = function(text) {
        var pattern = new RegExp(".*[А-яЁё].*");
        expect(text).toMatch(pattern);
    }


	
};


module.exports = new QuickQuotationPage();