(function(){
    /**
     * Define a safe elm.html() method for jQuery
     * 
     * + Replaces elm.html()
     * + Exposes original method as elm.unsafeHtml()
     */
    jQuery.fn.unsafeHtml = jQuery.fn.html;
    jQuery.fn.html = function(){
        if(arguments && arguments[0]){
            
            // handle string argument
            if(typeof arguments[0] === 'string'){
                arguments[0] = DOMPurify.sanitize(arguments[0]);
            
            // handle DOM node argument
            } else if(arguments[0].nodeName){
                arguments[0] = $(DOMPurify.sanitize(arguments[0].outerHTML));
                
            // handle function argument
            } else if(typeof arguments[0] === 'function'){
                
                // wrap function argument and sanitize return value
                var original = arguments[0],
                wrapper  = function(){
                    return DOMPurify.sanitize(original.apply(this, arguments));
                }
                arguments[0] = wrapper;
            }
        }
        jQuery.fn.unsafeHtml.apply(this, arguments);
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
                
                // handle wrapped object arguments
                if(element[0] && typeof element[0].nodeName === 'string'){
                    arguments[0][i] = $(DOMPurify.sanitize(element[0].outerHTML));
                
                // handle string arguments
                } else if(element[0] && typeof element === 'string') {
                    arguments[0][i] = DOMPurify.sanitize(element);

                // handle function argument
                } else if(typeof element[0] === 'function'){
                    
                    // wrap function argument and sanitize return value
                    var original = element[0],
                    wrapper  = function(){
                        return DOMPurify.sanitize(original.apply(this, arguments));
                    }
                    arguments[0][i] = wrapper;
                }
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
        arguments[0] = DOMPurify.sanitize(arguments[0]);
        return jQuery.unsafeParseHTML.apply(this, arguments);
    };
    
    /**
     * Define a safe elm.attr() method for jQuery
     * 
     * + Protects elm.attr() from XSS
     * + Exposes original method as elm.unsafeAttr()
     */
    jQuery.fn.unsafeAttr = jQuery.fn.attr;
    jQuery.fn.attr = function(){
        if(arguments.length > 1){
            
            // disallow assigning of event handlers using elm.attr()
            if(/^\W*on/.test(arguments[0])){
                return false;
            }
            // detect and remove dangerous URI handlers
            if(/\W/.test(arguments[1])) {
                var regex = /^(\w+script|data):/gi,
                whitespace = /[\x00-\x20\xA0\u1680\u180E\u2000-\u2029\u205f\u3000]/g;
                if(arguments[1].replace(whitespace,'').match(regex)){
                    return false;    
                }
            }
        }
        return jQuery.fn.unsafeAttr.apply(this, arguments);
    }
})();