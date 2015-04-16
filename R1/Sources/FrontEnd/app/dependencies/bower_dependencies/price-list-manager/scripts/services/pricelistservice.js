'use strict';

/**
 * @ngdoc service
 * @name srcApp.priceListService
 * @description # priceListService Service in the priceListServiceModule.
 */
angular.module('priceListServiceModule',['angularFileUpload','gettext'])
.provider('priceListService', function() {
	var userToken = "";
	
	var setUserToken = function(token) {
		userToken = token;
	}
	
	var serverUrl = "";
	
	var setServerUrl = function(url) {
		serverUrl = url;
	}
	
	var getServerUrl = function() {
		return serverUrl;
	}
	
	var userToken = "";
	
	var setUserToken = function(token) {
		userToken = token;
	}
	
	var publicCountryList = [];
	
	var translations = {};
	
	var setTranslationsForPublicLists = function(transl) {
		translations = transl;
	}
	
	var addCountryInList = function(listId) {
		if (publicCountryList.indexOf(listId) === -1)
			publicCountryList.push(listId);
	}
	
	var translatePublicLists = function(list) {
		
		if (translations[list.id]) {
			if (translations[list.id].name) {
				list.overridenName = translations[list.id].name;
			}
			if (translations[list.id].description) {
				list.overridenDescription = translations[list.id].description;
			}
		}
	}
	
	return {
		setServerUrl: setServerUrl,
		setUserToken: setUserToken,
		addCountryInList: addCountryInList,
		setTranslationsForPublicLists: setTranslationsForPublicLists,
		$get: [
		       '$http', '$q', '$upload','gettextCatalog',
		       function pricingServiceFactory($http, $q, $upload, gettextCatalog) {
		    	   
		    	   var getCountriesList = function() {
		    		   
		    		   if (serverUrl === '') {
		    			   throw "No server URL specified";
		    		   }
		    		   
		    		   var promises = [];
		    		    
		    		    angular.forEach(publicCountryList, function(countryId){
		    		      
		    		      var deffered  = $q.defer();
		    		  
		    		      $http({
		    		        url : serverUrl+'/pricelists/'+countryId,
		    		        headers : {'Authorization': userToken,'Accept':'application/json','Accept-Language':gettextCatalog.getCurrentLanguage()},
		    		        method: 'GET'
		    		      }).
		    		      success(function(data){
		    		    	translatePublicLists(data);
		    		        deffered.resolve(data);
		    		      }).
		    		      error(function(data, status){
		    		          deffered.reject(data, status);
		    		      });
		    		      
		    		      promises.push(deffered.promise);

		    		    })
		    		    
		    		    return $q.all(promises);
		    	   }
		    	   
		    	   var getUserLists = function() {
			    		  
		    		   var promise = $http({
		    			   url : serverUrl+'/pricelists?archived=false',
		    			   headers : {'Authorization': userToken,'Accept':'application/json','Accept-Language':gettextCatalog.getCurrentLanguage()},
		    			   method: 'GET' 
		    		   })
		    		   
		    		   return promise;
		    	   };
		    	   
		    	   var deleteList = function(id) {
			    		  
		    		   var promise = $http({
		    			   url : serverUrl+'/pricelists/'+id,
		    			   headers : {'Authorization': userToken,'Accept':'application/json','Accept-Language':gettextCatalog.getCurrentLanguage()},
		    			   method: 'DELETE'
		    		   })
		    		   
		    		   return promise;
		    	   };
		    	   
		    	   var updateList = function(list) {
			    		  
		    		   var promise = $http({
		    			   url : serverUrl+'/pricelists/'+list.id,
		    			   headers : {'Authorization': userToken,'Accept':'application/json','Accept-Language':gettextCatalog.getCurrentLanguage()},
		    			   data : list,
		    			   method: 'PUT'
		    		   })
		    		   
		    		   return promise;
		    	   };
		    	   
		    	   var createList = function(list) {
		    		   var deferred = $q.defer();  
		    		   $http({
		    			   url : serverUrl+'/pricelists/',
		    			   headers : {'Authorization': userToken,'Accept':'application/json','Accept-Language':gettextCatalog.getCurrentLanguage()},
		    			   data : list,
		    			   method: 'POST'
		    		   }).
		    	        success(function (data, status, headers, config) {
		    	        	var location = headers('Location');

		    	            deferred.resolve(location);            
		    	        }).
		    	        error(function (data, status) {
		    	            deferred.reject(data, status);
		    	        });
		    	        return deferred.promise;      
		    	   };
		    	   
		    	   var uploadFile = function(excelFile,listId,data) {
		    		   	var promise = $upload.upload({
					        url: serverUrl+'/pricelists/'+listId, // upload.php script, node.js route, or servlet url
					        method: 'POST',
					        headers: {'Authorization': userToken,'Accept-Language':gettextCatalog.getCurrentLanguage()}, // only for html5
					        //withCredentials: true,
					        data: data,
					        file: excelFile, // single file or a list of files. list is only for html5
					        //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
					        //fileFormDataName: myFile, // file formData name ('Content-Disposition'), server side request form name
					                                    // could be a list of names for multiple files (html5). Default is 'file'
					        //formDataAppender: function(formData, key, val){}  // customize how data is added to the formData. 
					                                                            // See #40#issuecomment-28612000 for sample code

					      }).progress(function(evt) {
					        //console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ evt.config.file.name);
					      }).success(function(data, status, headers, config) {
					        // file is uploaded successfully
					        //console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
					      }).error(function(){
					    	  //console.log("error file upload");
					      });
		    		   return promise;
		    	   };
		    	   
		    	   return {
		    		   setServerUrl: setServerUrl,
		    		   getServerUrl: getServerUrl,
		    		   setUserToken: setUserToken,
		    		   setTranslationsForPublicLists: setTranslationsForPublicLists,
		    		   addCountryInList: addCountryInList,
		    		   getCountriesList: getCountriesList,
		    		   getUserLists: getUserLists,
		    		   deleteList: deleteList,
		    		   updateList: updateList,
		    		   createList: createList,
		    		   uploadFile: uploadFile
		    	   }
		       }
		]
	};
});
