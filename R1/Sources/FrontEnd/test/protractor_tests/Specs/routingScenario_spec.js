describe('routingScenario', function() {
  var bomPage = require('../Pages/bom_page.js');
  var enclosurePage = require('../Pages/enclosure_page.js');
  var homePage = require('../Pages/home_page.js');
  var projectContextPage = require('../Pages/projectContext_page.js');
  var quickQuotationPage = require('../Pages/quickQuotation_page.js');
  var switchboardContentPage = require('../Pages/switchboardContent_page.js');
  var switchboardOrganizationPage = require('../Pages/switchboardOrganization_page.js');

    // utils

    var expectCountElementsToBe = function (ptor, selector, size) {
        ptor.findElements(selector).then(function(elems) {
            var length = elems.length;
            expect(length).toBe(size);
        });
    };

    var expectCountElementsToBeGreaterThan = function (ptor, selector, size) {
        ptor.findElements(selector).then(function(elems) {
            var length = elems.length;
            expect(length).toBeGreaterThan(size);
        });
    };

    var expectNoEmptyElement = function (ptor, selector) {
        ptor.findElements(selector).then(function(elems) {
            elems.some(function (elem) {
                elem.getText().then(function (text) {
                    if (quickQuotationPage.options.trim_options) { text = text.trim(); }
                    // console.log('link length : ' + text);
                    expect(text.length).toBeGreaterThan(0);
                });
            });
        });
    };

  beforeEach(function() {
      console.log('QQ_BROWSER_URL = ' + process.env.QQ_BROWSER_URL + ' ON = ' + browser.browserName);
      quickQuotationPage.navigate();
  });

    // Home page

    /**
     * Create a project from scratch, with the given title.
     * The methods returns when the project is created and supposed to be redirected to projectContextPage.
     * It contains only one assertion : Except that current url is projectContextPage.pageUrl.
     * The method returns the ptor (protractor instance)
     * @param title The title to give to the project
     * @returns {Protractor|*}
     */
    var createAProject = function (title, context) {
        if (quickQuotationPage.options.console_display_current_test) {
            if (context) {
                console.log('[' + context + '] ' + title);
            } else {
                console.log(title);
            }
        }
        var ptor = protractor.getInstance();
        //set default english
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.enLanguageName);
        expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.enLanguageName);

        homePage.openNewProjectButton.click();
        quickQuotationPage.projectEditionProjectNameField.sendKeys(title);
        quickQuotationPage.modalDialogInfoButton.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
        return ptor;
    };

    it('Should start on welcome page', function() {
        if (quickQuotationPage.options.console_display_current_test) {
            console.log('[homePage] Should start on welcome page');
        }
        var ptor = protractor.getInstance();
        //HOME PAGE
        quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(false);
    });

    it('Should be redirected to home page by clicking on homelink', function() {
        if (quickQuotationPage.options.console_display_current_test) {
            console.log('[homePage] Should be redirected to home page by clicking on homelink');
        }
        var ptor = protractor.getInstance();
        //HOME PAGE
        quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(false);

        //Click on EcorealQQ => Should redirect to the same page
        quickQuotationPage.homeLinkButton.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);
    });

    it('Should be able to create a project from home page', function() {
        if (quickQuotationPage.options.console_display_current_test) {
            console.log('[homePage] Should be able to create a project from home page');
        }
        var ptor = protractor.getInstance();
        homePage.openNewProjectButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);
    });

    it('Should stay in home page if cancel project creation', function() {
        if (quickQuotationPage.options.console_display_current_test) {
            console.log('[homePage] Should stay in home page if cancel project creation');
        }
        var ptor = protractor.getInstance();
        //Create new quote => fill the form => cancel => should stay in the same page
        homePage.openNewProjectButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);

        var firsttitle = 'Project test to delete';
        quickQuotationPage.projectEditionProjectNameField.sendKeys(firsttitle);
        quickQuotationPage.modalDialogCloseButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(false);
        quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);
    });

    it('Displaying twice project creation popup should display twice empty form (remove old fields)', function() {
        if (quickQuotationPage.options.console_display_current_test) {
            console.log('[homePage] Displaying twice project creation popup should display twice empty form (remove old fields)');
        }
        var ptor = protractor.getInstance();
        //Create new quote => fill the form => cancel => should stay in the same page
        homePage.openNewProjectButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);

        var firsttitle = 'This title should be removed when reopening project creation window';
        quickQuotationPage.projectEditionProjectNameField.sendKeys(firsttitle);
        quickQuotationPage.modalDialogCloseButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(false);
        quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);

        homePage.openNewProjectButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);
        expect(quickQuotationPage.projectEditionProjectNameField.getText()).toNotBe(firsttitle);
    });

    // Project context page

    it('Should be redirected to the project after creating a new project', function() {
        var ptor = createAProject('After creating project, should be redirected', 'projectContextPage');
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
    });

    it('Should display project title on open project', function() {
        var title = 'Project title test';
        var ptor = createAProject(title, 'projectContextPage');
        expect(ptor.isElementPresent(quickQuotationPage.successToast)).toBe(true);
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
    });

    it('Should be able to click on each tab of a new project', function() {
        var title = 'Navigation should be enabled for all tabs';
        var ptor = createAProject(title, 'projectContextPage');
        var tabsToTest = [{'tab' : quickQuotationPage.projectContextTab, 'url' : projectContextPage.pageUrl},
                            {'tab' : quickQuotationPage.organisationTab, 'url' : switchboardOrganizationPage.pageUrl},
                            {'tab' : quickQuotationPage.enclosureTab, 'url' : enclosurePage.pageUrl},
                            {'tab' : quickQuotationPage.bomTab, 'url' : bomPage.pageUrl}];

        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
        // click on each tab and check url
        for (var i=0; i < tabsToTest.length; i++) {
            var currentSubTest = tabsToTest[i];
            currentSubTest.tab.click();
            quickQuotationPage.expectCurrentUrlToMatch(ptor,currentSubTest.url);
        }
    });

    it('Should be able use browser back and forward buttons to navigate', function() {
        var title = 'Back and forward test';
        var ptor = createAProject(title, 'projectContextPage');
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
        // back to home page
        browser.navigate().back();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);

        // forward to next page
        browser.navigate().forward();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);

        quickQuotationPage.homeLinkButton.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);

        // back to working page
        browser.navigate().back();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
    });

    it('Should have characteristics (at least 4)', function() {
        var title = 'Should have default characteristics on project context page (at least 4)';
        var ptor = createAProject(title, 'projectContextPage');
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
        expectCountElementsToBeGreaterThan(ptor, projectContextPage.characteristicsDropdowns, 3);
    });

    it('Should have default characteristics', function() {
        var title = 'Should have default characteristics on project context page';
        var ptor = createAProject(title, 'projectContextPage');
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
        // for each characteristic, check if default value contains a value
        ptor.findElements(projectContextPage.characteristicsDropdowns).then(function (filters){
            filters.some(function (filter) {
                filter.getInnerHtml().then(function (text){
                    expect(text.length).toBeGreaterThan(1);
                });
            });
        });
    });

    it('All characteristics should have at least one value', function() {
        var title = 'All characteristics should have at least one value';
        var ptor = createAProject(title, 'projectContextPage');
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
        // for each characteristic, check if default value contains a value
        ptor.findElements(projectContextPage.characteristicsDropdowns).then(function (filters){
            filters.some(function (filter) {
                expectCountElementsToBe(ptor,projectContextPage.characteristicsDropdownsOpen,0); // no dropdown is open
                filter.click();
                expectCountElementsToBe(ptor,projectContextPage.characteristicsDropdownsOpen,1); // a dropdown is now open
                expectCountElementsToBeGreaterThan(ptor,projectContextPage.openCharacteristicDropdownsItems,0); // expect more than one element
                filter.click();
                expectCountElementsToBe(ptor,projectContextPage.characteristicsDropdownsOpen,0); // no dropdown is open
            });
        });
    });

    it('All characteristics should have not empty values', function() {
        var title = 'All characteristics should have not empty values';
        var ptor = createAProject(title, 'projectContextPage');
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
        // for each characteristic, check if default value contains a value
        ptor.findElements(projectContextPage.characteristicsDropdowns).then(function (filters){
            filters.some(function (filter) {
                expectCountElementsToBe(ptor,projectContextPage.characteristicsDropdownsOpen,0); // no dropdown is open
                filter.click();
                expectCountElementsToBe(ptor,projectContextPage.characteristicsDropdownsOpen,1); // a dropdown is now open
                expectNoEmptyElement(ptor,projectContextPage.openCharacteristicDropdownsItems); // expect elements to not be empty
                filter.click();
                expectCountElementsToBe(ptor,projectContextPage.characteristicsDropdownsOpen,0); // no dropdown is open
            });
        });
    });

    it('Should be able to change characteristics', function() {
        var title = 'Should be able to change characteristics';
        var ptor = createAProject(title, 'projectContextPage');
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
        // take a characteristic, change it, and click on clear to compare values
        ptor.findElements(projectContextPage.characteristicsDropdowns).then(function (filters){
            var filter =  filters[0];
            filter.getInnerHtml().then(function (originalValue) {
                expectCountElementsToBe(ptor,projectContextPage.characteristicsDropdownsOpen,0); // no dropdown is open
                filter.click();
                expectCountElementsToBe(ptor,projectContextPage.characteristicsDropdownsOpen,1); // a dropdown is now open
                expectCountElementsToBeGreaterThan(ptor,projectContextPage.openCharacteristicDropdownsItems,1); // expect more than one element
                // click on second element
                quickQuotationPage.selectDropdownbyNum(ptor, projectContextPage.openCharacteristicDropdownsItems, 1);
                expectCountElementsToBe(ptor,projectContextPage.characteristicsDropdownsOpen,0); // no dropdown is open
                expect(filters[0].getText()).toNotBe(originalValue);
            });
        });
    });

    it('Should be able to clear characteristics changes', function() {
        var title = 'Should be able to clear characteristics changes';
        var ptor = createAProject(title, 'projectContextPage');
        ptor.findElements(projectContextPage.characteristicsDropdowns).then(function (filters){
            var filter =  filters[0];
            filter.getInnerHtml().then(function (originalValue) {
                filter.click();
                quickQuotationPage.selectDropdownbyNum(ptor, projectContextPage.openCharacteristicDropdownsItems, 1);
                expect(filter.getText()).toNotBe(originalValue);
                projectContextPage.clearButton.click();
                // need to request again because element is not anymore into the current DOM
                ptor.findElements(projectContextPage.characteristicsDropdowns).then(function (filterssec){
                    var filtersec =  filterssec[0];
                    filtersec.getInnerHtml().then(function (newValue) {
                        expect(newValue).toBe(originalValue);
                    });
                });
            });
        });
    });

    // switchboard content page

    /**
     * Create a project from scratch, with the given title, and set rated current.
     * The methods returns when the project is created and supposed to be redirected to SwitchboardContentPage.
     * It asserts that urls are good the expected ones, the title is set
     * The method returns the ptor (protractor instance)
     * @param title
     * @param ratedCurrentDropdownIndex
     * @returns {Protractor|*}
     */
    var createAProjectAndGoToSwitchboardContentPage = function (title, ratedCurrentDropdownIndex, context) {
        var ptor = createAProject(title, context);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);

        //modify project context
        projectContextPage.ratedCurrentDropdown.click();
        quickQuotationPage.selectDropdownbyNum(ptor, projectContextPage.ratedCurrentDropdownValuesSelector, ratedCurrentDropdownIndex);
        browser.sleep(quickQuotationPage.usualToastTimeout);

        // go to switchboard
        quickQuotationPage.organisationTab.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, switchboardOrganizationPage.pageUrl);
        return ptor;
    };

    it('Project should have more than 2 categories loaded', function () {
        var title = 'Project should have more than 2 categories loaded';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
        switchboardOrganizationPage.addButton.click();
        ptor.findElements(switchboardOrganizationPage.allLabelButton).then(function(elems) {
            var deferred = protractor.promise.defer();
            deferred.fulfill(elems.length);
            expect(deferred).toBeGreaterThan(2);
        });
    });

    it('Should display circuit breaker category (requires that language is english)', function () {
        var title = 'Should display circuit breaker category (requires that default language is english)';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.getLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel).then(function(elems) {
            var deferred = protractor.promise.defer();
            deferred.fulfill(elems.getInnerHtml());
            expect(deferred).toBe(switchboardOrganizationPage.circuitBreakerLabel);
        });
    });

    it('Should be able to click on circuit breaker', function() {
        var title = 'Should be able to click on circuit breaker';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
    });

    it('Should have filters (at least 4)', function() {
        var title = 'Should have filters (at least 4)';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        expectCountElementsToBeGreaterThan(ptor, switchboardContentPage.characteristicDropdowns, 3);
    });

    it('Should have default filters', function() {
        var title = 'Should have default filters';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        ptor.findElements(switchboardContentPage.characteristicDropdowns).then(function (filters){
            filters.some(function (filter) {
                filter.getInnerHtml().then(function (text){
                    expect(text.length).toBeGreaterThan(0);
                });
            });
        });
    });


    it('All filters should have at least one value', function() {
        var title = 'All filters should have at least one value';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
        // for each characteristic, check if default value contains a value
        ptor.findElements(switchboardContentPage.characteristicDropdowns).then(function (filters){
            filters.some(function (filter) {
                expectCountElementsToBe(ptor,switchboardContentPage.characteristicDropdownsOpen,0); // no dropdown is open
                filter.click();
                expectCountElementsToBe(ptor,switchboardContentPage.characteristicDropdownsOpen,1); // a dropdown is now open
                expectCountElementsToBeGreaterThan(ptor,switchboardContentPage.openCharacteristicDropdownsItems,0); // expect more than one element
                filter.click();
                expectCountElementsToBe(ptor,switchboardContentPage.characteristicDropdownsOpen,0); // no dropdown is open
            });
        });
    });

    it('All filters should have not empty values', function() {
        var title = 'All filters should have not empty values';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
                 switchboardOrganizationPage.addButton.click();         switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
        // for each characteristic, check if default value contains a value
        ptor.findElements(switchboardContentPage.characteristicDropdowns).then(function (filters){
            filters.some(function (filter) {
                expectCountElementsToBe(ptor,switchboardContentPage.characteristicDropdownsOpen,0); // no dropdown is open
                filter.click();
                expectCountElementsToBe(ptor,switchboardContentPage.characteristicDropdownsOpen,1); // a dropdown is now open
                expectNoEmptyElement(ptor,switchboardContentPage.openCharacteristicDropdownsItems); // expect elements to not be empty
                filter.click();
                expectCountElementsToBe(ptor,switchboardContentPage.characteristicDropdownsOpen,0); // no dropdown is open
            });
        });
    });

    it('Should be able to change filters', function() {
        var title = 'Should be able to change filters';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
        // take a characteristic, change it, and click on clear to compare values
        ptor.findElements(switchboardContentPage.characteristicDropdowns).then(function (filters){
            var filter =  filters[0];
            filter.getInnerHtml().then(function (originalValue) {
                expectCountElementsToBe(ptor,switchboardContentPage.characteristicDropdownsOpen,0); // no dropdown is open
                filter.click();
                expectCountElementsToBe(ptor,switchboardContentPage.characteristicDropdownsOpen,1); // a dropdown is now open
                expectCountElementsToBeGreaterThan(ptor,switchboardContentPage.openCharacteristicDropdownsItems,1); // expect more than one element
                // click on second element
                quickQuotationPage.selectDropdownbyNum(ptor, switchboardContentPage.openCharacteristicDropdownsItems, 1);
                expectCountElementsToBe(ptor,switchboardContentPage.characteristicDropdownsOpen,0); // no dropdown is open
                expect(filters[0].getText()).toNotBe(originalValue);
            });
        });
    });
