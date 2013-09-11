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
    var ip   = obj['ip']   || ""

    //
    // We can only test IPv4 addresses
    //
    var ipv4  = /^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$/;
    var match = ipv4.exec( ip );
    if ( match )
    {
        var reversed = ip.split("." ).reverse().join( "." )
        ip = reversed + ".dnsbl.dronebl.org";

        console.log( "Looking for IP address for " + ip );

        dns.resolve4(ip, function (err, addresses) {
            if (err)
            {
                next("next");
            }
            else
            {
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
