'use strict';

describe('logger tests', function() {

    var Logger;

    beforeEach(function() {
        module('helpers');
    });

    beforeEach(inject(function(_logger_) {

        Logger = _logger_;

    }));

    it('should log', function() {

        // Arrange

        // Act


        // Assert
        expect(Logger).toBeDefined();
        //warning call
        Logger.warning('text', 'title', 'source', true);
        //error call
        Logger.error('text', 'title', 'source', true);
        //success call
        Logger.success('text', 'title', 'source', true);
        //info call
        Logger.log('text', 'title', 'source', true);

    });
});
