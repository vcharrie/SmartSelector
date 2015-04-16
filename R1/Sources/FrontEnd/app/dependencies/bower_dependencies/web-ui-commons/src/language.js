'use strict';

angular.module('languageService', [])
.provider('languageService', function() {
	
	var selectedLanguage = {};

	var languages = [
	{name: 'English', iso: 'en', active: 'true'},
	{name: 'Français', iso: 'fr', active: 'false'},
	{name: 'Español, castellano', iso: 'es', active: 'true'},
	{name: 'русский язык', iso: 'ru', active: 'true'},
	{name: '中文 (Zhōngwén), 汉语, 漢語', iso: 'zh', active: 'false'}
	];
	
	var getLanguages = function() {
		return languages;
	};

	var getSelectedLanguage = function() {
		return selectedLanguage;
	};
	
	var setLanguages = function(newLanguages) {
			//We only update languages wether the structure is valid
			if (angular.isArray(newLanguages)) {
				var isValid = true;
				
				angular.forEach(newLanguages, function(languageObject, key) {
					if (!languageObject.hasOwnProperty('name')
						|| !languageObject.hasOwnProperty('iso')
						|| !languageObject.hasOwnProperty('active')) { 
						isValid = false;
				}
			});
				
				if (isValid) {
					languages = newLanguages;
				}
			}
		};

		var setSelectedLanguage = function(languageIso) {
			angular.forEach(languages, function(languageObject, key) {
				if (languageObject.iso === languageIso) { 
					selectedLanguage = languageObject;
				}
			});
			
		};
		
		return {
			setLanguages: setLanguages,

			$get : function () {
				return {
					getLanguages: getLanguages,
					getSelectedLanguage: getSelectedLanguage,
					setSelectedLanguage: setSelectedLanguage
				}
			},
		}
	});
