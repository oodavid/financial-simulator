'use strict';
/** LEDGER - SERVICE
 *
 *      The ledger allows various objects (loans, salary, assets etc.)
 *       to record changes in the financial status of the user.
 *
 *      @author   David 'oodavid' King
 */
angular.module('fateful')
.service('ledgerService', [function() {
    this.track = function(props){
        console.error('Ledger', props);
    };
}]);