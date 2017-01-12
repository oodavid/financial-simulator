'use strict';
/** LEDGER - SERVICE
 *
 *      The ledger allows various objects (loans, salary, assets etc.)
 *       to record changes in the financial status of the user.
 *
 *      @author   David 'oodavid' King
 */
(function(){
    angular.module('fateful')
    .service('ledgerService', ['gameLoop', function(gameLoop){
        var _this = this;
        this.balance = 0;
        this.ledger = [];
        this.track = function(type, name, value){
            if(value){
                var IN  = value > 0 ?  value : null;
                var OUT = value < 0 ? -value : null;
                this.balance += value;
                var props = {
                    date: gameLoop.date,
                    type: type,
                    name: name,
                    in: IN,
                    out: OUT,
                    balance: this.balance,
                }
                // Add to the ledger
                _this.ledger.push(props);
            }
        };
    }]);
})();