//
// Stock methods.
//
exports.name    = function() {return "15-requiremx.js" ; };
exports.purpose = function() {return "Ensure submitted email addresses have an MX." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Find the MX  for the user's email.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var mail   = obj['email']   || "",
        regexp = /^([^@]+)@(.*)$/,
        dns    = require('dns');

    var match = regexp.exec( mail );
    if ( match )
    {
        var domain = match[2].trim();

        //
        // Require the event-run-library
        //
        var uvrun = require( "uvrun" );

        //
        // These are updated in the callback.
        //
        var e;
        var a;

        //
        // Update the variables.
        //
        dns.resolveMx(domain, function (err, addresses) {
            e = err;
            a = addresses;
        });


        //
        // At this point we block/stall until the callback has
        // finished.
        //
        while( ( !e ) && ( !a ) ) {
            uvrun.runOnce();
        }

        if (e)
        {
            // error == No DNS result found.
            spam( "No MX record for domain " + domain );
            return;
        }
        else
        {
            next( "next" );
            return;
        }
    }
    else
    {
        //
        //  No email address was submitted, this should be an error
        // but if the caller cares they can use the mandatory=email
        // server-options.
        //
        next( "next" );
        return;
    }

};