/*
    it('Should be able to clear filters changes', function() {
        var title = 'Should be able to clear filters changes';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 0, 'switchboardContentPage');
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        ptor.findElements(switchboardContentPage.characteristicDropdowns).then(function (filters){
            var filter =  filters[0];
            filter.getInnerHtml().then(function (originalValue) {
                filter.click();
                quickQuotationPage.selectDropdownbyNum(ptor, switchboardContentPage.openCharacteristicDropdownsItems, 1);
                expect(filter.getText()).toNotBe(originalValue);
                switchboardContentPage.clearButton.click();
                // need to request again because element is not anymore into the current DOM
                ptor.findElements(switchboardContentPage.characteristicDropdowns).then(function (filterssec){
                    var filtersec =  filterssec[0];
                    filtersec.getInnerHtml().then(function (newValue) {
                        expect(newValue).toBe(originalValue);
                    });
                });
            });
        });
    });*/
/*
    it('Basket should be empty by default', function() {
        var title = 'Basket should be empty by default';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 0, 'switchboardContentPage');
        expect(switchboardContentPage.basketNotificationBadgeBottom.getText()).toBe('0');
    });*/
/*
    it('Should not be able to use wizzard if empty basket', function() {
        var title = 'Should not be able to use wizzard if empty basket';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 0, 'switchboardContentPage');
        expect(switchboardContentPage.basketNotificationBadgeBottom.getText()).toBe('0');
        expect(quickQuotationPage.wizardForwardButton.isEnabled()).toBe(false); // basket still empty
    });*/

    it('Default quantities should be 1', function() {
        var title = 'Default quantities should be 1';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 0, 'switchboardContentPage');
        // select a quantity having products
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        //check if quantity is 1 by default, and it can't be < 1
        expect(switchboardOrganizationPage.quantity.getAttribute('value')).toBe('1');
    });

    it('Should not be able have weird quantities', function() {
        var title = 'Should not be able have weird quantities';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 0, 'switchboardContentPage');
        // select a quantity having products
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        //check if quantity is 1 by default, and it can't be < 1
        expect(switchboardOrganizationPage.quantity.getAttribute('value')).toBe('1');
        switchboardOrganizationPage.quantityMinusButton.click();
        expect(switchboardOrganizationPage.quantity.getAttribute('value')).toBe('1');
        switchboardOrganizationPage.quantityPlusButton.click();
        expect(switchboardOrganizationPage.quantity.getAttribute('value')).toBe('2');
        switchboardOrganizationPage.quantityMinusButton.click();
        expect(switchboardOrganizationPage.quantity.getAttribute('value')).toBe('1');
        switchboardOrganizationPage.quantityMinusButton.click();
        expect(switchboardOrganizationPage.quantity.getAttribute('value')).toBe('1');
        quickQuotationPage.expectCurrentUrlToMatch(ptor, switchboardOrganizationPage.pageUrl);
    });

    it('Should be able to add a product to project', function() {
        var title = 'Should be able to add a product to project';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
        // go to bom, expect 0 product
        quickQuotationPage.bomTab.click();
        expectCountElementsToBe(ptor,bomPage.allCategoryProductTables,0);
        // go to switchboard
        quickQuotationPage.organisationTab.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, switchboardOrganizationPage.pageUrl);
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        switchboardOrganizationPage.validAddProduct.click();
        // go to bom, expect 1 product
        quickQuotationPage.bomTab.click();
        expectCountElementsToBe(ptor,bomPage.allCategoryProductTables,1);
    });

    it('Should merge double products in bom', function() {
        var title = 'Should merge double products in bom';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
        // go to bom, expect 0 product
        quickQuotationPage.bomTab.click();
        expectCountElementsToBe(ptor,bomPage.allCategoryProductTables,0);
        // go to switchboard
        quickQuotationPage.organisationTab.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, switchboardOrganizationPage.pageUrl);
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        switchboardOrganizationPage.validAddProduct.click();
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 1);
        // go to bom, expect 1 product
        quickQuotationPage.bomTab.click();
        expectCountElementsToBe(ptor,bomPage.allCategoryProductTables,1);
        expect(bomPage.firstItemQuantity.getText()).toBe('1');
        // go to switchboard
        quickQuotationPage.organisationTab.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, switchboardOrganizationPage.pageUrl);
        switchboardOrganizationPage.addButton.click();
        switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        switchboardOrganizationPage.validAddProduct.click();
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 2);
        // go to bom, expect 1 product
        quickQuotationPage.bomTab.click();
        expectCountElementsToBe(ptor,bomPage.allCategoryProductTables,1); // still 1 group
        expect(bomPage.firstItemQuantity.getText()).toBe('2'); // but with quantity of 2
    });
