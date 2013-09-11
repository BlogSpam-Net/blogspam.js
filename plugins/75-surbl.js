//
// Stock methods.
//
exports.name    = function() {return "77-surbl.js" ; };
exports.purpose = function() {return "Test links in messages against surbl.org" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Look for the domains included in a body being listed in surbl.org
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var comment = obj['comment'] || ""
    var redis   = obj['_redis']

    //
    // Remove newlines.
    //
    comment = comment.replace(/(\r\n|\n|\r)/gm," ");

    //
    // Look for URLs.
    //
    var urls = comment.match(/https?:\/\/([^\/]+)\//gi);

    //
    // For each link we found.
    //
    if ( urls )
    {
        urls.forEach(function(entry){

            entry = entry.substr( entry.indexOf( "//" ) + 2 );
            entry = entry.replace(/\//gm,"");

            console.log( "Looking up entry " + entry );
            var lookup   = entry + ".multi.surbl.org";
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
                    redis.set( "blacklist-" + ip , "Posting links listed in surbl.org" );
                    redis.expire( "blacklist-" + ip , 60*60*48 );

                    //
                    // Return the result.
                    //
                    spam( "POsting links listed in surbl.org" );
                }
            });
        });
    }
    else
    {
        next( "next" );
    }

};

