'use strict';

/**
 * @class angular_module.helpers.blmService
 */
angular.module('helpers').service('blmService', function (_, $q, gettextCatalog, logger, apiHelper, apiConstants) {


    /**
     * @description Service public interface
     * @type {{blmSpimUrl: string, blmSpimDocumentUrl: string, blmAccessOk: boolean}}
     */
    var service = {
        blmAccessOk: false,
        blmSpimUrl: '',
        blmSpimDocumentUrl: '',
        blmBaseUrl: '',
        blmSiteUrl: '',
        blmApiKey: ''
    };

    // used to encode data in B64 for blm api
    function utf8ToB64(str) {
        console.log(str);
        /* jshint ignore:start */
        return window.btoa(unescape(encodeURIComponent(str)));
        /* jshint ignore:end */
    }

    /**
     * @description initialize blm url api end point
     * @return {Promise.<{String url}>} the promise that will contain the user information
     */
    service.initBlmUrl = function () {
        var deferred = $q.defer();


        apiHelper.get(apiConstants.serviceUrl, {'urlId': 'blmSiteUrl'}).then(
            function (siteUrl) {
                service.blmSiteUrl = siteUrl;
            });


        apiHelper.get(apiConstants.serviceUrl, {'urlId': 'blmApiUrl'}).then(
            function (url) {
                service.blmBaseUrl = url;
                service.blmSpimUrl = url + apiConstants.blmSpimApiBase;
                service.blmSpimDocumentUrl = url + apiConstants.blmSpimDocumentApiBase;
                deferred.resolve(service.blmSpimUrl);
            },
            function (errorGettingUrl) {
                deferred.reject(errorGettingUrl);
            });
        return deferred.promise;
    };

    /**
     * @description initialize blm url api end point
     * @return {Promise.<{String url}>} the promise that will contain the user information
     */
    service.initBlmApiKey = function () {
        var deferred = $q.defer();
        apiHelper.get(apiConstants.serverEnvironment, {'parameterId': 'blmApiKey'}).then(
            function (key) {
                service.blmApiKey = key;

                deferred.resolve(service.blmApiKey);
            },
            function () {
                service.blmApiKey = '';
                deferred.resolve(service.blmApiKey);
            });
        return deferred.promise;
    };


    var buildHeader = function (token) {
        var headers = [
            {'name': 'Authorization', 'value': token},
            {'name': 'Accept-Language', 'value': 'en'}
        ];
        if (service.blmApiKey !== '') {
            headers = [
                {'name': 'Authentication', 'value': token},
                {'name': 'Authorization', 'value': 'Bearer ' + service.blmApiKey},
                {'name': 'Accept-Language', 'value': 'en'}

            ];
        }
        return headers;

    };
    var buildPostHeader = function (token) {
        var headers = {
            headers: {'Content-Type': 'application/json', 'Authorization': token, 'Accept-Language': 'en'}

        };

        if (service.blmApiKey !== '') {
            headers = {
                headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + service.blmApiKey, 'Authentication': token, 'Accept-Language': 'en'}
            };

        }


        return headers;

    };


    /**
     * @description list Project
     * @param {String} token
     * @return {Promise.<Array<blmProject>>} the promise that will contain the creation result
     */
    service.projects = function (token) {
        var deferred = $q.defer();


        apiHelper.get(service.blmSpimUrl + apiConstants.blmProjects, {}, buildHeader(token)).then(
            function (projects) {
                service.blmAccessOk = true;

                //todo remove ack to avoid no workspace available in blM
                if (projects.spimObject === undefined) {

                    var blmProjectInfo =
                    {
                        'name': 'My QuickQuotation Projects',
                        'description': gettextCatalog.getString('default-blm-project-description'),
                        'client': 'default',
                        'startDate': new Date(),
                        'status': 'status.new',
                        'objectType': 'Project'
                    };
                    service.createProject(token, blmProjectInfo);
                }
                //todo remove ack to avoid no workspace available in blM


                deferred.resolve(projects);
            },
            function (errProjects) {
                service.blmAccessOk = false;
                deferred.reject(errProjects);
            });
        return deferred.promise;
    };

    /**
     * @description create Project
     * @param {String} token
     * @param {Object} projectInfo
     * @param {String} projectInfo.name
     * @param {String} projectInfo.description
     * @param {String} projectInfo.client
     * @param {String} projectInfo.status
     * @param {String} projectInfo.objectType
     * @return {Promise.<blmProject>} the promise that will contain the created project
     */
    service.createProject = function (token, projectInfo) {
        var deferred = $q.defer();

        apiHelper.post(service.blmSpimUrl + apiConstants.blmProjects, projectInfo, buildPostHeader(token)
        ).then(
            function (project) {
                deferred.resolve(project);
            },
            function (errProject) {
                deferred.reject(errProject);
            });

        return deferred.promise;
    };

    /**
     * @description get blm sub item list
     * @param {String} token
     * @param {String} itemId
     * @return {Promise.<Array<blmItem>>} the promise that will contain result item
     */
    service.subItems = function (token, itemId) {
        var deferred = $q.defer();

        var parameterizedUrl = service.blmSpimUrl + apiConstants.blmSubItems;

        apiHelper.get(parameterizedUrl.replace('{itemID}', itemId), {}, buildHeader(token)).then(
            function (subItems) {
                deferred.resolve(subItems);
            },
            function (errSubItems) {
                deferred.reject(errSubItems);
            });

        return deferred.promise;
    };

    /**
     * @description get blm item
     * @param {String} token
     * @param {String} itemId
     * @return {Promise.<blmItem>} the promise that will contain result item
     */
    service.item = function (token, itemId) {
        var deferred = $q.defer();
        var parameterizedUrl = service.blmSpimUrl + apiConstants.blmItem;


        apiHelper.get(parameterizedUrl.replace('{itemID}', itemId), {}, buildHeader(token)).then(
            function (item) {
                deferred.resolve(item);
            },
            function (errItem) {
                deferred.reject(errItem);
            });

        return deferred.promise;
    };

    /**
     * @description create sub item
     * @param {String} token
     * @param {String} parentItemId
     * @param {Object} subItemInfo
     * @return {Promise.<subItem>} the promise that will contain the created sub item result
     */
    service.createSubItem = function (token, parentItemId, subItemInfo) {
        var deferred = $q.defer();
        var parameterizedUrl = service.blmSpimUrl + apiConstants.blmSubItems;

        apiHelper.post(parameterizedUrl.replace('{itemID}', parentItemId), subItemInfo, buildPostHeader(token)).then(
            function (subItem) {
                deferred.resolve(subItem);
            },
            function (errSubItem) {
                deferred.reject(errSubItem);
            });

        return deferred.promise;
    };

    /**
     * @description updateDocument
     * @param {String} token
     * @param {String} parentItemId
     * @param {Object} documentInfo
     * @return {Promise.<blmDocumentInfo>} the promise that will contain the created sub item result
     */
    var updateDocument = function (token, itemId, documentInfo) {
        var deferred = $q.defer();
        var parameterizedUrl = service.blmSpimDocumentUrl;
        if (documentInfo !== undefined && documentInfo.contentStream !== undefined) {
            parameterizedUrl =service.blmSpimDocumentUrl+ apiConstants.blmItemsByte;
        }
        else {
            parameterizedUrl =service.blmSpimUrl+ apiConstants.blmItem;
        }

        apiHelper.putObject(parameterizedUrl.replace('{itemID}', itemId), documentInfo, buildPostHeader(token)).then(
            function (blmDocumentInfo) {
                deferred.resolve(blmDocumentInfo);
            },
            function (errDocumentInfo) {
                deferred.reject(errDocumentInfo);
            });

        return deferred.promise;
    };

    /**
     * @description uploadDocument
     * @param {String} token
     * @param {String} parentItemId
     * @param {Object} documentInfo
     * @return {Promise.<blmDocumentInfo>} the promise that will contain the created sub item result
     */
    var uploadDocument = function (token, parentItemId, documentInfo) {
        var deferred = $q.defer();
        var parameterizedUrl = service.blmSpimDocumentUrl + apiConstants.blmSubItems;

        apiHelper.post(parameterizedUrl.replace('{itemID}', parentItemId), documentInfo, buildPostHeader(token)).then(
            function (blmDocumentInfo) {

                if (!blmDocumentInfo.status) {
                    deferred.reject(blmDocumentInfo.errMsg);
                }
                else {
                    updateDocument(token, blmDocumentInfo.objectId, documentInfo).then(function (blmBytesInfo) {

                            if (!blmBytesInfo.status) {
                                deferred.reject(blmBytesInfo.errMsg);
                            }
                            else {
                                deferred.resolve(blmBytesInfo);
                            }
                        },

                        function (erroBlmBytesInfo) {
                            deferred.reject(erroBlmBytesInfo);
                        }
                    );
                }

            },
            function (errDocumentInfo) {
                deferred.reject(errDocumentInfo);
            });

        return deferred.promise;
    };

    var loadDocument = function (token, documentId) {
        var deferred = $q.defer();
        var parameterizedUrl = service.blmSpimDocumentUrl + apiConstants.blmSpimDocument;

        apiHelper.get(parameterizedUrl.replace('{documentID}', documentId), {}, buildHeader(token)).then(
            function (blmDocumentInfo) {
                deferred.resolve(blmDocumentInfo);
            },
            function (errDocumentInfo) {
                deferred.reject(errDocumentInfo);
            });

        return deferred.promise;
    };

    /**
     * @description save project in blm document
     * @param {string} userId
     * @param {string} workspaceId
     * @param {string} name
     * @param {object} jsonDataToSerialize
     * @return {Promise.<loadedDocument>} the promise that will contain the uploaded document info
     */

    service.saveJsonData = function (userId, workspaceId, name, jsonDataToSerialize) {

        var deferred = $q.defer();
        var fileInfo =
        {
            'name': name + '.eqq',
            'description': 'application raw data',
            'mimeType': 'application/json',
            'contentStream': utf8ToB64(jsonDataToSerialize)

        };

        service.subItems(userId, workspaceId).then(function (results) {
            console.log(results);
            if (results.spimObject !== undefined) {
                results.spimObject.forEach(function (document) {
                    if (document.name === fileInfo.name) {
                        var now = new Date();
                        var dd = now.getDate();
                        //January is 0!
                        var mm = now.getMonth() + 1;
                        var hh = now.getHours();
                        var min = now.getMinutes();
                        var sec = now.getSeconds();
                        var yyyy = now.getFullYear();
                        if (dd < 10) {
                            dd = '0' + dd;
                        }
                        if (mm < 10) {
                            mm = '0' + mm;
                        }
                        if (hh < 10) {
                            hh = '0' + hh;
                        }
                        if (min < 10) {
                            min = '0' + min;
                        }
                        if (sec < 10) {
                            sec = '0' + sec;
                        }
                        var stringNow = '' + yyyy + mm + dd + '_' + hh + min + sec;

                        fileInfo.name = name + ' (' + stringNow + ').eqq';
                    }
                });
            }

            uploadDocument(userId, workspaceId, fileInfo).then(function (createdFileInfo) {
                if (createdFileInfo.status) {
                    deferred.resolve(createdFileInfo);
                }
                else {
                    deferred.reject(createdFileInfo.errMsg);
                }
            }, function (err) {
                deferred.reject(err);
            });
        });


        return deferred.promise;
    };


    service.updateMetaData = function (userId, itemId, metaData) {

        var deferred = $q.defer();

        updateDocument(userId, itemId, metaData).then(function (createdFileInfo) {
            if (createdFileInfo.status) {
                deferred.resolve(createdFileInfo);
            }
            else {
                deferred.reject(createdFileInfo.errMsg);

            }
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };


    service.updateJsonData = function (userId, itemId, jsonDataToSerialize) {

        var deferred = $q.defer();
        var fileInfo =
        {

            'description': 'application raw data',
            'mimeType': 'application/json',
            'contentStream': utf8ToB64(jsonDataToSerialize)

        };

        updateDocument(userId, itemId, fileInfo).then(function (createdFileInfo) {
            if (createdFileInfo.status) {
                deferred.resolve(createdFileInfo);
            }
            else {
                deferred.reject(createdFileInfo.errMsg);

            }
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };


    /**
     * @description save project in blm document
     * @param {object} user
     * @param {object} project
     * @param {object} dataToSerialize
     * @return {Promise.<loadedDocument>} the promise that will contain the uploaded document info
     */
    service.loadProject = function (userId, spimObjectId) {
        var deferred = $q.defer();
        loadDocument(userId, spimObjectId).then(function (loadSpimDocument) {

            console.log(loadSpimDocument);
            deferred.resolve(loadSpimDocument);

        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };


    return service;
});