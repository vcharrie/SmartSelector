'use strict';

// declare the module
var serviceModule = angular.module('serviceModule', ['familyDiscountEditorModel', 'base64']);

serviceModule
    .provider(
        'pricingServiceFactory',
        function pricingServiceFactory($base64) {

            var baseUrl = "";
            var country = "";
			var token = "";
			var basicAuth = "";
			var title = "";

            var setBaseUrl = function(url) {
                baseUrl = url;
            }
            var setCountry = function(ctr) {
                country = ctr;
            }
			var setToken = function(tkn) {
                token = tkn;
            }
			
			var setBasicAuth = function(user, password) {
                basicAuth = 'Basic '+$base64.encode(user+':'+password);;
            }
			
			setTitle = function(tl) {
				title = tl;
			}

            return {
                setBaseUrl: setBaseUrl,
                setToken: setToken,
                setCountry: setCountry,
				setBasicAuth: setBasicAuth,
				setTitle: setTitle,
                $get: [
                    '$http',
                    'familyDiscountFactory',
                    function pricingServiceFactory($http,
                        familyDiscountFactory,$base64) {
                        var getFamiliesWithDiscount = function(onSuccess, onError) {
                            if (country == "") {
                                console.error("country must be set");
                                onError();
                            }
							if (token == "") {
								console.error("token must be set");
								onError();
							}
								
								
							var url = baseUrl+'/discount?priceList='+country.toUpperCase();
							$http.get(url, {headers:{'Authorization':token,'Accept':'application/json','Cache-control':'no-cache'}}).
								success(function(data, status, headers, config) {
									var families = [];
									for(var i=0; i<data.length; i++) {
										var familyName = data[i].familyCode;
										var discount;
										if (data[i].value == null) {
											discount = "";
										} else {
											discount = data[i].value;
										}
										var description = data[i].description;
										var date = new Date(data[i].validityStart);;
										var countryCode = data[i].countryCode;
										var familyDiscount = new familyDiscountFactory(familyName, discount, description, date, countryCode);
										families.push(familyDiscount);
									}
									onSuccess(families);
								})
								.error(function(data, status, headers, config) {
									onError();
								});
                        };
						
						var saveFamilies = function(familiesToSave, onSuccess, onError) {
							if (country == "") {
                                console.error("country must be set");
                                onError();
                            }
							if (token == "") {
								console.error("token must be set");
								onError();
							}
								
								
							var url = baseUrl+'/discount/'+country.toUpperCase();
							$http.put(url, familiesToSave, {headers:{'Authorization':token}}).
								success(function(data, status, headers, config) {
									onSuccess();
								}).error(function(data, status, headers, config) {
									onError();
								});
                        };
                        
                        var getTitle = function() {
							return title;
                        };

                        return {
                            getFamiliesWithDiscount: getFamiliesWithDiscount,
							setCountry: setCountry,
							setToken: setToken,
							saveFamilies: saveFamilies,
							setBaseUrl: setBaseUrl,
							setTitle: setTitle,
							getTitle: getTitle
                        };
                    }
                ]
            };
        });