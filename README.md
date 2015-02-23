**Warning: This tool is still very young. Please file bugs if you find any!**

# jPurify

jPurify is a plugin that automatically adds XSS-safety to jQuery. The reason why we do that is jQuery's lack of DOMXSS protection. We wanted to create a jQuery plugin, that adds super-easy-to-use and fully automatic HTML sanitation to the whole jQuery API. jPurify has been tested with jQuery 1.11.1 and 2.1.1. It's known to work well down until jQuery 1.5.2.

jPurify is maintained by the same people that look after [DOMPurify](https://github.com/cure53/DOMPurify). It works in all modern browsers (Safari, Opera (15+), Internet Explorer (10+), Firefox and Chrome - as well as almost anything else using Blink or WebKit). It doesn't break on IE6 or other legacy browsers. It simply does nothing there.

## What does it do?

jPurify, once included, simply overwrites some security-critical jQuery methods and adds proper HTML sanitation. Let's have a look at an example to clarify ([here's a small live-demo](http://cure53.de/jpurify/#%3Cimg%20src=x%20onerror=alert%281%29%3E)):

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

jQuery has crazy lots of XSS sinks and developers need to make sure that none is hit by user generated content. The more complex a website the harder that gets of course. That's where jPurify jumps in. We currently cover the following XSS sinks and sanitize them with DOMPurify:

* `$() // $('<svg onload=alert(1)>')`
* `$.parseHTML() // $.parseHTML('<svg onload=alert(1)>')`
* `constructor() // $('body').constructor('<svg onload=alert(1)>')`
* `has() // $('body').has('<svg onload=alert(1)>')`
* `init() // $('body').init('<svg onload=alert(1)>')`
* [`add() // $('body').add('#<svg onload=alert(1)>')`](http://api.jquery.com/add/)
* [`index() // $('body').index('<svg onload=alert(1)>')`](http://api.jquery.com/index/)
* [`wrapAll() // $('body').wrapAll('<svg onload=alert(1)>')`](http://api.jquery.com/wrapAll/)
* [`wrapInner() // $('body').wrapInner('<svg onload=alert(1)>')`](http://api.jquery.com/wrapInner/)
* [`wrap() // $('body').wrap('<svg onload=alert(1)>')`](http://api.jquery.com/wrap/)
* [`append() // $('body').append('<svg onload=alert(1)>')`](http://api.jquery.com/append/)
* [`prepend() // $('body').prepend('<svg onload=alert(1)>')`](http://api.jquery.com/prepend/)
* [`before() // $('body').before('<svg onload=alert(1)>')`](http://api.jquery.com/before/)
* [`after() // $('body').after('<svg onload=alert(1)>')`](http://api.jquery.com/after/)
* [`html() // $('body').html('<svg onload=alert(1)>')`](http://api.jquery.com/html/)
* [`replaceWith() // $('body').replaceWith('<svg onload=alert(1)>')`](http://api.jquery.com/replaceWith/)
* [`appendTo() // $('body').appendTo('<svg onload=alert(1)>')`](http://api.jquery.com/appendTo/)
* [`prependTo() // $('body').prependTo('<svg onload=alert(1)>')`](http://api.jquery.com/prependTo/)
* [`insertBefore() // $('body').insertBefore('<svg onload=alert(1)>')`](http://api.jquery.com/insertBefore/)
* [`insertAfter() // $('body').insertAfter('<svg onload=alert(1)>')`](http://api.jquery.com/insertAfter/)
* [`replaceAll() // $('body').replaceAll('<svg onload=alert(1)>')`](http://api.jquery.com/replaceAll/)
* [`attr() // $('body').attr('onclick', 'alert(1)')`](http://api.jquery.com/attr/)
* [`attr() // $('a').attr('href', 'javascript:alert(1)')`](http://api.jquery.com/attr/)
* [`prop() // $('body').prop('innerHTML','<svg onload=alert(1)>')`](http://api.jquery.com/prop/)

## I think it sucks!

That's amazing! Please write ticket and tell us what's the problem. Too slow? Found a bypass? Don't like the indentation? Do let us know.

## Credits

Thanks [@insertScript](https://twitter.com/insertScript) and [@avlidienbrunn](https://twitter.com/avlidienbrunn) for finding and reporting bypasses in the prototype version!
