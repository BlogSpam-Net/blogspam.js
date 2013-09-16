exports.name    = function() {return "00-fail.js" ; };
exports.purpose = function() {return "Look for testing-requests, which should always fail." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  As per the legacy API we look for a submission
// which has "fail" in its options.
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var options = obj['options'] || '';

    var array = options.split( "," );

    //
    //  Look for "fail"
    //
    for (var i = 0; i < array.length; i++)
    {
        var option = array[i].trim()

        if ( option == "fail" )
        {
            spam( "Manually marked as spam, via options." );
        }
    }

    //
    //  We passed this plugin.
    //
    next("next");
};


