exports.name    = function() {return "80-sfs.js" ; };
exports.purpose = function() {return "Look for blacklisted IPs via stopforumspam" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Test the IP the comment came-from against the stopforumspam site.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip     = obj['ip'] || "";
    var result = "next";
    var done   = false;

    //
    //  The URL request we're going to make.
    //
    var options = {
        host: 'www.stopforumspam.com',
        port: 80,
        path: '/api?ip=' + ip,
    };

    //
    // A GET request.
    //
    var re = http.request(options, function(res) {
        var str = '';

        res.on('data', function(chunk) {
            str += chunk;
        });

        res.on('end', function() {
            if ( str.indexOf( "<appears>yes</appears>" ) >= 0 )
            {
                //
                //  TODO: We should cache the IPs we've found
                // listed for at least 48 hours, as we do on our
                // legacy-site.
                //
                result = "Listed in StopForumSpam.com" ;
                spam( result );
            }
            else
            {
                next( "next" );
            }
        });
    });

    re.end();
};


//
// Init method..
//
exports.init = function (  )
{
    http = require('http');
}
