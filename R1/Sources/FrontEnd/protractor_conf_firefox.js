// An example configuration file.
exports.config = {
    seleniumServerJar: './selenium/selenium-server-standalone-2.44.0.jar',
    seleniumArgs: ['-browserTimeout=60'],

    // Firefox 30 fails in Waiting for Page Synchronization
    // https://github.com/angular/protractor/blob/master/docs/timeouts.md
    // so needs to finish each test in less that 1 min 40
    // (probably a script or a file never finish to be loaded)
    allScriptsTimeout: 99999,

  // Do not start a Selenium Standalone sever - only run this using chrome.
  chromeOnly: false,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'firefox'
  },
  onPrepare: function() {
    // The require statement must be down here, since jasmine-reporters
    // needs jasmine to be in the global and protractor does not guarantee
    // this until inside the onPrepare function.
    var jasmineRep= require('jasmine-reporters');
	var capsPromise = browser.getCapabilities();
        capsPromise.then(function (caps) {
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
    defaultTimeoutInterval: 60000
  }
};
