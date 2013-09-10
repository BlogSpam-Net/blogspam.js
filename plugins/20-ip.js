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
    var ip = obj['ip'] || '';

    if (fs.existsSync("/etc/blacklist.d/" + ip))
    {
        spam( "SPAM: Blacklisted IP" );
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
