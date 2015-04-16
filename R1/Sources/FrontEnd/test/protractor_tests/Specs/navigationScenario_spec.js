describe('navigationScenario', function() {
    var bomPage = require('../Pages/bom_page.js');
    var enclosurePage = require('../Pages/enclosure_page.js');
    var homePage = require('../Pages/home_page.js');
    var projectContextPage = require('../Pages/projectContext_page.js');
    var quickQuotationPage = require('../Pages/quickQuotation_page.js');
    var switchboardOrganizationPage = require('../Pages/switchboardOrganization_page.js');

    beforeEach(function() {
        console.log('QQ_BROWSER_URL = ' + process.env.QQ_BROWSER_URL + ' ON = ' + browser.browserName);
        quickQuotationPage.navigate();
    });

    it('When a named project is created, the title should not change when the language changes.', function() {
        var ptor = protractor.getInstance();
        //create a new project
        homePage.openNewProjectButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);

        //validate with only the project name
        var title = 'International Title';
        quickQuotationPage.projectEditionProjectNameField.sendKeys(title);
        quickQuotationPage.modalDialogInfoButton.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);

        //change language to ru
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyNum(ptor, quickQuotationPage.languageSelectorValuesSelector, 1);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);
    });

    var addARootProduct = function (category) {
        switchboardOrganizationPage.addButton.click();
        browser.sleep(200);
        switchboardOrganizationPage.getCategory(category).click();
        browser.sleep(200);
        switchboardOrganizationPage.validAddProduct.click();
        browser.sleep(200);
    };

    it('Should navigate over the application. Simple navigation scenario.', function() {
        var ptor = protractor.getInstance();

        //open terms & conditions modal
        //cgu has been removed
        /*homePage.cguLink.click();
         expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);
         quickQuotationPage.modalDialogInfoButton.click();
         expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(false);*/



        //create a new project
        homePage.openNewProjectButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);

        //validate with only the project name
        var title = 'Coucou !';
        quickQuotationPage.projectEditionProjectNameField.sendKeys(title);
        quickQuotationPage.modalDialogInfoButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(false);
        expect(ptor.isElementPresent(quickQuotationPage.successToast)).toBe(true);
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(title);

        //modify project context
        projectContextPage.ratedCurrentDropdown.click();
        quickQuotationPage.selectDropdownbyNum(ptor, projectContextPage.ratedCurrentDropdownValuesSelector, 4);

        //go to switchboard content
        //as there is a success toast coming with an animation, we must wait an arbitrary time
        //(if we wait for the toaster to disappear, chrome is fooled by the animation and fails)
        expect(ptor.isElementPresent(quickQuotationPage.successToast)).toBe(true);
        browser.sleep(quickQuotationPage.usualToastTimeout);
        quickQuotationPage.organisationTab.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, switchboardOrganizationPage.pageUrl);

        //add a product
        addARootProduct(0);
        addARootProduct(1);
        addARootProduct(2);

        //go to enclosure
        quickQuotationPage.enclosureTab.click();
        browser.wait(function() {
            return ptor.isElementPresent(enclosurePage.searchingSolutionLabel);
        }, enclosurePage.enclosureSolutionTimeout);

        expect(ptor.isElementPresent(quickQuotationPage.errorToast)).toBe(false); // expect no error toast
        browser.sleep(quickQuotationPage.usualToastTimeout);
        expect(ptor.isElementPresent(enclosurePage.enclosureDescription)).toBe(true);

        //bom exploration
        quickQuotationPage.bomTab.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, bomPage.pageUrl);

        //back to landing page with a warning
        quickQuotationPage.homeLinkButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);
        quickQuotationPage.modalDialogDefaultButton.click();

    });



});