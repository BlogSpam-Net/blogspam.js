exports.name    = function() {return "42-length.js" ; };
exports.purpose = function() {return "Look at the size of the subject and name." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
// Report if the submitted name/subject was too long.
//
exports.testJSON = function ( obj, spam, ok, next)
{
    //
    //  Get the data
    //
    var subj = obj['subject'] || "";
    var name = obj['name']    || "";

    //
    //  Max length: TODO - Make this configurable.
    //
    var max  = 140;


    //
    //  Drop long-submissions.
    //
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


