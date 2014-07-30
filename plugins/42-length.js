exports.name    = function() {return "42-length.js" ; };
exports.purpose = function() {return "Look at the size of the subject and name." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  As per the legacy API we look look for any constraints on the size of the
// body - either min-size or max-size.
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var subj = obj['subject'] || "";
    var name = obj['name']  || "";
    var max  = 140;

    console.log( "Name is " + name.length + " characters long: " + name )
    console.log( "Subj is " + subj.length + " characters long: " + subj  )

    if ( name.length >= max )
    {
        spam( "The submitted 'name' was too long." );
        return
    }
    if ( subj.length >= max )
    {
        spam( "The submitted 'subject' was too long." );
        return
    }

    //
    //  We passed this plugin.
    //
    next("next");
};


