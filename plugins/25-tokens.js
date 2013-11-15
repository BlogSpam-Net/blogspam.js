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
    //  We passed this plugin.
    //
    next("next");
};


