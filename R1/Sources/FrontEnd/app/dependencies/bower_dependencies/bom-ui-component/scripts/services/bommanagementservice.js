'use strict';

/**
 * @ngdoc service
 * @name bomUiApp.bomManagementService
 * @description # bomManagementService Factory in the bomUiApp.
 */
angular.module('bomServices', 
		['bomModel'])
.provider('bomManagementService', function() {
	
	var serverUrl = "";
	
	var setServerUrl = function(url) {
		serverUrl = url;
	}
	
	var getServerUrl = function() {
		return serverUrl;
	}	
	
	var isPrinting = false;
	   
	var setPrinting = function (status) {
		if (typeof status === 'boolean') {
			isPrinting = status;
		}
	}
   
	var getPrinting = function () {
		return isPrinting;
	}
	
	return {
		setServerUrl: setServerUrl,
		$get: [
	       'Bom',
	       function bomServiceFactory(Bom) {
	    	   
	    	   var bom = new Bom();
	    		
	    		var getBom = function() {
	    			return bom;
	    		};
	    	   return {
	    	  	getBom: getBom,
	    	  	getServerUrl: getServerUrl,
	    	  	setServerUrl: setServerUrl,
	    	  	setPrinting: setPrinting,
	    	  	getPrinting: getPrinting
	    	   }
	       }
	    ]}
});
