'use strict';
/** FILTERS
 *
 *      Various filters for general usage
 *
 *      @author   David 'oodavid' King
 */
(function(){
    angular.module('fateful')
    .filter('percentage', ['$filter', function ($filter) {
        return function(input, decimals){
            return $filter('number')(input * 100, decimals) + '%';
        };
    }])
    .filter('toYears', [function () {
        return function(months){
            var years = months / 12;
            return Math.floor(years) + 'y, ' + (months % 12) + 'm';
        };
    }])
    .filter('moneys', ['$filter', function ($filter) {
        return function(amount){
            if(amount){
                return $filter('currency')(amount);
            }
            return '--';
        };
    }]);
})();