(function() {
    'use strict';

    /**
     * Specify DOMPurify config options
     */
    var config = { SAFE_FOR_JQUERY : true };

    /**
     * Specify jPurify version
     */
    var version = '0.3';
    
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
    var sanitize = function(args, index) {
        // handle pure string argument
        if (typeof args === 'string') {
            if(!uncritical.test(args)) {
                args = DOMPurify.sanitize('#' + args, config).slice(1);
            }
        // handle wrapped object arguments
        } else if (typeof args === 'object'
            && typeof args[index] !== 'undefined'
            && typeof args[index].nodeName === 'string') {
            if(!uncritical.test(args[index].outerHTML)) {
                args = $(DOMPurify.sanitize(args[index].outerHTML, config));
            }

        // handle string array argument
        } else if (typeof args === 'object'
            && typeof args[index] === 'string') {
            if (!uncritical.test(args)) {
                args[index] = DOMPurify.sanitize(
                    '#'+args[index], config).slice(1);
            }
        // handle function argument
        } else if (typeof args === 'object'
            && typeof args[index] === 'function') {

            // wrap function argument and sanitize return value
            var original = args[index],
            wrapper  = function() {
                return DOMPurify.sanitize(original.apply(this, args));
            };
            args[index] = wrapper;
        }
        return args;
    };

    /**
     * Sanitize attribute keys and value
     *
     * This method does the sanitation for attr() and prop() and makes
     * sure that HTML, malicious URI handlers and events get filtered
     *
     * @param   data to sanitize
     */
    var sanitizeAttr = function(args) {
        // disallow assigning of event handlers using elm.attr()
        if (/^\W*on/i.test(args[0])) {
            return false;
        }
        // detect and remove dangerous URI handlers
        if (/\W/.test(args[1])) {
            var regex = /^(\w+script|data):/gi,
            whitespace = /[\x00-\x20\xA0\u1680\u180E\u2000-\u2029\u205f\u3000]/g;
            if (args[1].replace(whitespace,'').match(regex)) {
                return false;
            }
        }
        // sanitize argument value in any case
        args[1] = DOMPurify.sanitize(args[1], config);

        return args;
    };

    /**
     * Define a safe elm.html() method for jQuery
     *
     * + Replaces elm.html()
     * + Exposes original method as elm.unsafeHtml()
     */
    jQuery.fn.unsafeHtml = jQuery.fn.html;
    jQuery.fn.html = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args && args[0]) {
            args = sanitize(args, 0);
        }
        return jQuery.fn.unsafeHtml.apply(this, args);
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
    jQuery.fn.domManip = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args && args[0]) {
            // we have to go over all fields in args[0]
            for (var i in args[0]) {
                var element = args[0][i];
                args[0][i] = sanitize(element, 0);
            }
        }
        return jQuery.fn.unsafeDomManip.apply(this, args);
    };

    /**
     * Define a safe parseHTML() method for jQuery
     *
     * + Protects jQ.parseHTML()
     * + Exposes original method as jQ.unsafeParseHTML
     */
    jQuery.unsafeParseHTML = jQuery.parseHTML;
    jQuery.parseHTML = function() {
        var args = Array.prototype.slice.call(arguments);
        // we simply need to sanitize the string input
        args[0] = sanitize(args[0]);
        if (!args[0]) { return false; }
        return jQuery.unsafeParseHTML.apply(this, args);
    };

    /**
     * Define a safe clean() method for jQuery
     *
     * + Protects jQ.clean()
     * + Exposes original method as jQ.clean
     */
    jQuery.unsafeClean = jQuery.clean;
    jQuery.clean = function() {
        var args = Array.prototype.slice.call(arguments);
        args[0] = sanitize(args[0], 0);
        if (!args[0]) { return false; }
        return jQuery.unsafeClean.apply(this, args);
    };

    /**
     * Define a safe elm.attr() method for jQuery
     *
     * + Protects elm.attr() from XSS
     * + Exposes original method as elm.unsafeAttr()
     */
    jQuery.fn.unsafeAttr = jQuery.fn.attr;
    jQuery.fn.attr = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args.length > 1) {
            args = sanitizeAttr(args);
            if (!args) { return false; }
        }
        return jQuery.fn.unsafeAttr.apply(this, args);
    };

    /**
     * Define a safe elm.prop() method for jQuery
     *
     * + Protects elm.prop() from XSS
     * + Exposes original method as elm.unsafeProp()
     */
    jQuery.fn.unsafeProp = jQuery.fn.prop;
    jQuery.fn.prop = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args.length > 1) {
            args = sanitizeAttr(args);
            if (!args) { return false; }
        }
        return jQuery.fn.unsafeProp.apply(this, args);
    };
    /**
     * To support newer version of jQuery
     *
     */
    // Protects append()
    // Exposes original method unsafe_append()
    jQuery.fn.unsafe_append = jQuery.fn.append;
    jQuery.fn.append = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args && args[0] && typeof args[0] === 'string') {
                args[0]= sanitize(args[0]);
            }
        return jQuery.fn.unsafe_append.apply(this, args);
    };
    // Protects prepend()
    // Exposes original method unsafe_prepend()
    jQuery.fn.unsafe_prepend = jQuery.fn.prepend;
    jQuery.fn.prepend = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args && args[0] && typeof args[0] === 'string') {
                args[0]= sanitize(args[0]);
            }
        return jQuery.fn.unsafe_prepend.apply(this, args);
    };
    // Protects before()
    // Exposes original method unsafe_before()
    jQuery.fn.unsafe_before = jQuery.fn.before;
    jQuery.fn.before = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args && args[0] && typeof args[0] === 'string') {
                args[0]= sanitize(args[0]);
            }
        return jQuery.fn.unsafe_before.apply(this, args);
    };
    // Protects after()
    // Exposes original method unsafe_after()
    jQuery.fn.unsafe_after = jQuery.fn.after;
    jQuery.fn.after = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args && args[0] && typeof args[0] === 'string') {
                args[0]= sanitize(args[0]);
            }
        return jQuery.fn.unsafe_after.apply(this, args);
    };
    // Protects wrap()
    // Exposes original method unsafe_wrap()
    jQuery.fn.unsafe_wrap = jQuery.fn.wrap;
    jQuery.fn.wrap = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args && args[0] && typeof args[0] === 'string') {
                args[0]= sanitize(args[0]);
            }
        return jQuery.fn.unsafe_wrap.apply(this, args);
    };
    // Protects wrapInner()
    // Exposes original method unsafe_wrapInner()
    jQuery.fn.unsafe_wrapInner = jQuery.fn.wrapInner;
    jQuery.fn.wrapInner = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args && args[0] && typeof args[0] === 'string') {
                args[0]= sanitize(args[0]);
            }
        return jQuery.fn.unsafe_wrapInner.apply(this, args);
    };
    // Protects wrapAll()
    // Exposes original method unsafe_wrapAll()
    jQuery.fn.unsafe_wrapAll = jQuery.fn.wrapAll;
    jQuery.fn.wrapAll = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args && args[0] && typeof args[0] === 'string') {
                args[0]= sanitize(args[0]);
            }
        return jQuery.fn.unsafe_wrapAll.apply(this, args);
    };
})();