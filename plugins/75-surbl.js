//
// Stock methods.
//
exports.name    = function() {return "75-surbl.js" ; };
exports.purpose = function() {return "Test links in messages against surbl.org." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Look for the domains included in a body being listed in surbl.org
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var comment = obj['comment'] || "";
    var ip      = obj['ip']      || "";
    var link    = obj['link']    || "";
    var redis   = obj['_redis'];
    var config  = obj['_config']
    var dns     = require('dns');
    var le   = obj['_link_extractor'];

    //
    //  Build up an array of links.
    //
    var urls = new Array();
    var links = le.extract(comment);

    //
    //  Also add the links we find via the naive approach
    //
    var c = comment.replace(/(\r\n|\n|\r)/gm," ");
    var u = comment.match(/https?:\/\/([^\/]+)\//gi);
    if ( u )
    {
        u.forEach(function(entry){
            var p = {};
            p['link'] = entry;
            links.push( p );
        });
    }

    //
    //  Store each url for processing.
    //
    links.forEach(function(item) {
        var l = item['link'];

        //
        //  Remove any quotes
        //
        l = l.replace(/^href=/, "");

        l = l.replace(/^\"|\"$/, "");
        l = l.replace(/^\"|\"$/, "");

        //
        //  Remove leading/trailing whitespace
        //
        l = l.trim(l);
        urls.push( l );
    });


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

            console.log( "Domain test:" + entry );
            var matches = entry.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
            var domain = matches && matches[1];  // domain will be null if no match is found

            if ( !domain ) {
                return;
            }

            console.log( "Link " + entry + " has domain '" + domain + "'" );

            //
            //  Look for blacklisted entries.
            //
            config.domain_blacklist.forEach(function(spam_str){

                if ( domain === spam_str )
                {
                    //
                    // Blacklist for 48 hours.
                    //
                    var res = "Domain is blacklisted: " + entry;
                    redis.set(    "blacklist-" + ip , res );
                    redis.expire( "blacklist-" + ip , 60*60*48 );

                    console.log( res );
                    spam( res );
                    return;
                }
            });

            //
            //  The complete name we're looking up.
            //
            var lookup = domain + ".multi.surbl.org";

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

