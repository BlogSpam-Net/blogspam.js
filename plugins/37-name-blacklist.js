//
// Stock methods.
//
exports.name    = function() {return "37-name-blacklist.js" ; };
exports.purpose = function() {return "Known-bad names." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Many times I've seen strings in the name-field which are always
// spam.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip      = obj['ip']      || ""
    var name    = obj['name']    || ""
    var redis   = obj['_redis']

    //
    //  We don't want to be too strict here, but even so ..
    //
    var bad = [ "Nike\\s+Air.*Sale",
                "cheap\\s+viagra",
                "generic\\s+cialis",
                "^cheap.*insurance",
                "erectile\s+dysfunction",
                "^wholesale\s+iphone",
                "^car\s+insurance\s+quotes",
                "^buy.*backlinks",
                "fake.*sale$",
                "^Cheap\\s+Fake",
                "Fake\\s+Oakley",
                "^free.*samples$",
                "^buy.*fake",
                "^botanical\\s+slimming",
                "^vintage\\s+casino",
                "casion\\s+poker$",
                "^Oakley\\s+Sunglasses$",
                "^gucci\\s+outlet\\s+stores",
                "handbags\\s+outlet",
                "^cheap.*for\\s+sale$",
                "^best\\s+insurance\\s+quotes",
                "Generic\\s+viagra",
                "\\s+Outlet\\s+Store$",
              ];

    //
    // For each bad-name.
    //
    bad.forEach(function(spam_str){
        if ( name.match( new RegExp( spam_str, "i" ) ) )
        {
            spam( "Bad name" );
            return;
        }
    });

    next( "next" );
};

