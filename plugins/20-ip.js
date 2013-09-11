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
    var ip      = obj['ip']
    var options = obj['options'] || ""

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
    // If the user set some options they might include a whitelist
    // or a blacklist.
    //
    var array = options.split( "," );

    //
    //  Look for "whitelist=IP"
    //
    //  Look for "blacklist=IP"
    //
    for (var i = 0; i < array.length; i++)
    {
        var option = array[i].trim()

        if ( option == "whitelist=" + ip )
        {
            ok( "Locally whitelisted IP, via options" );
            return;
        }
        if ( option == "blacklist=" + ip )
        {
            spam( "Locally blacklisted IP, via options" );
            return;
        }
    }



    //
    //  Is the IP whitelisted?
    //
    if ( fs.existsSync("/etc/whitelist.d/" + ip) )
    {
        ok( "OK: Locally whitelisted IP, globally." );
        return;
    }

    //
    //  Is the IP blacklisted?
    //
    if ( fs.existsSync("/etc/blacklist.d/" + ip) )
    {
        spam( "SPAM: Locally blacklisted IP, globally." );
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
