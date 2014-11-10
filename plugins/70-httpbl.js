//
// Stock methods.
//
exports.name    = function() {return "70-httpbl.js" ; };
exports.purpose = function() {return "Test IP of comment submitter against projecthoneypot.org." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Look for the submitters IP in a blacklist.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip    = obj['ip']   || ""
    var redis = obj['_redis']
    var dns   = require('dns');

    //
    // We can only test IPv4 addresses
    //
    var ipv4  = /^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$/;
    var match = ipv4.exec( ip );
    if ( match )
    {
        var reversed = ip.split("." ).reverse().join( "." )
        var key      = "keykeykeykey.";
        var lookup   = key + reversed + ".dnsbl.httpbl.org";

        //
        // Require the event-run-library
        //
        var uvrun = require( "uvrun" );

        //
        // These are updated in the callback.
        //
        var e;
        var a;

        //
        // Update the variables.
        //
        dns.resolve4(lookup, function (err, addresses) {
             e = err;
             a = addresses;
        });

        //
        // At this point we block/stall until the callback has
        // finished.
        //
        while( ( !e ) && ( !a ) ) {
            uvrun.runOnce();
        }

        if (e)
        {
            // error == No DNS result found.
            next("next");
        }
        else
        {
            //
            // Cache the result for two days.
            //
            redis.set( "blacklist-" + ip , "Listed in HTTP;bl" );
            redis.expire( "blacklist-" + ip , 60*60*48 );

            //
            // Return the result.
            //
            spam( "Listed in HTTP;bl" );
        }
    }
    else
    {
        next( "next" );
    }

};
