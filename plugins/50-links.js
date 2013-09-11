exports.name    = function() {return "50-links.js" ; };
exports.purpose = function() {return "Look for excessive HTTP links" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var options = obj['options'] || '';
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
    //  Test each one
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
            var max = match[1].trim()

            //
            //  So we have a max-links count.  We need to count the links
            //
            var found = comment.match(/http:\/\//g);

            if ( found.length > max )
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


