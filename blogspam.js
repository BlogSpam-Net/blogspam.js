/**
 * BlogSpam API, JSON version.
 *
 * 1. Listen for HTTP-POST requests, and parse the JSON bodies.
 *
 * 2. Load plugins from beneath ./plugins/ at startup.
 *
 * 3. Each plugin should have a testJSON method, which returns
 *   one of: "spam:reason", "ok", or "next".
 *
 *
 */


var fs   = require('fs');
var http = require('http')
var path = require('path');


/**
 * Our plugins.
 */
var plugins = []


/**
 *
 */
var server = http.createServer(function (request, response) {

    if ( request.method === 'POST' ) {
        var data = '';
        request.addListener('data', function(chunk) { data += chunk; });
        request.addListener('end', function() {

            var parsed;

            //
            //  Try to parse the JSON body.
            //
            try {
                parsed = JSON.parse(data);
                console.log( "Received submission: " + data );
            } catch ( e ) {
                response.writeHead(500, {'content-type': 'text/plain' });
                response.write('ERROR:' + e);
                console.log( "Failed to parse JSON: " + e );
                response.end('\n');
            }

            var complete = false;
            try  {

                //
                //  For each plugin ..
                //
                for (var i in plugins)
                {
                    var plugin = plugins[i];
                    if ( complete ) { break ; }

                    plugin.testJSON( parsed,
                                     // spam
                                     function(reason){
                                         complete = true;
                                         response.writeHead( 403 ,
                                                             {'content-type': 'text/plain' });

                                         //
                                         //  Along with the reason.
                                         //
                                         response.end(reason + "[" + plugin.name() + "]");
                                         complete = true;
                                         console.log( "\tplugin " + plugin.name() + " said spam " + reason );
                                     },
                                     // ok
                                     function(reason){
                                         complete = true;
                                         response.writeHead( 200 ,
                                                             {'content-type': 'text/plain' });

                                         //
                                         //  Along with the reason.
                                         //
                                         response.end("OK " + plugin.name());
                                     },
                                     // next
                                      function(txt){
                                          console.log( "\tplugin " + plugin.name() + " said next :" + txt );
                                     }
                                   );
                }
            } catch ( e ) {
                //
                //  Error handling the submission.
                //
                response.writeHead(500, {'content-type': 'text/plain' });
                console.log( "Error during processing plugin(s): " + e );
                response.end("Error processing submission " + e + '\n');
            }

        });
    }
    else
    {
        //
        //  We avoid non-POST requests.
        //
        //  Happily HTTP 405 is a sane response-code to return.
        //
        response.writeHead(405, {'content-type': 'text/plain' });
        response.end( "We only accept POST requests, via HTTP" );
    }

});


/**
 * Load our plugins.
 */
fs.readdir("./plugins", function(err, entries)  {
    var dirs = [];
    entries = entries || [];
    entries.sort(function(a, b) {
        return a < b ? -1 : 1;
    }).forEach(function(entry) {

        var plugin = "./plugins/" + entry;
        v = require(plugin);
        console.log( "Loaded plugin: " + plugin );

        plugins.push( v );

        if(typeof v.init === 'function') {
            v.init();
        };
    });
});

server.listen(8888)
