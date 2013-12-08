//
// Stock methods.
//
exports.name    = function() {return "25-subject.js" ; };
exports.purpose = function() {return "Known-bad subjects." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };

//
// Load a configuration file of blacklisted names.
//
var config  = require( "../config.js" );

//
// Blacklist any host which submits a known-bad subject.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip    = obj['ip']      || ""
    var subj  = obj['subject'] || ""
    var redis = obj['_redis']

    //
    // For each bad-subject we've got.
    //
    config.subject_blacklist.forEach(function(spam_str) {

        //
        // If we match..
        //
        if ( subj.match( new RegExp( spam_str, "i" ) ) )
        {
            //
            // Blacklist for 48 hours.
            //
            var res = "Blacklisted subject";

            redis.set(    "blacklist-" + ip , res );
            redis.expire( "blacklist-" + ip , 60*60*48 );

            spam( res );
            return;
        }
    });

    next( "next" );
};

