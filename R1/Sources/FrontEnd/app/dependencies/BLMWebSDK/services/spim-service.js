/**
 * Created by Danyang LI on 29/11/14.
 */

'use strict';
/* global CryptoJS */

angular.module('blmWebSDKDirective').service('spimService', ['userServices', function (userServices) {

    var spimService = {apiKey: ''};
    //LOCAL PROXY 10.195.163.216
    //EXTERNAL PROXY 54.171.114.75
    //QA PROXY blm-ppr.blcm.schneider-electric.com
    // var serverAddress = 'blm-ppr.blcm.schneider-electric.com';


    spimService.serverAddress = 'https://blm-ppr.blcm.schneider-electric.com';

    spimService.setApiKey = function (apiKey) {
        spimService.apiKey = apiKey;
    };


    spimService.getAllProjects = function (callback, errorCallback) {
        $.ajax({
            url: spimService.serverAddress + '/spim/items',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept-Language', 'en');
                if (spimService.apiKey !== '') {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + spimService.apiKey);
                    xhr.setRequestHeader('Authentication', userServices.getToken());
                }
                else {
                    xhr.setRequestHeader('Authorization', userServices.getToken());
                }
            }
        }).done(function (data) {
            callback(data.spimObject);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (errorCallback !== undefined) {
                errorCallback([jqXHR, textStatus, errorThrown]);
            }
        });
    };
    spimService.getWorkspaceById = function (entityId, callback, errorCallback) {
        $.ajax({
            url: spimService.serverAddress + '/spim/items/' + entityId + '/childItems',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept-Language', 'en');
                if (spimService.apiKey !== '') {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + spimService.apiKey);
                    xhr.setRequestHeader('Authentication', userServices.getToken());
                }
                else {
                    xhr.setRequestHeader('Authorization', userServices.getToken());
                }
            }
        }).done(function (data) {
            if (!data.spimObject) {
                callback([]);
            } else {
                if (data.spimObject instanceof Array) {
                    callback(data.spimObject);
                } else {
                    callback([data.spimObject]);
                }
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (errorCallback !== undefined) {
                errorCallback([jqXHR, textStatus, errorThrown]);
            }
        });
    };

    spimService.deleteObjectById = function (entityId, callback, errorCallback) {
        $.ajax({
            url: spimService.serverAddress + '/spim/items/' + entityId,
            async: true,
            type: 'DELETE',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept-Language', 'en');
                if (spimService.apiKey !== '') {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + spimService.apiKey);
                    xhr.setRequestHeader('Authentication', userServices.getToken());
                }
                else {

                    xhr.setRequestHeader('Authorization', userServices.getToken());
                }
            }
        }).done(function (data) {
            if (!data.spimObject) {
                callback([data]);
            } else {
                if (data.spimObject instanceof Array) {
                    callback(data.spimObject);
                } else {
                    callback([data.spimObject]);
                }
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (errorCallback !== undefined) {
                errorCallback([jqXHR, textStatus, errorThrown]);
            }
        });
    };

    spimService.updateObjectMetadata = function (entity, callback, errorCallback) {

        entity.name = entity.title;

        var objJsonStr = JSON.stringify(entity);
        $.ajax({
            url: spimService.serverAddress + '/spim/items/' + entity.objectId,
            async: true,
            type: 'PUT',
            data: objJsonStr,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept-Language', 'en');
                if (spimService.apiKey !== '') {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + spimService.apiKey);
                    xhr.setRequestHeader('Authentication', userServices.getToken());
                }
                else {
                    xhr.setRequestHeader('Authorization', userServices.getToken());
                }
            },
            timeout: 50000
        }).done(function (data) {
            console.log(data);
            callback(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (errorCallback !== undefined) {
                errorCallback([jqXHR, textStatus, errorThrown]);
            }
        });
    };


    spimService.createProject = function (entity, callback, errorCallback) {
        var objJsonStr = JSON.stringify(entity);
        $.ajax({
            url: spimService.serverAddress + '/spim/items',
            async: true,
            type: 'POST',
            data: objJsonStr,
            beforeSend: function (xhr) {

                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept-Language', 'en');

                if (spimService.apiKey !== '') {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + spimService.apiKey);
                    xhr.setRequestHeader('Authentication', userServices.getToken());
                }
                else {

                    xhr.setRequestHeader('Authorization', userServices.getToken());
                }

            }
        }).done(function (data) {
            callback(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (errorCallback !== undefined) {
                errorCallback([jqXHR, textStatus, errorThrown]);
            }
        });
    };
    spimService.createWorkspace = function (entity, parentId, callback, errorCallback) {
        console.log(spimService.serverAddress + '/spim/items/' + parentId + '/childItems');
        var objJsonStr = JSON.stringify(entity);
        console.log(objJsonStr);
        $.ajax({
            url: spimService.serverAddress + '/spim/items/' + parentId + '/childItems?type=workspace',
            async: true,
            type: 'POST',
            data: objJsonStr,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader('Accept-Language', 'en');
                if (spimService.apiKey !== '') {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + spimService.apiKey);
                    xhr.setRequestHeader('Authentication', userServices.getToken());
                }
                else {

                    xhr.setRequestHeader('Authorization', userServices.getToken());
                }
            }
        }).done(function (data) {
            callback(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (errorCallback !== undefined) {
                errorCallback([jqXHR, textStatus, errorThrown]);
            }

        });
    };
    spimService.addFile = function (theFile, base64Str, callback, errorCallback) {
        var entity = {
            'mimeType': theFile.type,
            'name': theFile.name,
            'contentStream': base64Str[1]
        };
        var objJsonStr = JSON.stringify(entity);
        $.ajax({
            url: spimService.serverAddress + '/spim-document/items/' + commonServices.getCurrentEntity().objectId + '/childItems',
            async: true,
            type: 'POST',
            data: objJsonStr,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('username', userServices.getUser().id);
                xhr.setRequestHeader('Accept-Language', 'en');
                if (spimService.apiKey !== '') {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + spimService.apiKey);
                    xhr.setRequestHeader('Authentication', userServices.getToken());
                }
                else {
                    xhr.setRequestHeader('Authorization', userServices.getToken());
                }
            },
            timeout: 50000
        }).done(function (data) {
            console.log(data);
            callback(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (errorCallback !== undefined) {
                errorCallback([jqXHR, textStatus, errorThrown]);
            }

        });
    };

    return spimService;
}]);

