describe('translation_RU', function() {
    var bomPage = require('../Pages/bom_page.js');
    var enclosurePage = require('../Pages/enclosure_page.js');
    var homePage = require('../Pages/home_page.js');
    var projectContextPage = require('../Pages/projectContext_page.js');
    var quickQuotationPage = require('../Pages/quickQuotation_page.js');
    var switchboardContentPage = require('../Pages/switchboardContent_page.js');

    beforeEach(function() {
        console.log('QQ_BROWSER_URL = ' + process.env.QQ_BROWSER_URL + ' ON = ' + browser.browserName);
        quickQuotationPage.navigate();
    });

    /*it('Assert English is default language', function() {
        var ptor = protractor.getInstance();
        //expect default language to be set to english
        expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.enLanguageName);
    });*/

    it('Assert English is allowed language in language selector', function() {
        var ptor = protractor.getInstance();
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.enLanguageName);
        expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.enLanguageName);
    });

    it('Assert russian available', function() {
        var ptor = protractor.getInstance();
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.ruLanguageName);
        expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.ruLanguageName);
    });

    it('Checking welcome screen texts and languages', function() {
        var ptor = protractor.getInstance();

        //expect default language to be set to english
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.enLanguageName);
        expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.enLanguageName);

        //check translation
        var en_create_button_title = quickQuotationPage.createButton.getText();
        var en_open_button_title = quickQuotationPage.openButton.getText();
        var en_title = homePage.marketingTitle.getText();
        var en_subtitle = homePage.marketingSubtitle.getText();
        var en_information = homePage.marketingInformation.getText();

        //expect action buttons text to be translated, not keywords
        expect(en_create_button_title).toNotBe('home-create-new-project-button-label');
        expect(en_open_button_title).toNotBe('home-load-project-button-label');

        //change language to ru
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.ruLanguageName);
        browser.sleep(1000);
        expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.ruLanguageName);
        var ru_create_button_title = quickQuotationPage.createButton.getText();
        var ru_open_button_title = quickQuotationPage.openButton.getText();
        var ru_title = homePage.marketingTitle.getText();
        var ru_subtitle = homePage.marketingSubtitle.getText();
        var ru_information = homePage.marketingInformation.getText();
        quickQuotationPage.expectCyrilic(ru_create_button_title);
        quickQuotationPage.expectCyrilic(ru_open_button_title);
        //quickQuotationPage.expectCyrilic(ru_title);
        quickQuotationPage.expectCyrilic(ru_subtitle);
        quickQuotationPage.expectCyrilic(ru_information);
        expect(en_create_button_title).toNotBe(ru_create_button_title);
        expect(en_open_button_title).toNotBe(ru_open_button_title);
        expect(en_title).toBe(ru_title); // app title doesn't change
        expect(en_subtitle).toNotBe(ru_subtitle);
        expect(en_information).toNotBe(ru_information);

        //expect footer to be set
    });

    it('When an unnamed project is created, it should have "Project" as english title, but "Проект" as Russian title.', function() {
        var ptor = protractor.getInstance();
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.enLanguageName);
        expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.enLanguageName);
        //create a new project
        homePage.openNewProjectButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);

        //validate with only the project name
        var title = '';
        quickQuotationPage.modalDialogInfoButton.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
        expect(quickQuotationPage.shellProjectTitle.getText()).toNotBe(title);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(quickQuotationPage.enDefaultProjectName);

        //change language to ru
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyNum(ptor, quickQuotationPage.languageSelectorValuesSelector, 1);
        quickQuotationPage.expectCyrilic(quickQuotationPage.shellProjectTitle.getText());
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(quickQuotationPage.ruDefaultProjectName);
    });

    it('Expect RU money to be руб.', function() {
        var ptor = protractor.getInstance();
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.enLanguageName);
        expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.enLanguageName);
        //create a new project
        homePage.openNewProjectButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);

        //validate with only the project name
        var title = '';
        quickQuotationPage.modalDialogInfoButton.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);

        // go to BOM tab
        quickQuotationPage.bomTab.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, bomPage.pageUrl);

        // check prices
        expect(bomPage.totalPrice.getText()).toMatch('.* ' + quickQuotationPage.ruCurrency);
    });

});