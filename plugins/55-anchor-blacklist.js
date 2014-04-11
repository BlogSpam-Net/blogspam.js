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
    var le   = obj['_link_extractor'];

    var links = le.extract(comment);

    links.forEach(function(item) {
        console.log( "Anchor '" + item['text'] + "' -> URL: " + item['link'] );


        config.anchor_blacklist.forEach(function(spam_str) {
            if ( item['text'].match( new RegExp( spam_str, "i" ) ) )
            {
                console.log( "Anchor '" + item['text'] + "' matches pattern '" + spam_str + "' blacklisting:" + ip );

                var res = "Anchor text matches pattern: " + spam_str;

                redis.set(    "blacklist-" + ip , res );
                redis.expire( "blacklist-" + ip , 60*60*48 );

                spam( res );
            }
        });
    });


    //
    //  We passed this plugin.
    //
    next("next");

};


