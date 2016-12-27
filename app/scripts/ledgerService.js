'use strict';
/** LEDGER - SERVICE
 *
 *      The ledger allows various objects (loans, salary, assets etc.)
 *       to record changes in the financial status of the user.
 *
 *      @author   David 'oodavid' King
 */
angular.module('fateful')
.service('ledgerService', ['gameLoop', function(gameLoop){
    var _this = this;
    this.ledger = [];
    this.track = function(props){
        // Clone and modify the object
        var _props = angular.copy(props);
        _props.date = gameLoop.date;
        // Add to the ledger
        _this.ledger.push(_props);
    };
}]);