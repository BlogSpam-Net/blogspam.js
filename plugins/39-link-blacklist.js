
//
// Stock methods.
//
exports.name    = function() {return "39-link-blacklist.js" ; };
exports.purpose = function() {return "Known-bad links." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
// Blacklist any host which submits a known-bad link
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip     = obj['ip']      || ""
    var link   = obj['link']    || ""
    var redis  = obj['_redis']
    var config = obj['_config']

    //
    // Strip leading/trailing space.
    //
    link = link.trim();

    //
    // For each bad-name.
    //
    config.link_blacklist.forEach(function(spam_str){
        if ( link.match( new RegExp( spam_str, "i" ) ) )
        {
            //
            // Blacklist for 48 hours.
            //
            var res = "Blacklisted Link: field";

            redis.set(    "blacklist-" + ip , res );
            redis.expire( "blacklist-" + ip , 60*60*48 );

            spam( res );
            return;
        }
    });

    next( "next" );
};

