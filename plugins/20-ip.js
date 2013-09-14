//
// Stock methods.
//
exports.name    = function() {return "20-ip.js" ; };
exports.purpose = function() {return "Look for whitelisted/blacklisted IPs." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Test the IP the comment was submitted from.
//
//  * Against a local blacklist, maintained by the admin.
//
//  * Against any whitelist/blacklists the user might have set with options.
//
//  * Against previously tested comments; if a comment is judged spam we
//    might automatically mark their submissions as spam for 48 hours.
//
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var ip      = obj['ip']
    var options = obj['options'] || ""

    //
    // Handle to the cidr_match.js library.
    //
    var cidr    = obj['_cidr'];


    //
    //  If we're missing an IP this is an error
    //
    if ( ! ip )
    {
        spam( "missing IP address" );
        return;
    }

    //
    //  If the IP is not IPv4 or IPv6 it is invalid.
    //
    var ipv4 = /^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$/;
    var ipv6 = /^([a-f0-9:]+)$/i;

    if ( ( !ipv6.exec( ip ) ) && ( ! ipv4.exec(ip ) ) )
    {
        spam( "Malformed IP address: " + ip );
        return;
    }

    //
    // If the user set some options they might include a whitelist
    // or a blacklist.
    //
    var array = options.split( "," );

    //
    //  Look for "whitelist=IP" | "blacklist=IP"
    //
    var m    = /^(whitelist|blacklist)=(.*)$/;

    //
    //  For each option.
    //
    for (var i = 0; i < array.length; i++)
    {
        var option = array[i].trim()

        //
        //  If we match whitelist|blacklist we can compare the value.
        //
        var match = m.exec( option );
        if ( match )
        {
            //
            //  The type of option, and the IP-value.
            //
            var type  = match[1].trim()
            var ipval = match[2].trim()
            var match = false;

            //
            // Is the IP value a CIDR range?
            //
            if ( ipval.indexOf( "/" ) >= 0 )
            {
                match = cidr.cidr_match( ip, ipval );
            }
            else
            {
                //
                //  Otherwise literal comparison.
                //
                match = ( ipval ==  ip )
            }

            if ( match ) {
                if ( type == "whitelist" ) {
                    ok( "Locally whitelisted IP, via options." );
                    return;
                }
                if ( type == "blacklist" ) {
                    spam( "Locally blacklisted IP, via options." );
                    return;
                }
            }
        }
    }


    //
    //  Is the IP whitelisted, via the site-admin?
    //
    if ( fs.existsSync("/etc/whitelist.d/" + ip) )
    {
        ok( "OK: Locally whitelisted IP, globally." );
        return;
    }

    //
    //  Is the IP blacklisted, via the site-admin?
    //
    if ( fs.existsSync("/etc/blacklist.d/" + ip) )
    {
        spam( "SPAM: Locally blacklisted IP, globally." );
        return;
    }

    //
    //  If we have a cached result set by another plugin then use that.
    //
    var redis = obj['_redis'];
    redis.get("blacklist-" + ip , function (err, reply) {
        if ( reply ) {

            //
            // First of all update the expiry date again.
            //
            // This means rather than a cached result expiring
            // 2-days after it has been inserted it will expire
            // 2-days after it has last been seen in the wild.
            //
            redis.expire( "blacklist-" + ip , 60*60*48 );

            //
            // Send the reply.
            //
            spam( reply );
        }
        else {
            next("next");
        }
    });
};


//
// Init method..
//
exports.init = function (  )
{
    fs = require('fs');
}
