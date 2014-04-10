exports.name    = function() {return "55-anchor-blacklist.js" ; };
exports.purpose = function() {return "Look banned words/terms in anchor text." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var comment = obj['comment'] || '';
    var ip      = obj['ip']      || ""
    var redis   = obj['_redis']
    var config  = obj['_config']

    //
    // Naive identification of the different linking methods.
    //
    var anchor = /<a([^>]+)>([^<]+)<\/a>/gi

    var m;

    while( m = anchor.exec(comment) )
    {
        if (m && m[2] ) {
            a = m[2]
            console.log( "Anchor '" + m[2] + "' -> URL: " + m[1] );

            config.anchor_blacklist.forEach(function(spam_str) {
                if ( a.match( new RegExp( spam_str, "i" ) ) )
                {
                    console.log( "Anchor '" + a + "' matches pattern '" + spam_str + "'" );
                    var res = "Anchor text matches pattern: " + spam_str;

                    redis.set(    "blacklist-" + ip , res );
                    redis.expire( "blacklist-" + ip , 60*60*48 );

                    console.log( "Anchor - blacklisting: " + ip );
                    spam( res );

                }

            });
        }
    }

    //
    //  We passed this plugin.
    //
    next("next");

};


