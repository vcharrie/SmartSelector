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
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.enLanguageName);
        expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.enLanguageName);
        homePage.openNewProjectButton.click();
        quickQuotationPage.projectEditionProjectNameField.sendKeys(title);
        quickQuotationPage.modalDialogInfoButton.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
        return ptor;
    };

    /**
     * Create a project from scratch, with the given title, and set rated current.
     * The methods returns when the project is created and supposed to be redirected to SwitchboardContentPage.
     * It asserts that urls are good the expected ones, the title is set
     * The method returns the ptor (protractor instance)
     * @param title
     * @param ratedCurrentDropdownIndex
     * @returns {Protractor|*}
     */
    var createAProjectAndGoToSwitchboardOrganisation = function (title, ratedCurrentDropdownIndex, context) {
        var ptor = createAProject(title, context);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);

        //modify project context
        /*projectContextPage.ratedCurrentDropdown.click();
        quickQuotationPage.selectDropdownbyNum(ptor, projectContextPage.ratedCurrentDropdownValuesSelector, ratedCurrentDropdownIndex);
        browser.sleep(quickQuotationPage.usualToastTimeout);*/

        // go to switchboard Organisation to view project
        quickQuotationPage.organisationTab.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, switchboardOrganizationPage.pageUrl);
        return ptor;
    };

    var getToContainClassPromise = function (expected) {
        var self = this;
        var deferred = protractor.promise.defer();

        self.actual.getAttribute('class').then(function(classes) {
            var result = classes && classes.search(new RegExp(expected, 'i')) > 0;

            if (result) {
                deferred.fulfill(true);
            } else {
                deferred.reject(classes + ' did not contain class ' + expected);
            }
        });

        return deferred.promise;
    }

    var toStartWithPromise = function (expected) {
        var self = this;
        var deferred = protractor.promise.defer();
        var text = self.actual;
        //self.actual.then(function(text) {
            var result = (text.indexOf(expected) === 0);

            if (result) {
                deferred.fulfill(true);
            } else {
                deferred.reject(text + ' did not start with ' + expected);
            }
        //});

        return deferred.promise;
    }

    var toContainPromise = function (expected) {
        var self = this;
        var deferred = protractor.promise.defer();
        var text = self.actual;

        //self.actual.then(function(text) {
            var result = (text.indexOf(expected) >= 0);

            if (result) {
                deferred.fulfill(true);
            } else {
                deferred.reject(text + ' did not contain ' + expected);
            }
        //});

        return deferred.promise;
    }

    var toBeContainedInPromise = function (expected) {
        var self = this;
        var deferred = protractor.promise.defer();
        var text = self.actual;

        //self.actual.then(function(text) {
            var result = (expected.indexOf(text) >= 0);

            if (result) {
                deferred.fulfill(true);
            } else {
                deferred.reject(text + ' is not contained in ' + expected);
            }
        //});

        return deferred.promise;
    }

    beforeEach(function() {
        this.addMatchers({
            toContainClass: getToContainClassPromise,
            toStartWith: toStartWithPromise,
            toContain: toContainPromise,
            toBeContainedIn: toBeContainedInPromise
        });
        console.log('QQ_BROWSER_URL = ' + process.env.QQ_BROWSER_URL + ' ON = ' + browser.browserName);
        quickQuotationPage.navigate();
    });

    var expectElementToHaveAttribute = function(element, attName, attValue) {
        expect(element.getAttribute(attName)).toBe('' + attValue);
    };

    var expectElementToBeOnColumn = function(element, columnNumber) {
        var columnName = '';
        if (columnNumber===0) {
            columnName = 'network-first-level';
        } else if (columnNumber===1) {
            columnName = 'network-second-level';
        } else if (columnNumber===2) {
            columnName = 'network-third-level';
        }
        expectElementToHaveAttribute(element, 'data-level', columnName);
    };

    var expectElementToBeOnLine = function(element, lineNumber) {
        expectElementToHaveAttribute(element, 'data-row', lineNumber);
    };

    var expectElementsToBeTyped = function (element, type) {
        expectElementToHaveAttribute(element, 'data-network-type', type);
    };

    var dragFromTo = function(ptor, elementFrom, elementFrom) {
        ptor.actions().dragAndDrop(
            elementFrom,
            elementFrom
        ).perform();
    };

    var addARootProduct = function (category) {
        switchboardOrganizationPage.addButton.click();
        browser.sleep(200);
        switchboardOrganizationPage.getCategory(category).click();
        browser.sleep(200);
        switchboardOrganizationPage.validAddProduct.click();
        browser.sleep(200);
    };

    var addAChildProduct = function (parent, category) {
        var addChildButton = parent.element(switchboardOrganizationPage.addChildButton);
        expect(addChildButton.isDisplayed()).toBeTruthy();
        addChildButton.click();
        browser.sleep(200);
        switchboardOrganizationPage.getCategory(category).click();
        browser.sleep(200);
        switchboardOrganizationPage.validAddProduct.click();
        browser.sleep(200);
    };


    it('Drag and drop : when [A][B], moving from [B] over [A] should switch to [B][A]', function () {
        var title = 'Drag and drop : when [A][B], moving from [B] over [A] should switch to [B][A]';
        var ptor = createAProjectAndGoToSwitchboardOrganisation(title, 0, 'switchboardContentPage');
        // 1) create simple project thanks to switchboardContentPage
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 0);
        addARootProduct(0);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 1);
        addARootProduct(2);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 2);

        var elementAtLine1 = switchboardOrganizationPage.getElementAtLine(0);
        var elementAtLine2 = switchboardOrganizationPage.getElementAtLine(1);

        expectElementToBeOnColumn(elementAtLine1, 0);
        expectElementToBeOnColumn(elementAtLine2, 0);
        expectElementToBeOnLine(elementAtLine1, 0);
        expectElementToBeOnLine(elementAtLine2, 1);
        expectElementsToBeTyped(elementAtLine1, 'electrical-device');
        expectElementsToBeTyped(elementAtLine2, 'electrical-device');

        var elementAtLine1_dragZone = elementAtLine1.element(switchboardOrganizationPage.draggableZone);
        var elementAtLine2_dragZone = elementAtLine2.element(switchboardOrganizationPage.draggableZone);

        elementAtLine1.getText().then(function (previouslyAtLine1) {
            elementAtLine2.getText().then(function (previouslyAtLine2) {

                // element of line 2 can be moved?
                browser.actions().mouseDown(elementAtLine2_dragZone).mouseMove(elementAtLine1_dragZone).perform();
                browser.sleep(500);
                dropableZones = switchboardOrganizationPage.enabledDropZones;
                expectCountElementsToBeGreaterThan(ptor, dropableZones, 0);
                browser.actions().mouseUp().perform();
                browser.waitForAngular();
                browser.sleep(500);
                expectCountElementsToBe(ptor, dropableZones, 0);

                // switched?
                browser.sleep(500);
                expect(elementAtLine1.getText()).toBe(previouslyAtLine2);
                expect(elementAtLine1.getText()).toNotBe(previouslyAtLine1);
                expect(elementAtLine2.getText()).toBe(previouslyAtLine1);
                expect(elementAtLine2.getText()).toNotBe(previouslyAtLine2);

            });
        });



    });



    it('Drag and drop : when [A][B], moving from [B] to [ B] should create a distribution [A][dd][ B]', function () {
        var title = 'Drag and drop : when [A][B], moving [B] to [ B] should create a distribution [A][dd][ B]';
        var ptor = createAProjectAndGoToSwitchboardOrganisation(title, 0, 'switchboardContentPage');
        // 1) create simple project thanks to switchboardContentPage
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 0);
        addARootProduct(0);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 1);
        addARootProduct(2);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 2);

        var elementA = switchboardOrganizationPage.getElementAtLine(0);
        var elementB = switchboardOrganizationPage.getElementAtLine(1);

        expectElementToBeOnColumn(elementA, 0);
        expectElementToBeOnColumn(elementB, 0);
        expectElementToBeOnLine(elementA, 0);
        expectElementToBeOnLine(elementB, 1);
        expectElementsToBeTyped(elementA, 'electrical-device');
        expectElementsToBeTyped(elementB, 'electrical-device');

        var elementA_dragZone = elementA.element(switchboardOrganizationPage.draggableZone);
        var elementB_dragZone = elementB.element(switchboardOrganizationPage.draggableZone);


        // element B should move on the right of 300px
        browser.actions().mouseDown(elementB_dragZone).mouseMove({x:400,y:0}).perform();
        browser.sleep(500);
        var dropableZones = switchboardOrganizationPage.enabledDropZones;
        expectCountElementsToBeGreaterThan(ptor, dropableZones, 0);
        browser.actions().mouseMove(switchboardOrganizationPage.column2oneitem).mouseUp().perform();
        // note : for firefox, we have to use "mousemove" to an object, for drag and drop success.
        // not relative coordinates

        // moved?
        browser.sleep(500);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 3);
        expectElementsToBeTyped(elementB, 'distribution-device'); // checked that new distribution is created on line 2

        //if moved, the item B should have move to line 3
        elementB = switchboardOrganizationPage.getElementAtLine(2);
        expectElementToBeOnColumn(elementB, 1);
        expectElementToBeOnLine(elementB, 2);
        expectElementsToBeTyped(elementB, 'electrical-device');

    });


    it('Drag and drop : TC1 : exchange two devices level 1 (scenario a)', function () {
        var title = 'Drag and drop : TC1 : exchange two devices level 1 (scenario a)';
        var ptor = createAProjectAndGoToSwitchboardOrganisation(title, 0, 'switchboardContentPage');
        // 1) create simple project thanks to switchboardContentPage
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 0);
        addARootProduct(0);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 1);
        addARootProduct(2);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 2);

        var elementAtLine1 = switchboardOrganizationPage.getElementAtLine(0);
        var elementAtLine2 = switchboardOrganizationPage.getElementAtLine(1);

        expectElementToBeOnColumn(elementAtLine1, 0);
        expectElementToBeOnColumn(elementAtLine2, 0);
        expectElementToBeOnLine(elementAtLine1, 0);
        expectElementToBeOnLine(elementAtLine2, 1);
        expectElementsToBeTyped(elementAtLine1, 'electrical-device');
        expectElementsToBeTyped(elementAtLine2, 'electrical-device');

        var elementAtLine1_dragZone = elementAtLine1.element(switchboardOrganizationPage.draggableZone);
        var elementAtLine2_dragZone = elementAtLine2.element(switchboardOrganizationPage.draggableZone);

        elementAtLine1.getText().then(function (deviceA) {
            elementAtLine2.getText().then(function (deviceB) {

                // element of line 2 can be moved?
                browser.actions().mouseDown(elementAtLine2_dragZone).mouseMove(elementAtLine1_dragZone).perform();
                browser.sleep(500);
                dropableZones = switchboardOrganizationPage.enabledDropZones;
                expectCountElementsToBeGreaterThan(ptor, dropableZones, 0);
                browser.actions().mouseUp().perform();
                browser.waitForAngular();
                browser.sleep(500);
                expectCountElementsToBe(ptor, dropableZones, 0);

                // switched?
                browser.sleep(500);
                expect(elementAtLine1.getText()).toBe(deviceB);
                expect(elementAtLine1.getText()).toNotBe(deviceA);
                expect(elementAtLine2.getText()).toBe(deviceA);
                expect(elementAtLine2.getText()).toNotBe(deviceB);
            });
        });
    });


    it('Drag and drop : TC2 : exchange two devices level 1 (scenario b)', function () {
        var title = 'Drag and drop : TC2 : exchange two devices level 1 (scenario b)';
        var ptor = createAProjectAndGoToSwitchboardOrganisation(title, 0, 'switchboardContentPage');
        // 1) create simple project thanks to switchboardContentPage
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 0);
        addARootProduct(0);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 1);
        addARootProduct(2);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 2);

        var elementAtLine1 = switchboardOrganizationPage.getElementAtLine(0);
        var elementAtLine2 = switchboardOrganizationPage.getElementAtLine(1);

        expectElementToBeOnColumn(elementAtLine1, 0);
        expectElementToBeOnColumn(elementAtLine2, 0);
        expectElementToBeOnLine(elementAtLine1, 0);
        expectElementToBeOnLine(elementAtLine2, 1);
        expectElementsToBeTyped(elementAtLine1, 'electrical-device');
        expectElementsToBeTyped(elementAtLine2, 'electrical-device');

        var elementAtLine1_dragZone = elementAtLine1.element(switchboardOrganizationPage.draggableZone);
        var elementAtLine2_dragZone = elementAtLine2.element(switchboardOrganizationPage.draggableZone);

        elementAtLine1.getText().then(function (deviceB) {
            elementAtLine2.getText().then(function (deviceA) {

                browser.actions().mouseDown(elementAtLine1_dragZone).mouseMove({x:0,y: Math.floor(switchboardOrganizationPage.deviceHeight * 1.5) }).perform();
                browser.sleep(500);
                dropableZones = switchboardOrganizationPage.enabledDropZones;
                expectCountElementsToBeGreaterThan(ptor, dropableZones, 0);
                browser.actions().mouseUp().perform();
                browser.waitForAngular();
                browser.sleep(500);
                expectCountElementsToBe(ptor, dropableZones, 0);

                // switched?
                browser.sleep(500);
                expect(elementAtLine1.getText()).toBe(deviceA);
                expect(elementAtLine1.getText()).toNotBe(deviceB);
                expect(elementAtLine2.getText()).toBe(deviceB);
                expect(elementAtLine2.getText()).toNotBe(deviceA);
            });
        });
    });



    it('Drag and drop : TC3 : move 1 device from level 1 to level 2', function () {
        var title = 'Drag and drop : TC3 : move 1 device from level 1 to level 2';
        var ptor = createAProjectAndGoToSwitchboardOrganisation(title, 0, 'switchboardContentPage');
        // 1) create simple project thanks to switchboardContentPage
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 0);
        addARootProduct(0);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 1);
        addARootProduct(2);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 2);

        var elementAtLine1 = switchboardOrganizationPage.getElementAtLine(0);
        var elementAtLine2 = switchboardOrganizationPage.getElementAtLine(1);

        expectElementToBeOnColumn(elementAtLine1, 0);
        expectElementToBeOnColumn(elementAtLine2, 0);
        expectElementToBeOnLine(elementAtLine1, 0);
        expectElementToBeOnLine(elementAtLine2, 1);
        expectElementsToBeTyped(elementAtLine1, 'electrical-device');
        expectElementsToBeTyped(elementAtLine2, 'electrical-device');

        var elementAtLine1_dragZone = elementAtLine1.element(switchboardOrganizationPage.draggableZone);
        var elementAtLine2_dragZone = elementAtLine2.element(switchboardOrganizationPage.draggableZone);

        elementAtLine1.getText().then(function (deviceA) {
            elementAtLine2.getText().then(function (deviceB) {

                expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 2);
                browser.actions().mouseDown(elementAtLine2_dragZone).mouseMove({x:300,y: Math.floor(switchboardOrganizationPage.deviceHeight * -0.5) }).perform();
                browser.sleep(500);
                dropableZones = switchboardOrganizationPage.enabledDropZones;
                expectCountElementsToBeGreaterThan(ptor, dropableZones, 0);
                browser.actions().mouseUp().perform();
                browser.waitForAngular();
                browser.sleep(500);
                expectCountElementsToBe(ptor, dropableZones, 0);

                // switched?
                browser.sleep(500);
                expect(elementAtLine1.getText()).toBeContainedIn(deviceA);
                expect(elementAtLine1.getText()).toNotBe(deviceB);

                // created distrib?
                expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 3);
                var elementAtLine2 = switchboardOrganizationPage.getElementAtLine(1);
                expectElementsToBeTyped(elementAtLine2, 'distribution-device');
                expect(elementAtLine2.getText()).toNotBe(deviceA);
                expect(elementAtLine2.getText()).toNotBe(deviceB);
                expect(elementAtLine2.getText()).toContain('distribution');

                var elementAtLine3 = switchboardOrganizationPage.getElementAtLine(2);
                expectElementsToBeTyped(elementAtLine3, 'electrical-device');
                expect(elementAtLine3.getText()).toBeContainedIn(deviceB);
                expect(elementAtLine3.getText()).toNotBe(deviceA);
            });
        });
    });


    it('Drag and drop : TC4 : move one device from level 2 to level 1', function () {
        var title = 'Drag and drop : TC4 : move one device from level 2 to level 1';
        var ptor = createAProjectAndGoToSwitchboardOrganisation(title, 0, 'switchboardContentPage');
        // 1) create simple project thanks to switchboardContentPage
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 0);
        addARootProduct(0);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 1);

        var elementAtLine1 = switchboardOrganizationPage.getElementAtLine(0);

        addAChildProduct(elementAtLine1, 1);
        expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 3);

        var elementAtLine3 = switchboardOrganizationPage.getElementAtLine(2);

        expectElementToBeOnColumn(elementAtLine1, 0);
        expectElementToBeOnColumn(elementAtLine3, 1);
        expectElementToBeOnLine(elementAtLine1, 0);
        expectElementToBeOnLine(elementAtLine3, 2);
        expectElementsToBeTyped(elementAtLine1, 'electrical-device');
        expectElementsToBeTyped(elementAtLine3, 'electrical-device');

        var elementAtLine1_dragZone = elementAtLine1.element(switchboardOrganizationPage.draggableZone);
        var elementAtLine3_dragZone = elementAtLine3.element(switchboardOrganizationPage.draggableZone);

        elementAtLine1.getText().then(function (deviceA) {
            elementAtLine3.getText().then(function (deviceB) {

                expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 3);
                browser.actions().mouseDown(elementAtLine3_dragZone).mouseMove({x:-300,y: Math.floor(switchboardOrganizationPage.deviceHeight * -1.5) }).perform();
                browser.sleep(500);
                dropableZones = switchboardOrganizationPage.enabledDropZones;
                expectCountElementsToBeGreaterThan(ptor, dropableZones, 0);
                browser.actions().mouseUp().perform();
                browser.waitForAngular();
                browser.sleep(500);
                expectCountElementsToBe(ptor, dropableZones, 0);
                expectCountElementsToBe(ptor, switchboardOrganizationPage.allLines, 2);

                // not switched?
                browser.sleep(500);
                expect(elementAtLine1.getText()).toContain(deviceA);
                expect(elementAtLine1.getText()).toNotBe(deviceB);
            });
        });
    });

});