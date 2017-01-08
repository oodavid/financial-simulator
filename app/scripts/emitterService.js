'use strict';
/** EMITTER - SERVICE
 *
 *      The emitter
 *
 *      @author   David 'oodavid' King
 */
(function(){
    angular.module('fateful')
    .service('emitterService', [function(){
        this.addLogicTo = function(obj){
            var callbacks = {};
            var id = 0;
            obj.on = function(name, callback){
                id ++;
                if(!callbacks[name]){
                    callbacks[name] = {};
                }
                callbacks[name][id] = callback;
                return { name: name, id: id };
            };
            obj.off = function(task){
                delete callbacks[task.name][task.id];
            };
            obj.one = function(name, callback){
                var task = obj.on(name, function(){
                    callback.apply(this);
                    obj.off(task);
                });
            };
            obj.trigger = function(name){
                for (var callback in callbacks[name]) {
                    if(callbacks[name].hasOwnProperty(callback)){
                        callbacks[name][callback].apply(this);
                    }
                }
            };
        };
    }]);
})();