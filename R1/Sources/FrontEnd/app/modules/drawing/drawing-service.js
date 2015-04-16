'use strict';

angular.module('drawing.service', []).service('drawingService', function() {
    var service = {


    };

    // this object is used by controllers to store values during app lifetime
    // for example in order to prevent data reload from http request when user
    // navigates between tabs
    service.cache = { };

    return service;
});