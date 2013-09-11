exports.name    = function() {return "40-size.js" ; };
exports.purpose = function() {return "Look at the size of the body" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  As per the legacy API we look look for any constraints on the size of the
// body - either min-size or max-size.
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
    //  Look for "min-size=XX" and "max-size=XX" in the options.
    //
    var reg = /^(min-size|max-size)=(.*)$/;

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
            var type = match[1].trim()
            var size = match[2].trim()

            if ( ( type == "min-size" ) &&
                 ( comment.length < size ) )
            {
                spam( "The comment was too short." );
                return
            }

            if ( ( type == "max-size" ) &&
                 ( comment.length > size ) )
            {
                spam( "The comment was too long." );
                return
            }
        }
    }

    //
    //  We passed this plugin.
    //
    next("next");
};


