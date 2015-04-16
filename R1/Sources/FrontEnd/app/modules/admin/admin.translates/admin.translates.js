'use strict';

/*
 * admin drawings controller
 */
angular.module('admin')
    .config(function($routeProvider) {
        $routeProvider.when('/admin/translates',
            {
                controller: 'admin-translates',
                templateUrl: 'modules/admin/admin.translates/admin.translates.view.html'
            });
    }).filter('toArray', function() {
        return function(input) {

            var out = [];
            for (var i in input) {
                out.push(input[i]);
            }
            return out;
        };
    })
    .controller('admin-translates', function($scope, $q, applicationConfigurationService, logger) {

        function init() {
            $scope.isLoading = true;
            $scope.addedId = 0;
            $scope.searchTranslation = '';
            $scope.selectedLanguage = '';
            $scope.avaliableLanguages = [];
            $scope.selectedLanguageValues = {};

            applicationConfigurationService.getApplicationParameter('languages').then(function(languages) {

                languages.parameterObject.forEach(function(language) {
                    $scope.avaliableLanguages.push(language.langKey);
                });

                var promises = [];
                $scope.avaliableLanguages.forEach(function(langue) {
                    promises.push(applicationConfigurationService.getApplicationParameter(langue));


                });

                //get all traductions and flat them
                $q.all(promises).then(function(results) {
                    var translations = {};

                    results.forEach(function(languageParameters) {

                        for (var parameterId in languageParameters.parameterObject) {
                            if (!translations[parameterId]) {
                                translations[parameterId] = { id: parameterId, trads: {} };
                            }
                            translations[parameterId].trads[languageParameters.parameterId] = { value: languageParameters.parameterObject[parameterId],version:languageParameters.parameterVersion };
                        }
                    });

                    $scope.selectedLanguageValues = translations;
                    $scope.isLoading = false;
                });
            });
        }

        init();


        $scope.saveTranslations = function() {

            var transToSave = {};
            $scope.avaliableLanguages.forEach(function(language) {
                transToSave[language] = { language: language };
                for (var parameterId in $scope.selectedLanguageValues) {
                    transToSave[language][$scope.selectedLanguageValues[parameterId].id] = $scope.selectedLanguageValues[parameterId].trads[language].value;
                }
            });


            var promises = [];
            for (var language in transToSave) {
                promises.push(applicationConfigurationService.setApplicationParameter(language, transToSave[language]));

            }
            $q.all(promises).then(function(results) {

                results.forEach(function(result) {
                    logger.success(result, 'Translate Admin', 'saveTranslations', true);
                });
                init();
            });

        };

        $scope.addLanguage = function() {
        };

        $scope.deleteLanguage = function() {
        };

        $scope.addTranslation = function() {
            var id = 'newId' + $scope.addedId;

            $scope.selectedLanguageValues[id] = { id: id, trads: {} };
            $scope.avaliableLanguages.forEach(function(language) {
                $scope.selectedLanguageValues[id].trads[language] = { value: id + ' value' + language, version: -1 };
            });
            logger.success(id + ' added', 'Translate Admin', 'addTranslation', true);
            $scope.searchTranslation = 'newId';
            $scope.addedId++;
        };

        $scope.deleteTranslation = function(translationId) {
            delete $scope.selectedLanguageValues[translationId];
            logger.success(translationId + ' removed', 'Translate Admin', 'deleteTranslation', true);
        };
    });
