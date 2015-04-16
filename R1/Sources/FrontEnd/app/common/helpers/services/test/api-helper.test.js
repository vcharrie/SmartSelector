'use strict';

/**
 * Tests for apiService
 */
describe('apiService', function() {

  var $httpBackend, apiHelper, apiConstants, logger;

    beforeEach(function() {
        module('helpers','ngCookies');

    inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      apiHelper = $injector.get('apiHelper');
      apiConstants = $injector.get('apiConstants');
      logger = $injector.get('logger');
    });

    // Define all internal controller properties
    $httpBackend.whenGET('projectList.html').respond(200, '');
    try {
      $httpBackend.flush();
    } catch (e) {
      logger.log('Error in $httpBackend.flush();');

    }
  });

  // Clean $httpBackend.
  afterEach(function() {
    try {
      $httpBackend.flush();
    } catch (e) {
      logger.log('Error in $httpBackend.flush();');
    }

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.resetExpectations();
  });

  it('should have a get method', function() {
    expect(typeof (apiHelper.get)).toBe('function');
  });

  it('should have a post method', function() {
    expect(typeof (apiHelper.post)).toBe('function');
  });

 /* describe('methods', function() {


    var callbacks;

    beforeEach(function() {
      callbacks = {
        'onSuccess' : function onSuccess() {

          logger.log('onSuccess called !');

        },
        'onError' : function onError() {

        }
      };

      spyOn(callbacks, 'onSuccess');
      spyOn(callbacks, 'onError');
    });

    it('should succeed a GET request', function() {

      // Arrange
      $httpBackend.expectGET(apiConstants.baseUri + '/toto').respond({
        value : 'toto'
      });

      // Act
      apiHelper.get('/toto', null).then(callbacks.onSuccess, callbacks.onError);
      try {
        $httpBackend.flush();
      } catch (e) {

        logger.log('Error in $httpBackend.flush();');

      }

      // Assert
      expect(callbacks.onSuccess).toHaveBeenCalled();
    });

    it('should fail a GET request', function() {

      // Arrange
      $httpBackend.expectGET(apiConstants.baseUri + '/toto').respond(400, '');

      // Act
      apiHelper.get('/toto', null).then(callbacks.onSuccess, callbacks.onError);
      try {
        $httpBackend.flush();
      } catch (e) {

        logger.log('Error in $httpBackend.flush();');

      }

      // Assert
      expect(callbacks.onError).toHaveBeenCalled();
    });

    it('should succeed a POST request', function() {

      // Arrange
      var payload = { value: 'value' };
      $httpBackend.expectPOST(apiConstants.baseUri + '/toto', payload).respond(200, '');

      // Act
      apiHelper.post('/toto', payload).then(callbacks.onSuccess, callbacks.onError);
      try {
        $httpBackend.flush();
      } catch (e) {

        logger.log('Error in $httpBackend.flush();');

      }

      // Assert
      expect(callbacks.onSuccess).toHaveBeenCalled();
    });

    it('should fail a POST request', function() {

      // Arrange
        var payload = { value: 'value' };
      $httpBackend.expectPOST(apiConstants.baseUri + '/toto', payload).respond(400, '');

      // Act
      apiHelper.post('/toto', payload).then(callbacks.onSuccess, callbacks.onError);
      try {
        $httpBackend.flush();
      } catch (e) {

        logger.log('Error in $httpBackend.flush();');

      }

      // Assert
      expect(callbacks.onError).toHaveBeenCalled();
    });

  });*/
});