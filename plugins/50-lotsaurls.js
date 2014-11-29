exports.name    = function() {return "50-lotsaurls.js" ; };
exports.purpose = function() {return "Look for excessive numbers of HTTP links." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Reject submissions that contain too many URLs in the body.
//
exports.testJSON = function ( obj, spam, ok, next)
{
    //
    // Default to 10 links, which was the value we used
    // in the legacy API.
    //
    var max_urls = 10;

    //
    //  Get the data.
    //
    var options = obj['options'] || '';
    var comment = obj['comment'] || '';

    //
    // Split the options.
    //
    var array = options.split( "," );

    //
    //  Look for "max-links=XX"  in the options.
    //
    var reg = /^max-links=([0-9]+)$/;

    //
    //  Test each option in turn.
    //
    for (var i = 0; i < array.length; i++)
    {
        var option = array[i].trim()
        var match  = reg.exec( option );
        if ( match )
        {
            max_urls = match[1].trim()
        }
    }


    //
    //  Now we have an (updated) count we can count the
    // links in the body.
    //
    var found = comment.match(/https?:\/\//g);

    if ( found != null && ( found.length > max_urls ) )
    {
        spam( "Too many links, found " + found.length + " max is " + max_urls );
    }

    //
    //  We passed this plugin.
    //
    next("next");
};


