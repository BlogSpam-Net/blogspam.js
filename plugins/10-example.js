exports.name    = function() {return "10-example.js" ; };
exports.purpose = function() {return "Look for example-emails" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Test for an email address of the form foo@example.
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var email = obj['email'] || '';

    if ( /@example\./.test(email) )
    {
        spam( "Example domain " + email );
    }

    //
    // We passed this plugin.
    //
    next("next");
};


