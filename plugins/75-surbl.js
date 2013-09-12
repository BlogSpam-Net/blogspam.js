//
// Stock methods.
//
exports.name    = function() {return "75-surbl.js" ; };
exports.purpose = function() {return "Test links in messages against surbl.org" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Look for the domains included in a body being listed in surbl.org
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var comment = obj['comment'] || ""
    var ip      = obj['ip']      || ""
    var link    = obj['link']    || ""
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
    //  Test the link the user submitted too, if we got one.
    //
    if ( link && link.match(/https?:\/\/([^\/]+)\// ) )
    {
        //
        //  There might have been no links in the body, so setup a new
        // array in that case.
        //
        urls = urls ? urls : new Array()
        urls.push( link );
    }


    //
    // For each link we found.
    //
    if ( urls )
    {
        var currentEntry = -1;

        var execute = function() {

            currentEntry++;
            if (currentEntry >= urls.length) {
                return;
            }

            //
            //  The current URL we're testing.
            //
            var entry = urls[currentEntry];

            //
            //  Remove http:// or https:// prefix.
            //
            //  Remove trailing "/".
            //
            entry = entry.substr( entry.indexOf( "//" ) + 2 );
            entry = entry.replace(/\//gm,"");

            //
            //  The complete name we're looking up.
            //
            var lookup = entry + ".multi.surbl.org";

            console.log( "Testing URL: " + lookup );

            dns.resolve4(lookup, function (err, addresses) {
                if (err)
                {
                    console.log( "\tFailed" );
                    execute();
                }
                else
                {
                    console.log( "\tListed" );
                    //
                    // Cache the result for two days.
                    //
                    redis.set( "blacklist-" + ip , "Posting links listed in surbl.org" );
                    redis.expire( "blacklist-" + ip , 60*60*48 );

                    //
                    // Return the result.
                    //
                    spam( "Posting links listed in surbl.org" );
                    return;
                }
            });
        };

        execute();
        next( "next" );
    }
    else
    {
        next( "next" );
    }

};

