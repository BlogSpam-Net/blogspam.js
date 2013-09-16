/**
 *
 * bs.js - node.js powered re-implementation of the BlogSpam API
 *
 * Steve
 * --
 */


var fs    = require('fs');
var http  = require('http')
var path  = require('path');
var bs    = require ("./blogspam.js" );




/**
 * Trivial server for receiving JSON POST requests.
 */
var server = http.createServer(function (request, response) {

    /**
     * If we're receiving a POST to "/" then it is to test
     * a comment.
     */
    if ( request.url == "/" && request.method === 'POST' ) {
        var data = '';
        request.addListener('data', function(chunk) { data += chunk; });
        request.addListener('end', function() {

            //
            // The hash all plugins use.
            //
            var parsed = {};

            //
            //  Try to parse the JSON body.
            //
            //  If we succeed ensure that all keys have consistent names.
            //
            try {
                var obj = JSON.parse(data);

                //
                // Copy all keys/values from this hash, but make sure
                // the keys are downcased.
                //
                Object.keys(obj).forEach(function (key,val) {
                    var lkey = key.toLowerCase();
                    parsed[lkey] = obj[key]
                })

                console.log( "Received submission: " + data );
            } catch ( e ) {
                response.writeHead(500, {'content-type': 'text/plain' });
                response.write('Failed to parse JSON submission:' + e);
                console.log( "Failed to parse JSON: " + e );
                response.end('\n');
            }

            //
            // We might have an IPv6 prefix.  If so strip it off.
            //
            // We do this because we assume either a valid IPv6 address,
            // or an IPv4 address.  Not the hybrid.
            //
            var strip_prefix = /^::ffff:([0-9.]+)$/i;
            var match = strip_prefix.exec( parsed['ip'] )
            if ( match )
            {
                parsed['ip'] = match[1].trim()
            }

            var result = bs.test_comment( parsed );
            console.log( "OUTPUT OF BLOGSPAM-TEST " + JSON.stringify( result ) );
            response.writeHead(200, {'content-type': 'application/json'});
            response.end(JSON.stringify( result ) );
            return;
        });
    }
    else if ( ( request.url == "/plugins" || request.url == "/plugins/" )  &&
              request.method === 'GET' ) {
        var hash = bs.get_plugins();
        response.writeHead(200, {'content-type': 'application/json' });
        response.end(JSON.stringify(hash));
    }
    else
    {
        //
        //  If we reach here we've hit an unrecognized end-point,
        // or a valid destination but the wrong HTTP-verb.
        //
        //  Happily HTTP 405 is a sane response-code to return.
        //
        response.writeHead(405, {'content-type': 'text/plain' });
        response.end( "We only accept POST requests, via HTTP.  Ignoring method " + request.method + " to " + request.url );
    }

});




/**
 * Load our plugins.
 */
bs.load_plugins( "./plugins" );


//
// If the server receives an error exit cleanly.
//
// (We assume a production deployment would run under runit/daemontools/similar.)
//
server.on('error', function(e) {
    if ( e.errno == "EADDRINUSE" ) {
        console.log( "Error: The server-port is already in use.\nIs the server already running?" );
    }
    else {
        console.log( "ERROR" + e);
    }
    process.exit( 0 );
});


//
// Start the server listening on both all IPv4 & all IPv6 addresses.
//
server.listen(9999, '::');
