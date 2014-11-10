exports.name    = function() {return "80-sfs.js" ; };
exports.purpose = function() {return "Look for blacklisted IPs via stopforumspam.com." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Test the IP the comment was submitted from against the stopforumspam.com site.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip     = obj['ip'] || "";
    var result = "next";
    var done   = false;
    var redis  = obj['_redis']
    var http   = require('http');

    //
    // Ensure the IP is an IPv4 address.
    //
    var ipv4  = /^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$/;
    var match = ipv4.exec( ip );
    if ( !match )
    {
        next( "next" );
        return;
    }


    //
    //  The URL request we're going to make.
    //
    var options = {
        host: 'www.stopforumspam.com',
        port: 80,
        path: '/api?ip=' + ip,
    };


    //
    //  The result of the request we're going to send.
    //
    var body = "";
    var uvrun = require( "uvrun" );


    //
    // Send the GET request.
    //
    var re = http.request(options, function(res) {
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('error', function(e) {
            console.log( "ERROR" + e);
            body = "Error Fetching URL " + e;
            next("next");
        });
    }).end();

    //
    // Block until we've got the damn thing back.
    //
    while( !body )
    {
        uvrun.runOnce();
    }

    //
    // Listed?
    //
    if ( body.indexOf( "<appears>yes</appears>" ) >= 0 )
    {
        spam( "Listed in StopForumSpam.com" );
    }
    else
    {
        next( "next" );
    }
};


