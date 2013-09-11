exports.name    = function() {return "05-logger.js" ; };
exports.purpose = function() {return "Log the most recent submissions." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
// Using our redis database keep a rotating buffer of the most recent 100 comments.
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var redis = obj['_redis']

    //
    // Create a copy of the object, for serializing.
    //
    var copy = {};

    for (var key in obj) {
        if ( key != "_redis" )
        {
            copy[key]=obj[key];
        }
    }

    //
    // Store the comment.
    //
    redis.lpush( "recent-comments", JSON.stringify(copy));

    //
    // Trim our list to the most recent 100 entries.
    //
    redis.ltrim( "recent-comments", 0, 100 );

    //
    //  We passed this plugin, because we didn't test anything.  Oops.
    //
    next("next");
};


