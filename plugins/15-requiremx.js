//
// Stock methods.
//
exports.name    = function() {return "15-requiremx.js" ; };
exports.purpose = function() {return "Ensure submitted email addresses have an MX" ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Find the MX  for the user's email.
//
exports.testJSON = function ( obj, spam, ok, next )
{
    var mail   = obj['email']   || ""
    var regexp = /^([^@]+)@(.*)$/

    var match = regexp.exec( mail );
    if ( match )
    {
        var domain = match[2].trim();

        console.log( "Looking for MX for domain " + domain );

        dns.resolveMx(domain, function (err, addresses) {
            if (err)
            {
                spam( "No MX record for domain " + domain );
            }
            else
            {
                next( "next" );
            }
        });
    }
    else
    {
        //
        //  No email address was submitted, this should be an error
        // but if the caller cares they can use the mandatory=email
        // server-options.
        //
        next( "next" );
    }

};


//
// Init method..
//
exports.init = function (  )
{
    dns = require('dns');
}
