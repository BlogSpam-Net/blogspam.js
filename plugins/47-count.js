exports.name    = function() {return "47-count.js" ; };
exports.purpose = function() {return "Block counted comments." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  As per the legacy API we look look for any constraints on the size of the
// body - either min-size or max-size.
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var comment = obj['comment'] || '';
    var redis   = obj['_redis'];
    var ip      = obj['ip']      || "";


    //
    //  Look for a given prefix.
    //
    var reg = /^comment([0-9]+)/;

    //
    //  Strip any prefix.
    //
    comment = comment.replace(/^([\r\n ]+)/gm,"");

    //
    // Did we match?
    //
    var match = reg.exec( comment );
    if ( match )
    {
        var entry = "The comment matched our comment-pattern..";

        //
        // Blacklist for 48 hours.
        //
        var res = "Domain is blacklisted: " + entry;
        redis.set(    "blacklist-" + ip , res );
        redis.expire( "blacklist-" + ip , 60*60*48 );

        spam( entry );
        return;
    }

    //
    //  We passed this plugin.
    //
    next("next");
};


