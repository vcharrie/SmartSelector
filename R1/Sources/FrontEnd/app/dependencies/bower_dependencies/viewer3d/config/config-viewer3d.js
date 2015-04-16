'use strict';

/*
 * Example config file for viewer3d directive
 */
angular.module('viewer3d').config(function($viewer3dProvider) { 

	$viewer3dProvider.options({
		
		webGLNotAvailableErrorMessage : "WebGL missing"
	});  


});
