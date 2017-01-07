(function(){
    angular.module('fateful')
    .animation('.slideInOut', [function() {
        return {
            enter: function(element, doneFn) {
                jQuery(element)
                    .css('display', 'none')
                    .slideDown(200, doneFn);
            },
            leave: function(element, doneFn) {
                jQuery(element)
                    .slideUp(200, doneFn);
            }
        };
    }]);
})();