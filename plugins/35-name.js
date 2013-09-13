//
// Stock methods.
//
exports.name    = function() {return "35-name.js" ; };
exports.purpose = function() {return "Test for links in the 'name' field." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Spammers want to include hyperlinks to their sites.
//
//  Drop any request as spam if they include a URL in the name field.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip      = obj['ip']      || ""
    var name    = obj['name']    || ""
    var redis   = obj['_redis']


    var http  = /^https?:\/\//i
    var match = http.exec( name );
    if ( !match )
    {
        next( "next" );
    }
    else
    {
        //
        // Cache the result for two days.
        //
        redis.set( "blacklist-" + ip , "Hyperlink in the 'name' field." );
        redis.expire( "blacklist-" + ip , 60*60*48 );

        //
        // Return the result.
        //
        spam( "Hyperlink in the 'name' field." );
    }

};

