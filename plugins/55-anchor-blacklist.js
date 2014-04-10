exports.name    = function() {return "55-anchor-blacklist.js" ; };
exports.purpose = function() {return "Look banned words/terms in anchor text." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var comment = obj['comment'] || '';
    var config = obj['_config']

    //
    // Naive identification of the different linking methods.
    //
    var anchor = /href="([^"]+)">([^<]+)<\/a>/gi

    var m;

    while( m = anchor.exec(comment) )
    {
        if (m && m[2] ) {
            a = m[2]
            console.log( "Found anchor " + m[1] + " -> " + m[2] );
            config.anchor_blacklist.forEach(function(spam_str) {
                if ( a.match( new RegExp( spam_str, "i" ) ) )
                {
                    console.log( "Anchor '" + a + "' matches pattern '" + spam_str + "'" );
                    spam( "Anchor text matches pattern: " + spam_str );
                }

            });
        }
    }

    //
    //  We passed this plugin.
    //
    next("next");

};


