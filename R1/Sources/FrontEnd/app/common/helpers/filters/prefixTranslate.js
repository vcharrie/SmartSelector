'use strict';

/**
 * A filter that translate a resource key with an optional prefix given as parameter.
 * Usage is {{ ExpressionValue | prefixTranslate:'foo'}}
 * That will cause a lookup of 'foo-expressionvalue' (notice that expression gets lowercased)
 */
angular.module('helpers').filter('prefixTranslate', function (gettextCatalog) {

    var numberExpression = new RegExp('^[0-9]*\\.[0-9]+|^[0-9]+');

    return function (input, param) {
        // if input and param are defined, check if we must prefix translation key
        if (param && input) {
            // if the input is a number, to not use any prefix
            var regexp = numberExpression.exec(input);
            if (!regexp || regexp.length === 0) {
                return gettextCatalog.getString(param + '-' + input.toLowerCase());
            }
        }

        return gettextCatalog.getString(input);
    };
});
