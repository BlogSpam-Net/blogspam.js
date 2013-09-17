//
// Stock methods.
//
exports.name    = function() {return "15-per-site-blacklist.js" ; };
exports.purpose = function() {return "Look for blacklisted IPs, on a per-site basis." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
// Look for a per-site blacklist, as updated by our
// classifier.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip    = obj['ip']
    var site  = obj['site'];
    var redis = obj['_redis'];


    //
    //  If we're missing a site we're done.
    //
    if ( ! site )
    {
        next( "missing IP address" );
        return;
    }

    //
    //  The key we lookup
    //
    var key = "blacklist-" + site + "-" + ip;


    redis.get( key , function (err, reply) {
        if ( reply ) {
            spam( reply );
        }
        else {
            next("next");
        }
    });
}

