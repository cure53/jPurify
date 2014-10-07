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
            if(typeof arguments[0] === 'string' || arguments[0].nodeName){
                arguments[0] = DOMPurify.sanitize(arguments[0]);
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
     *  + Exposes original method as elm.unsafeDomManip()
     */
    jQuery.fn.unsafeDomManip = jQuery.fn.domManip;
    jQuery.fn.domManip = function(){
        if(arguments && arguments[0]){
            for(var i in arguments[0]){
                arguments[0][i] = DOMPurify.sanitize(arguments[0][i]);
            }
        }
        jQuery.fn.unsafeDomManip.apply(this, arguments);
    };
    
    /**
     * Define a safe el.wrapAll method for jQuery
     * 
     * + Replaces elm.wrapAll()
     * + Protects elm.wrapAll()
     *            elm.wrap()
     *            elm.wrapInner()
     * + Exposes original method as elm.unsafeWrapAll()
     */
    jQuery.fn.unsafeWrapAll = jQuery.fn.wrapAll;
    jQuery.fn.wrapAll = function(){
        if(arguments && arguments[0]){
            if(typeof arguments[0] === 'string' || arguments[0].nodeName){
                arguments[0] = DOMPurify.sanitize(arguments[0]);
            }
        }
        jQuery.fn.unsafeWrapAll.apply(this, arguments);
    }; 
    
    /**
     * 
     */
    jQuery.unsafeParseHTML = jQuery.parseHTML;
    jQuery.parseHTML = function(){
        arguments[0] = DOMPurify.sanitize(arguments[0]);
        return jQuery.unsafeParseHTML.apply(this, arguments);
    };
})();