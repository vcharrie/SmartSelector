'use strict';

/**
 * @class angular_module.d3.d3
 * @description d3 object
 */

angular.module('helpers').service('browserDetection', function() {

    var service = {
        isOpera : 'opera',
        isFirefox : 'firefox',
        isSafari : 'safari',
        isChrome : 'chrome',
        isIE : 'internetExplorer'
    };

    service.browserStatut = function (){
        if (!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0){
            // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
            return service.isOpera;
        } else if (typeof InstallTrigger !== 'undefined'){
            // Firefox 1.0+
            return service.isFirefox;
        } else if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0){
            // At least Safari 3+: "[object HTMLElementConstructor]"
            return service.isSafari;
        } else if (!!window.chrome && service.browserStatut !== service.isOpera){
            // Chrome 1+
            return service.isChrome;
        } else if (/*@cc_on!@*/false || !!document.documentMode){
            // At least IE6
            return service.isIE;
        } else {
            return null;
        }
    };

    return service;
});
