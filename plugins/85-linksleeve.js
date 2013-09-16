exports.name    = function() {return "85-linksleeve.js" ; };
exports.purpose = function() {return "Look for blacklisted links via linksleeve.org." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Test the IP the comment was submitted from against the linksleeve.org site.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var redis   = obj['_redis']
    var ip      = obj['ip']      || '';
    var comment = obj['comment'] || '';
    var link    = obj['link']    || '';

    var http        = require('http');
    var querystring = require('querystring');

    //
    //  Site seems to be having MySQL issues.
    //
    //  Disabled until it comes back.
    //
    next("next");
    return;

    //
    // Add the link to the comment body, if we got one.
    //
    if ( link.length > 0 )
    {
        comment += link;
    }

    //
    // The data we're going to POST.
    //
    var post_data = querystring.stringify({
        'content' : comment
    });

    //
    //  The URL request we're going to make.
    //
    var options = {
        host: 'www.linksleeve.org',
        port: 80,
        path: '/pslv.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        }
    };

    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');

        var str = '';

        res.on('data', function(chunk) {
            str += chunk;
            console.log('Response: ' + chunk);
        });

        res.on('error', function(e) {
            console.log( "Error sending POST request: " + e);
            next("next");
            return;
        });
        res.on('end', function() {

            // TODO: Test the result here.
            next("next");
            return;
        });
    });

    //
    // Send the post.
    //
    post_req.write(post_data);
    post_req.end();

};

