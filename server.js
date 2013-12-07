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
 * the only dependency is node.js, and the various node libraries which are
 * documented in `packages.json`.
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


var fs         = require('fs');
var http       = require('http')
var path       = require('path');
var async      = null;
var redis_lib  = null;
var cidr_match = null;


//
//  These are the external dependencies, which can be installed by running:
//
//     $ npm install
//
var async      = require('async/lib/async.js');
var redis_lib  = require('redis/index.js');
var cidr_match = require('cidr_match');


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

                //
                //  Make our CIDR-matching library, and redis-handle
                // available to all plugins.
                //
                parsed["_redis"] = redis;
                parsed["_cidr"]  = cidr_match;

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

            //
            // I've seen a lot of sites behind mod_proxy, or similar,
            // which submit IP addresses of the form:
            //
            //   1.2.3.4:678
            //
            //
            // Strip out the suffix if present.
            //
            var strip_port = /^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+):([0-9]+)$/;
            var p_match    = strip_port.exec( parsed['ip'] )
            if ( p_match )
            {
                parsed['ip'] = p_match[1] + "." + p_match[2]  + "." + p_match[3]  + "." + p_match[4];
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
            var done = false;

            async.eachSeries(plugins.sort(), function(plugin, callback) {
                var skip = false;

                exclude.forEach(function(element) {
                    var name = element.trim();
                    if (plugin.name().match(name)) {
                        skip = true;
                    }
                });

                if (skip || done) {
                    console.log("Skipping plugin: " + plugin.name());
                    return callback(null);
                }

                // If no skip it will jump here directly, if skip is true the
                // return will make it go away and jump this part and the callback
                // will call the next in the series.
                plugin.testJSON(parsed, function(reason) {

                    // spam
                    response.writeHead(200, {'content-type': 'application/json'});
                    var hash = {
                        'result': "SPAM",
                        'reason': reason,
                        'blocker': plugin.name(),
                        'version': "2.0"
                    };

                    console.log( "SPAM submission: " + plugin.name() + ":" + reason + " ->" + JSON.stringify(data) );

                    //
                    //  Log in a rotating buffer.
                    //
                    redis.lpush( "recent-comments-spam", JSON.stringify(data));
                    redis.ltrim( "recent-comments-spam", 0, 1000 );

                    response.end(JSON.stringify(hash));
                    redis.incr("site-" + site + "-spam");
                    redis.incr("global-spam");
                    done = true;
                    return;
                }, function(reason) {
                    // ok
                    console.log( "Valid submission: " + JSON.stringify(data) );

                    //
                    //  Log in a rotating buffer.
                    //
                    redis.lpush( "recent-comments-ok", JSON.stringify(data));
                    redis.ltrim( "recent-comments-ok", 0, 1000 );

                    response.writeHead(200, {'content-type': 'application/json'});
                    response.end('{"result":"OK", "version":"2.0"}');
                    redis.incr("site-" + site + "-ok");
                    redis.incr("global-ok");
                    done = true;
                    return;
                }, function(txt) {
                    // next
                    console.log("\tplugin " + plugin.name() + " said next : " + txt);
                    return callback(null);
                });

            }, function (err) {
                if (err) {
                    response.writeHead(500, {'content-type': 'text/plain'});
                    console.log("Error during processing plugin(s): " + err);
                    return response.end("Error processing submission " + e + '\n');
                }
                else
                {
                    response.writeHead(200, {'content-type': 'application/json'});
                    response.end('{"result":"OK", "version":"2.0"}');
                    redis.incr("site-" + site + "-ok");
                    redis.incr("global-ok");
                    done = true;
                    return;
                }
            });
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
                response.write('Failed to parse JSON submission:' + e);
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
    else if ( ( request.url == "/classify" || request.url == '/classify/' ) &&
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
                response.write('Failed to parse JSON submission:' + e);
                response.end('\n');
            }

            //
            // Get the submitted IP - the only thing we care about right now.
            //
            var ip   = parsed['ip']    || "";
            var site = parsed['site']  || "unknown";
            var as   = parsed['train'] || "spam";
            var key  = "blacklist-" + site + "-" + ip;

            //
            // Blacklist, on a per-site basis.
            //
            if ( as == "spam" )
            {
                //
                // NOTE: This doesn't expire.
                //
                redis.set( key , "IP blacklisted for " + site );

                console.log("IP trained as SPAM " + ip + " for site " + site );
            }
            if ( as == "ok" )
            {
                redis.del( key );
                console.log("IP trained as OK " + ip + " for site " + site );
            }

            //
            //  We've "trained".
            //
            response.writeHead(200, {'content-type': 'application/json' });
            response.end('{"result":"OK", "version":"2.0"}');

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
                console.log( "\tLoaded plugin  : " + plugin );
            } else {
                console.log( "\tIgnored plugin : " + plugin );
            }
        }

    });
});



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


//
// Every five minutes show we're alive.
//
function alive()
{
    var now = new Date();
    console.log("Server alive " + now );
}
setInterval(alive, ( 5 * 60) * 1000);

