'use strict';
/** FILTERS
 *
 *      Various filters for general usage
 *
 *      @author   David 'oodavid' King
 */
angular.module('fateful')
.filter('percentage', ['$filter', function ($filter) {
    return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
    };
}]);