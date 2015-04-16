describe('helloWorld', function() {
  beforeEach(function() {
    var browser_url = (process.env.QQ_BROWSER_URL!==undefined?process.env.QQ_BROWSER_URL:'http://127.0.0.1:8080/');
    console.log('QQ_BROWSER_URL = ' + process.env.QQ_BROWSER_URL + ' ON = ' + browser.browserName);
	browser.get(browser_url);
  });
	
  it('should load the page', function() {
	var ptor = protractor.getInstance();
	var title = element(by.css('.app-title'));
	expect(ptor.isElementPresent(title)).toBe(true);
  });
});