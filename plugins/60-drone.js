//
// Stock methods.
//
exports.name    = function() {return "60-drone.js" ; };
exports.purpose = function() {return "Test IP of comment submitter against dronebl.org " ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Look for the submitters IP in a blacklist.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip    = obj['ip']   || ""
    var redis = obj['_redis']

    //
    // We can only test IPv4 addresses
    //
    var ipv4  = /^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$/;
    var match = ipv4.exec( ip );
    if ( match )
    {
        var reversed = ip.split("." ).reverse().join( "." )
        var lookup   = reversed + ".dnsbl.dronebl.org";

        console.log( "Looking for IP address for " + lookup );

        dns.resolve4(lookup, function (err, addresses) {
            if (err)
            {
                next("next");
            }
            else
            {
                //
                // Cache the result for two days.
                //
                redis.set( "blacklist-" + ip , "Listed in dronebl.org" );
                redis.expire( "blacklist-" + ip , 60*60*48 );

                //
                // Return the result.
                //
                spam( "Listed in dronebl.org" );
            }
        });
    }
    else
    {
        next( "next" );
    }

};


//
// Init method..
//
exports.init = function (  )
{
    dns = require('dns');
}
