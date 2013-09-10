exports.name    = function() {return "10-fail.js" ; };
exports.purpose = function() {return "Look for requests which are testing" ; };
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
            spam( "SPAM: Manually marked as spam, via options." );
        }
    }
    next("next");
};


