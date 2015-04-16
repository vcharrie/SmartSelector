'use strict';

/*
 * Format a 3D dimensions. Input is any object that has a width, height and depth property
 */
angular.module('helpers').filter('dimensions', function (gettextCatalog) {
    return function (input) {
        if (!input.width || !input.height || !input.depth) {
            return '';
        }

        var width = input.width ? input.width : 'N/A';
        var height = input.height ? input.height : 'N/A';
        var depth = input.depth ? input.depth : 'N/A';

        var sizing = gettextCatalog.getString('enclosure-dimensions-millimeter');
        var w = gettextCatalog.getString('enclosure-dimensions-width') + ':';
        var h = gettextCatalog.getString('enclosure-dimensions-height') + ':';
        var d = gettextCatalog.getString('enclosure-dimensions-depth') + ':';

        // format is w:10mm h:10mm d:10mm
        return w + width + sizing + ' ' + h + height + sizing + ' ' + d + depth + sizing;
    };
});
