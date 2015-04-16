describe('translation_EN', function() {
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

    it('Assert English is allowed language in language selector', function() {
        var ptor = protractor.getInstance();
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.enLanguageName);
        expect(quickQuotationPage.languageSelector.getText()).toBe(quickQuotationPage.enLanguageName);
    });

    it('Checking welcome screen texts loaded', function() {
        var ptor = protractor.getInstance();

        //check translation
        var en_create_button_title = quickQuotationPage.createButton.getText();
        var en_open_button_title = quickQuotationPage.openButton.getText();
        var en_title = homePage.marketingTitle.getText();
        var en_subtitle = homePage.marketingSubtitle.getText();
        var en_information = homePage.marketingInformation.getText();

        //expect action buttons text to be translated, not keywords
        expect(en_create_button_title).toNotBe('home-create-new-project-button-label');
        expect(en_open_button_title).toNotBe('home-load-project-button-label');
    });

    it('When an unnamed project is created, it should have "Project" as english title', function() {
        var ptor = protractor.getInstance();
        quickQuotationPage.languageSelector.click();
        quickQuotationPage.selectDropdownbyValue(ptor, quickQuotationPage.languageSelectorValuesSelector, quickQuotationPage.enLanguageName);
        //create a new project
        homePage.openNewProjectButton.click();
        expect(ptor.isElementPresent(quickQuotationPage.modalDialog)).toBe(true);

        //validate with only the project name
        var title = '';
        quickQuotationPage.modalDialogInfoButton.click();
        quickQuotationPage.expectCurrentUrlToMatch(ptor, projectContextPage.pageUrl);
        expect(quickQuotationPage.shellProjectTitle.getText()).toNotBe(title);
        expect(quickQuotationPage.shellProjectTitle.getText()).toBe(quickQuotationPage.enDefaultProjectName);
    });

});