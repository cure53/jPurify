**Warning: Don't use this software yet. It's still in experimental stages**

# jPurify

jPurify is a plugin that automatically adds XSS-safety to jQuery. The reason why we do that is jQuery's lack of DOMXSS protection. We wanted to create a jQuery plugin, that adds super-easy-to-use and fully automatic HTML sanitation to the whole jQuery API. jPurify has been tested with jQuery 1.11.1 and 2.1.1.

jPurify is maintained by the same people that look after [DOMPurify](https://github.com/cure53/DOMPurify). It works in all modern browsers (Safari, Opera (15+), Internet Explorer (9+), Firefox and Chrome - as well as almost anything else using Blink or WebKit)

## What does it do?

jPurify, once included, simply overwrites some security-critical jQuery methods and adds proper HTML sanitation. Let's have a look at an example to clarify:

```html
<html>
    <head>
        <script src="jquery.js"></script>
    </head>
    <body>
        <div id="html"></div>
        <script>
            // location.hash could be <svg/onload=alert(domain)>
            $('#html').html('<h1>'+location.hash+'</h1>');
        </script>
    </body>
</html>

```

This code shown above is vulnerable to XSS. An attacker can influence `location.hash` to contain evil HTML and then attack your website's users. Not nice. Now let's have a look at what jPurify accomplishes:

```html
<html>
    <head>
        <script src="jquery.js"></script>
        
        <!-- makes the code below be secure -->
        <script src="purify.js"></script>
        <script src="jpurify.js"></script>
    </head>
    <body>
        <div id="html"></div>
        <script>
            // location.hash could be <svg/onload=alert(domain)>
            $('#html').html('<h1>'+location.hash+'</h1>');
        </script>
    </body>
</html>

```

Now, the XSS attack is being blocked. jPurify inspects and sanitizes the arguments sent to the vulnerable methods. The bad stuff is being removed, the good stuff is left intact, happy times.

## How do I use it?

It's easy. Just include DOMPurify **and** jPurify on your website. It will seamlessly plug into jQuery and sanitize any potentially dangerous DOM-transaction.

```html
<script type="text/javascript" src="purify.js"></script>
<script type="text/javascript" src="jpurify.js"></script>
```

## What XSS sinks are covered?

We currently cover the following XSS sinks and sanitize them with DOMPurify:

* [`add()`](http://api.jquery.com/add/)
* `constructor()`
* `has()`
* `init()`
* [`index()`](http://api.jquery.com/index/)
* [`wrapAll()`](http://api.jquery.com/wrapAll/)
* [`wrapInner()`](http://api.jquery.com/wrapInner/)
* [`wrap()`](http://api.jquery.com/wrap/)
* [`append()`](http://api.jquery.com/append/)
* [`prepend()`](http://api.jquery.com/prepend/)
* [`before()`](http://api.jquery.com/before/)
* [`after()`](http://api.jquery.com/after/)
* [`html()`](http://api.jquery.com/html/)
* [`replaceWith()`](http://api.jquery.com/replaceWith/)
* [`appendTo()`](http://api.jquery.com/appendTo/)
* [`prependTo()`](http://api.jquery.com/prependTo/)
* [`insertBefore()`](http://api.jquery.com/insertBefore/)
* [`insertAfter()`](http://api.jquery.com/insertAfter/)
* [`replaceAll()`](http://api.jquery.com/replaceAll/)
