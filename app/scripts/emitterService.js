'use strict';
/** EMITTER - SERVICE
 *
 *      The emitter service allows any object to become an emitter.
 *
 *      Usage:
 *
 *          var o = function(){
 *              emitterService.addEmitterLogicTo(this);
 *              setTimeout(function(){
 *                  this.trigger('someEvent', 1, 2, 3);
 *              }, 1000);
 *              return this;
 *          }();
 *          o.on('someEvent', function(a, b, c){
 *              console.log(a, b, c);
 *          });
 *
 *      Notes:
 *
 *          I'm not completely happy with the method naming here.
 *           `addEmitterLogicTo` feels clunky. I'd like to use
 *           prototypical inheritance, but it doesn't gel with our
 *           existing AngularJS code.
 *
 *      @author   David 'oodavid' King
 */
(function(){
    angular.module('fateful')
    .service('emitterService', [function(){
        this.addEmitterLogicTo = function(obj){
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
                // Applies the callback removes itself from the callback list
                var task = obj.on(name, function(){
                    callback.apply(this, arguments);
                    obj.off(task);
                });
            };
            obj.trigger = function(name /* all additional arguments are passed to the callback */){
                // Convert the arguments {object} into an array that we can use with `apply`
                var args = [];
                for(var i=1, il=arguments.length; i<il; i++){ // I'm intentionally skipping the first argument, which is `name`
                    args.push(arguments[i]);
                }
                // Trigger callbacks
                for (var callback in callbacks[name]) {
                    if(callbacks[name].hasOwnProperty(callback)){
                        callbacks[name][callback].apply(this, args);
                    }
                }
            };
        };
    }]);
})();