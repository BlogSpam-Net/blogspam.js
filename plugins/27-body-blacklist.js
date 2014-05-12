//
// Stock methods.
//
exports.name    = function() {return "27-body-blacklist.js" ; };
exports.purpose = function() {return "Known-bad body-contents." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
// Blacklist any host which submits a known-bad subject.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip      = obj['ip']      || ""
    var comment = obj['comment'] || '';
    var redis   = obj['_redis']
    var config  = obj['_config']

    //
    // For each bad-body-token we've got.
    //
    config.body_blacklist.forEach(function(spam_str) {

        //
        // If we match..
        //
        if ( comment.match( new RegExp( spam_str, "i" ) ) )
        {
            //
            // Blacklist for 48 hours.
            //
            var res = "Blacklisted body-content";

            redis.set(    "blacklist-" + ip , res );
            redis.expire( "blacklist-" + ip , 60*60*48 );

            spam( res );
            return;
        }
    });

    next( "next" );
};

