exports.name    = function() {return "20-ip.js" ; };
exports.purpose = function() {return "Look for blacklisted IPs" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Test the IP the comment came-from.
//
//  We have a directory of blacklisted IPs.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip = obj['ip']

    //
    // TODO: Test the IP is an IP: /^\d\.\d+\.d+.\d+$/
    //
    // TODO: Check for more than the local blacklist:
    //
    //        1. /etc/whitelist.d/$ip
    //
    //        2. Check for the parent /24 too.
    //
    //        3. Handle IPv6.
    //
    if ( ip && (fs.existsSync("/etc/blacklist.d/" + ip)) )
    {
        spam( "SPAM: Locally blacklisted IP" );
    }
    next( "next" );
};


//
// Init method..
//
exports.init = function (  )
{
    fs = require('fs');
}
