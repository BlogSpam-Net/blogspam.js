/**
 *
 * blogspam.js - node.js powered reimplementation of the BlogSpam API
 *
 *
 * About
 * -----
 *
 * This server is designed to judge whether comments left on blogs, forums, etc,
 * are spam, in real-time.
 *
 * To do that it receives submitted comments via HTTP-POST requests of JSON objects.
 * It will then invoke a series of plugins on the submission and return a JSON object
 * which contains the result "SPAM" or "OK".
 *
 * Each plugin will be called in turn until a result is achieved, and if all pass then
 * a default OK will be the result.  If any early plugin judges a comment to be spam
 * then further processing will cease, as a speed optimisation.
 *
 *
 * Dependencies
 * ------------
 *
 * You need a redis-server running on the localhost to store state, otherwise
 * the only dependency is node.js, and the redis-client library which is included
 * as a git-submodule.
 *
 *
 * API Endpoints
 * -------------
 *
 * Test acomment, via a HTTP POST of JSON data:
 *   http://localhost:9999/
 *
 * Return per-site stats, via a HTTP POST:
 *   http://localhost:9999/stats/
 *
 * Retrieve a JSON dump of all loaded plugins:
 *   http://localhost:9999/plugins/
 *
 *
 * Steve
 * --
 */


var fs        = require('fs');
var http      = require('http')
var path      = require('path');
var redis_lib = require('./node_redis/index.js');


/**
 * Our redis-connection.
 */
var redis = redis_lib.createClient();


/**
 * Our plugins.
 */
var plugins = []


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

            var parsed;

            //
            //  Try to parse the JSON body.
            //
            try {
                parsed = JSON.parse(data);
                parsed["_redis"] = redis;
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

            //
            // Populate the exclude array with regexps of plugin-names
            // to exclude.
            //
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


            //
            //  Get the name of the site which is causing the test
            // to be made - this will allow us to keep track of
            // per-site SPAM/OK counts.
            //
            var site = parsed['site'] || "unknown";

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
                        redis.incr( "site-" + site + "-ok" );
                        redis.incr( "global-ok" );
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

                    if ( skip )
                    {
                        console.log( "SKipping plugin " + plugin.name());
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
                            redis.incr( "site-" + site + "-spam" );
                            redis.incr( "global-spam" );
                            skip = true;
                            return;
                        }, function(reason){ //ok

                            response.writeHead( 200 , {'content-type': 'application/json' });
                            response.end('{"result":"OK","version":"2.0"}' );
                            redis.incr( "site-" + site + "-ok" );
                            redis.incr( "global-ok" );
                            skip = true;
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
    else if ( ( request.url == "/stats" || request.url == '/stats/' ) &&
              ( request.method === 'POST' ) ) {
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
            //  Lookup the data from Redis.
            //
            var hash = {}

            redis.get( "site-" + site + "-spam" , function (err, reply) {
                if ( reply ) {
                    hash['spam'] = reply;
                }

                redis.get( "site-" + site + "-ok" , function (err, reply) {
                    if ( reply ) {
                        hash['ok'] = reply;
                    }

                    response.writeHead(200, {'content-type': 'application/json' });
                    response.end(JSON.stringify(hash));
                    console.log(JSON.stringify(hash));
                });

            });

        });
    }
    else if ( ( request.url == "/plugins" || request.url == "/plugins/" )  &&
              request.method === 'GET' ) {
        var hash = {};

        plugins.forEach(function(plugin){
            var name   = plugin.name()
            var author = plugin.author();
            var desc   = plugin.purpose();

            hash[name] = { 'author': author, 'description': desc };

        });

        response.writeHead(200, {'content-type': 'application/json' });
        response.end(JSON.stringify(hash));
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
        if ( plugin.match( /.js$/ ) )
        {
            v = require(plugin);
            console.log( "Loaded plugin: " + plugin );

            //
            //  If the plugin has an init method, call it.
            //
            if(typeof v.init === 'function') {
                v.init();
            };

            //
            //  If the plugin has a .testJSON method
            // we'll add it to the plugin list.
            //
            if(typeof v.testJSON === 'function') {
                plugins.push( v );
            };
        }

    });
});

server.listen(9999)
