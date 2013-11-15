//
//  This is designed to catch comments of the form:
//
//    FOO QH9vOA http://www.MHyzKpN7h4ERauvS72jUbdI0HeKxuZom.com
//


exports.name    = function() {return "25-tokens.js" ; };
exports.purpose = function() {return "Block comments with unduly-long words/tokens." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Look for long words/tokens.
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var comment = obj['comment'] || '';

    //
    // Split.
    //
    var array = comment.match(/[^\s]+/g);

    var max = 0;
    var str = "";

    for( var i = 0; i < array.length; ++i ) {
        var s = array[i];
        var l = array[i].length;

        //
        //  If this is the longest string, then we store it.
        //
        if ( l > max ) {
            max = l;
            str = s;
        }
    }

    //
    // If the token is too long ..
    //
    if ( max >= 40 )
    {
        spam( "Single-word too long: '" + str + "'" );
    }
    else
    {
        //
        //  We passed this plugin.
        //
        next("next");
    }
};


