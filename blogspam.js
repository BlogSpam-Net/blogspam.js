/**
 * BlogSpam API, JSON version, proof of concept hack.
 *
 * 1. Listen for HTTP-POST requests, and parse the JSON bodies.
 *
 * 2. Load plugins from beneath ./plugins/ at startup.
 *
 * 3. Each plugin should have a testJSON method, which can invoke
 *    one of three callbacks: spam, ham, next.
 *
 *
 * Steve
 * --
 */


var fs   = require('fs');
var http = require('http')
var path = require('path');


/**
 * Our plugins.
 */
var plugins = []


/**
 * Trivial server for receiving JSON POST requests.
 */
var server = http.createServer(function (request, response) {

    if ( request.url == "/" && request.method === 'POST' ) {
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

            //
            // The parsed object might contain some options.
            //
            // The options include plugin-names to skip.
            //
            // e.g.  parsed['options']='exclude=bayasian,exclude=yy,blacklist=1.2.3.4'
            //
            // See the legacy API for details:
            //
            //     http://blogspam.net/api/testComment.html
            //
            //
            var options = parsed['options'] || "";
            var opts    = options.split( "," );
            var exclude = [];

            for (var i = 0; i < opts.length; i++)
            {
                var option = opts[i].trim();
                var reg = /^exclude=(.*)$/;

                var match = reg.exec( option );
                if ( match )
                {
                    exclude.push( match[1].trim() );
                }
            }

            var currentPlugin = -1;

            var execute = function() {

                try {
                    currentPlugin++;
                    if (currentPlugin >= plugins.length) {
                        //
                        //  All plugins have executed and have presumably
                        // not flagged a submission as SPAM.
                        //
                        //  Therefore it is HAM.
                        //
                        response.writeHead( 200 , {'content-type': 'application/json' });
                        response.end('{"result":"OK","version":"2.0"}' );
                        return;
                    }

                    var plugin = plugins[currentPlugin];
                    var skip = false;

                    for (var i = 0; i < exclude.length; i++)
                    {
                        var name = exclude[i].trim();
                        if ( plugin.name().match( name ) )
                        {
                            skip = true;
                        }
                    }


                    if (  skip )
                    {
                        execute();
                    }
                    else
                    {
                        //
                        //  Call the test-json method, with the three-callbacks:
                        //
                        //   spam.  Send an error, via JSON.
                        //
                        //   ham.   Send an OK, via JSON.
                        //
                        //   next.  This will ensure the next plugin will be invoked.
                        //
                        plugin.testJSON( parsed, function(reason) { //spam

                            //
                            //  Along with the reason.
                            //
                            response.writeHead( 200 , {'content-type': 'application/json' });
                            var hash = {};
                            hash['result'] = "SPAM";
                            hash['reason'] = reason;
                            hash['blocker'] = plugin.name()
                            hash['version'] = "2.0";
                            response.end(JSON.stringify(hash));
                            console.log(JSON.stringify(hash));
                        }, function(reason){ //ok

                            response.writeHead( 200 , {'content-type': 'application/json' });
                            response.end('{"result":"OK","version":"2.0"}' );
                            return;
                        }, function(txt){ //next
                            console.log( "\tplugin " + plugin.name() + " said next :" + txt );
                            execute();
                        });
                    }
                } catch ( e ) {

                    //
                    //  Error invoking a plugin...
                    //
                    response.writeHead(500, {'content-type': 'text/plain' });
                    console.log( "Error during processing plugin(s): " + e );
                    response.end("Error processing submission " + e + '\n');
                }
            };

            execute();

        });
    }
    else if ( request.url == "/stats" && request.method === 'POST' ) {
        var data = '';

        request.addListener('data', function(chunk) { data += chunk; });
        request.addListener('end', function() {
            var parsed;

            //
            //  Try to parse the JSON body.
            //
            try {
                parsed = JSON.parse(data);
            } catch ( e ) {
                response.writeHead(500, {'content-type': 'text/plain' });
                response.write('ERROR:' + e);
                response.end('\n');
            }

            //
            // Get the parsed-site.
            //
            var site = parsed['site'] || "unknown";

            //
            //  TODO: Lookup the data.
            //
            var hash = {}
            hash['spam'] = 0
            hash['ham'] = 0;

            response.writeHead(200, {'content-type': 'application/json' });
            response.end(JSON.stringify(hash));

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
        response.end( "We only accept POST requests, via HTTP.  Ignoring method " + request.method + " to " + request.url );
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

        //
        //  If the plugin has an init method, call it.
        //
        if(typeof v.init === 'function') {
            v.init();
        };
    });
});

server.listen(8888)
