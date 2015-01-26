exports.name    = function() {return "33-link-body.js" ; };
exports.purpose = function() {return "Look links repeated in the body." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var ip    = obj['ip']      || ""
    var link  = obj['link']    || ""
    var body  = obj['comment'] || ""
    var redis = obj['_redis']

    if ( link.length < 1 ) {
        return( next( 'next') );
    }
    if ( body.length < 1 ) {
        return( next( 'next') );
    }

    //
    // Strip leading/trailing space.
    //
    link = link.trim();
    body = body.trim();

    //
    // OK we have a link - get the end of the body.
    //
    body = body.substr( body.length - link.length );

    //
    // Is this a repeated link?
    //
    if  ( body == link )
    {
        //
        // Blacklist for 48 hours.
        //
        var res = "Repetition of the links";

        redis.set(    "blacklist-" + ip , res );
        redis.expire( "blacklist-" + ip , 60*60*48 );

        spam( res );
        return;
    }

    //
    //  We passed this plugin.
    //
    next("next");
};
