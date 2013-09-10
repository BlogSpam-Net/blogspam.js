//
// Stock methods.
//
exports.name    = function() {return "20-ip.js" ; };
exports.purpose = function() {return "Look for whitelisted/blacklisted IPs" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Test the IP the comment was submitted from.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip = obj['ip']

    //
    //  If we're missing an IP this is an error
    //
    if ( ! ip )
    {
        spam( "missing IP address" );
        return;
    }

    //
    //  If the IP is not IPv4 or IPv6 it is invalid.
    //
    var ipv4 = /^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$/;
    var ipv6 = /^([a-f0-9:]+)$/i;

    if ( ( !ipv6.exec( ip ) ) && ( ! ipv4.exec(ip ) ) )
    {
        spam( "Malformed IP address" );
        return;
    }

    //
    //  Is the IP whitelisted?
    //
    if ( fs.existsSync("/etc/whitelist.d/" + ip) )
    {
        ok( "OK: Locally whitelisted IP" );
        return;
    }

    //
    //  Is the IP blacklisted?
    //
    if ( fs.existsSync("/etc/blacklist.d/" + ip) )
    {
        spam( "SPAM: Locally blacklisted IP" );
        return;
    }

    //
    // OK no decision reached in this plugin.
    //
    next( "next" );
};


//
// Init method..
//
exports.init = function (  )
{
    fs = require('fs');
}
