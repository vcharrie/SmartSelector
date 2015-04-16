// An example configuration file.
exports.config = {
    seleniumServerJar: './selenium/selenium-server-standalone-2.44.0.jar',
    seleniumArgs: ['-browserTimeout=60', '-Dwebdriver.ie.driver=test/webdriver/IEDriverServer.exe'],
    allScriptsTimeout: 999999,

    internetExplorerDriver: 'test/webdriver/IEDriverServer.exe',


    // Do not start a Selenium Standalone sever - only run this using chrome.
  chromeOnly: false,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'internet explorer'
  },
  onPrepare: function() {
    // The require statement must be down here, since jasmine-reporters
    // needs jasmine to be in the global and protractor does not guarantee
    // this until inside the onPrepare function.
    var jasmineRep= require('jasmine-reporters');
	var capsPromise = browser.getCapabilities();
        capsPromise.then(function (caps) {
            console.log(JSON.stringify(caps));
            var browserName = caps.caps_.browserName.toUpperCase();
            browser.browserName = browserName;
            var browserVersion = caps.caps_.version;
            var prePendStr = browserName + '-' + browserVersion + '-';
            jasmine.getEnv().addReporter(new jasmineRep.JUnitXmlReporter('protractor/', true, true, prePendStr));
        });
    // Disable animations so e2e tests run more quickly
    var disableNgAnimate = function () {
      angular.module('disableNgAnimate', []).run(function ($animate) {
          $animate.enabled(false);
      });
    };

  },

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: ['test/protractor_tests/**/*_spec.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: false,
    defaultTimeoutInterval: 900000
  }
};