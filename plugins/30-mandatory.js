exports.name    = function() {return "10-mandatory.js" ; };
exports.purpose = function() {return "Look for mandatory fields" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  As per the legacy API we look look for any mandatory fields we should
// expect - and fail on any that are missing.
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var options = obj['options'] || '';

    var array = options.split( "," );

    //
    //  Look for "mandatory=XX" in the options.
    //
    var reg = /^mandatory=(.*)$/;

    //
    for (var i = 0; i < array.length; i++)
    {
        var option = array[i].trim()

        //
        //  If we match on mandatory=(.*) then we
        // can see if we received that field.
        //
        //  If we didn't we're spam.
        //
        var match = reg.exec( option );
        if ( match )
        {
            var field = match[1].trim()

            var value = obj[field]
            if ( ! value )
            {
                spam( "SPAM: Missing the field marked as mandatory:" + field );
                return
            }
        }
    }

    //
    //  We passed this plugin.
    //
    next("next");
};


