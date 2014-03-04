
//
// Stock methods.
//
exports.name    = function() {return "37-name-blacklist.js" ; };
exports.purpose = function() {return "Known-bad names." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
// Blacklist any host which submits a known-bad name.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip     = obj['ip']      || ""
    var name   = obj['name']    || ""
    var redis  = obj['_redis']
    var config = obj['_config']

    //
    // For each bad-name.
    //
    config.name_blacklist.forEach(function(spam_str){
        if ( name.match( new RegExp( spam_str, "i" ) ) )
        {
            //
            // Blacklist for 48 hours.
            //
            var res = "Blacklisted name";

            redis.set(    "blacklist-" + ip , res );
            redis.expire( "blacklist-" + ip , 60*60*48 );

            spam( res );
            return;
        }
    });

    next( "next" );
};

