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
    var options = obj['options'] || 'max-links=10';
    var comment = obj['comment'] || '';

    //
    // Split the options.
    //
    var array = options.split( "," );

    //
    //  Look for "max-links=XX"  in the options.
    //
    var reg = /^max-links=(.*)$/;

    //
    //  Test each option in turn.
    //
    for (var i = 0; i < array.length; i++)
    {
        var option = array[i].trim()

        //
        //  If we match then we can compare the size.
        //
        var match = reg.exec( option );
        if ( match )
        {
            //
            // The count.
            //
            var max = match[1].trim()

            //
            //  So we have a max-links count.  We need to count the links
            //
            var found = comment.match(/https?:\/\//g);

            if ( found != null && ( found.length > max ) )
            {
                spam( "Too many links, found " + found.length + " max is " + max );
            }
        }
    }

    //
    //  We passed this plugin.
    //
    next("next");
};


