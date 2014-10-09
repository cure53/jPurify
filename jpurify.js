(function(){
    
    /**
     * Specify DOMPurify config options
     */
    var config = {SAFE_FOR_JQUERY : true}
    
    /**
     * Specify regex for uncritical data detection
     */
    var uncritical = /(^[-\w]*$)|(^<\w+>$)/;
    
    /**
     * Sanitize incoming data and index. 
     * 
     * In essence, this method checks the type of the arguments 
     * and decides what way of sanitizing is the right one.
     * 
     * @param   data to sanitize
     * @param   index to access
     */
    var sanitize = function(args, index){
        
        // handle pure string argument
        if(typeof args === 'string'){
            if(!uncritical.test(args)){
                args = DOMPurify.sanitize('#'+args, config).slice(1);
            }
        // handle wrapped object arguments
        } else if(typeof args === 'object' 
            && typeof args[index].nodeName === 'string'){
            if(!uncritical.test(args[index].outerHTML)){
                args = $(DOMPurify.sanitize(args[index].outerHTML, config));
            }            
            
        // handle string array argument
        } else if(typeof args === 'object' 
            && typeof args[index] === 'string'){
            if(!uncritical.test(args)){
                args[index] = DOMPurify.sanitize(
                    '#'+args[index], config).slice(1);
            }
        // handle function argument
        } else if(typeof args === 'object' 
            && typeof args[index] === 'function'){
            
            // wrap function argument and sanitize return value
            var original = args[index],
            wrapper  = function(){
                return DOMPurify.sanitize(original.apply(this, args));
            }
            args[index] = wrapper;
        }
        return args;        
    }
    
    /**
     * Sanitize attribute keys and value
     * 
     * This method does the sanitation for attr() and prop() and makes 
     * sure that HTML, malicious URI handlers and events get filtered
     * 
     * @param   data to sanitize
     */
    var sanitizeAttr = function(args){
        
        // disallow assigning of event handlers using elm.attr()
        if(/^\W*on/i.test(args[0])){
            return false;
        }
        // detect and remove dangerous URI handlers
        if(/\W/.test(args[1])) {
            var regex = /^(\w+script|data):/gi,
            whitespace = /[\x00-\x20\xA0\u1680\u180E\u2000-\u2029\u205f\u3000]/g;
            if(args[1].replace(whitespace,'').match(regex)){
                return false;    
            }
        }
        // sanitize argument value in any case
        args[1] = DOMPurify.sanitize(args[1], config);        
        
        return args;
    }
    
    /**
     * Define a safe elm.html() method for jQuery
     * 
     * + Replaces elm.html()
     * + Exposes original method as elm.unsafeHtml()
     */
    jQuery.fn.unsafeHtml = jQuery.fn.html;
    jQuery.fn.html = function(){
        if(arguments && arguments[0]){
            arguments = sanitize(arguments, 0);
        }
        return jQuery.fn.unsafeHtml.apply(this, arguments);
    };
    
    /**
     * Define a safe elm.domManip() method for jQuery
     * 
     * + Replaces elm.domManip()
     * + Protects elm.append()
     *            elm.prepend()
     *            elm.before()
     *            elm.after()
     *            elm.wrap()
     *            elm.wrapInner()
     *            elm.wrapAll()
     *  + Exposes original method as elm.unsafeDomManip()
     */
    jQuery.fn.unsafeDomManip = jQuery.fn.domManip;
    jQuery.fn.domManip = function(){
        if(arguments && arguments[0]){
            
            // we have to go over all fields in arguments[0]
            for(var i in arguments[0]){
                var element = arguments[0][i];
                arguments[0][i] = sanitize(element, 0);
            }
        }
        return jQuery.fn.unsafeDomManip.apply(this, arguments);
    };
    
    /**
     * Define a safe parseHTML() method for jQuery
     * 
     * + Protects jQ.parseHTML()
     * + Exposes original method as jQ.unsafeParseHTML
     */
    jQuery.unsafeParseHTML = jQuery.parseHTML;
    jQuery.parseHTML = function(){
        
        // we simply need to sanitize the string input
        arguments[0] = sanitize(arguments[0]);
        if(!arguments[0]){
            return false;
        }
        return jQuery.unsafeParseHTML.apply(this, arguments);
    };
    
    /**
     * TODO de-duplicate the code
     */
    jQuery.unsafeBuildFragment = jQuery.buildFragment;
    jQuery.buildFragment = function(){
        arguments[0] = sanitize(arguments[0], 0);
        if(!arguments[0]){
            return false;
        }        
        return jQuery.unsafeBuildFragment.apply(this, arguments);
    }
    
    /**
     * Define a safe elm.attr() method for jQuery
     * 
     * + Protects elm.attr() from XSS
     * + Exposes original method as elm.unsafeAttr()
     */
    jQuery.fn.unsafeAttr = jQuery.fn.attr;
    jQuery.fn.attr = function(){
        if(arguments.length > 1){
            arguments = sanitizeAttr(arguments);
            if(!arguments) {
                return false;
            }
        }
        return jQuery.fn.unsafeAttr.apply(this, arguments);
    }
    
    /**
     * Define a safe elm.prop() method for jQuery
     * 
     * + Protects elm.prop() from XSS
     * + Exposes original method as elm.unsafeProp()
     */
    jQuery.fn.unsafeProp = jQuery.fn.prop;
    jQuery.fn.prop = function(){
        if(arguments.length > 1){
            arguments = sanitizeAttr(arguments);
            if(!arguments) {
                return false;
            }
        }
        return jQuery.fn.unsafeProp.apply(this, arguments);
    }    
})();