/*
    it('Should be able to use wizzard if not empty basket', function() {
        var title = 'Should be able to use wizzard if not empty basket';
        var ptor = createAProjectAndGoToSwitchboardContentPage(title, 4, 'switchboardContentPage');
                 switchboardOrganizationPage.addButton.click();         switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
        //add one item to basket to be able to continue
        switchboardContentPage.addButton.click();
        expect(quickQuotationPage.wizardForwardButton.isEnabled()).toBe(true); // basket should not be empty
        expect(switchboardContentPage.basketNotificationBadgeBottom.getText()).toBe('1');
        switchboardContentPage.switchboardContentSwitchButton.click();
        quickQuotationPage.wizardForwardButton.click();

        //enclosure page
        quickQuotationPage.expectCurrentUrlToMatch(ptor, enclosurePage.pageUrl);

    });*/

  it('Should navigate correctly via browser', function() {
    console.log('Should navigate correctly via browser');
	var ptor = protractor.getInstance();

    //HOME PAGE
      quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);
      expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(false);

      //Click on EcorealQQ => Should redirect to the same page
      quickQuotationPage.homeLinkButton.click();
      quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);

      //Change language => should stay in the same page
      //set default english
      quickQuotationPage.languageSelector.click();
      quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.enLanguageName);
      expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.enLanguageName);

      //Create new quote => fill the form => cancel => should stay in the same page
      homePage.openNewProjectButton.click();
      expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);
      var firsttitle = 'This project creation will be canceled';
      quickQuotationPage.projectEditionProjectNameField.sendKeys(firsttitle);
      quickQuotationPage.modalDialogCloseButton.click();
      expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(false);
      quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);

      //Create new quote => fill the form => OK => should redirect to 'project-context'
      homePage.openNewProjectButton.click();
      expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);
      expect(quickQuotationPage.projectEditionProjectNameField.getText()).toNotBe(firsttitle);
      var title = 'New project for navigation';
      quickQuotationPage.projectEditionProjectNameField.sendKeys(title);
      quickQuotationPage.modalDialogInfoButton.click();
      expect(ptor.isElementPresent(quickQuotationPage.successToast)).toBe(true);


    //PAGE 'project-context'
    quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);

    // back to home page
    browser.navigate().back();
    quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);

    // forward to next page
    browser.navigate().forward();
    quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);

    quickQuotationPage.homeLinkButton.click();
    quickQuotationPage.expectCurrentUrlToMatch(ptor, homePage.pageUrl);

    // back to working page
    browser.navigate().back();
    quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
    expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);

    //modify project context
    projectContextPage.ratedCurrentDropdown.click();
    quickQuotationPage.selectDropdownbyNum(ptor, projectContextPage.ratedCurrentDropdownValuesSelector, 4);
    browser.sleep(quickQuotationPage.usualToastTimeout);
    quickQuotationPage.organisationTab.click();
    quickQuotationPage.expectCurrentUrlToMatch(ptor, switchboardOrganizationPage.pageUrl);

    switchboardOrganizationPage.addButton.click();
    switchboardOrganizationPage.clickLabelButton(ptor, switchboardOrganizationPage.circuitBreakerLabel);
    //expect(switchboardContentPage.basketNotificationBadgeBottom.getText()).toBe('0');
    //check if quantity is 1 by default, and it can't be < 1
    expect(switchboardOrganizationPage.quantity.getAttribute('value')).toBe('1');
      switchboardOrganizationPage.quantityMinusButton.click();
    expect(switchboardOrganizationPage.quantity.getAttribute('value')).toBe('1');
      switchboardOrganizationPage.quantityPlusButton.click();
    expect(switchboardOrganizationPage.quantity.getAttribute('value')).toBe('2');
      switchboardOrganizationPage.quantityMinusButton.click();
    expect(switchboardOrganizationPage.quantity.getAttribute('value')).toBe('1');
    quickQuotationPage.expectCurrentUrlToMatch(ptor, switchboardOrganizationPage.pageUrl);

    //add one item to basket to be able to continue
    switchboardOrganizationPage.validAddProduct.click();
    expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 1);

  });

});