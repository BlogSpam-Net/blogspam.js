exports.name    = function() {return "99-last.js" ; };
exports.purpose = function() {return "Return OK since nothing else blocked us" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  This is the last plugin, if nothing previously has rejected
//  the comment then this is where we allow it.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    ok( "OK" );
};

