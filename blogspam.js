var fs = require('fs');


var async      = null;
var redis_lib  = null;
var cidr_match = null;


//
//  This code is nasty because I want to allow the service to run without
// run without the user having to update the environmental variable NODE_PATH,
// and setting that in code doesn't work.
//
//  The intention is that the user can install the required dependencies
// either via:
//
//    1. `npm install`
//
//    2.  Using the git submodules.
//
//  Either solution should work equally well, although I personally prefer the
// latter solution.  (Easier to see the local code, and easier to deploy via
// rsync.)
//
if ( fs.existsSync("./submodules/async/lib" ) ) {
    console.log( "Loading async from git submodule.");
    async = require("./submodules/async/lib/async.js" )
} else {
    console.log( "Loading async from beneath ./node_modules/");
    console.log( "If this fails install all dependencies by running:\n\t$ npm install" );
    async = require('async/lib/async.js');
}
if ( fs.existsSync("./submodules/node_redis" ) ) {
    console.log( "Loading redis from git submodule.");
    redis_lib =require("./submodules/node_redis/index.js" )
} else {
    console.log( "Loading redis from beneath ./node_modules/");
    console.log( "If this fails install all dependencies by running:\n\t$ npm install" );
    redis_lib =require('redis/index.js');
}
if ( fs.existsSync("./submodules/cidr_match.js/cidr_match.js" ) ) {
    console.log( "Loading cidr_match from git submodule.");
    cidr_match = require("./submodules/cidr_match.js/cidr_match.js" )
} else {
    console.log( "Loading cidr_match from beneath ./node_modules/");
    console.log( "If this fails install all dependencies by running:\n\t$ npm install" );
    cidr_match = require('cidr_match');
}
var redis = redis_lib.createClient();





//
// BlogSpam object prototype which can be used by `server.js`
// in the future.
//
// TODO:
//
//    * Create a constructor which takes an array of objects,
//      e.g. The redis store and the cidr_matching object.
//
//    * Test the comments and return a hash.
//
//    * Read blogspam.config.json, or similar?
//
//    * Test-code.
//
// When this module is complete we can gut the server.js
// and use this instead.
//
//
function BlogSpam() {

    //
    //  Plugins we've loaded.
    //
    var plugins = [];

    //
    //  Return a hash of all plugins.
    //
    //  This could be used by the get-plugins API-method:
    //
    //   http://test.blogspam.net:9999/plugins
    //
    //
    this.get_plugins = function() {
        var hash = {};
        plugins.forEach(function(plugin){

            var name   = plugin.name()
            var author = plugin.author();
            var desc   = plugin.purpose();
            hash[name] = { 'author': author, 'description': desc };
        });
        return( hash );
    }

    //
    // Load all plugins from beneath the named path.
    //
    // NOTE: Doesn't traverse subdirectories.
    //
    //
    this.load_plugins = function( path ) {

        //
        // Use sync here to ensure that all is loaded
        // "immediately".
        //
        var ents = fs.readdirSync(path);

        //
        // Sort the plugins, and then handle each one.
        //
        ents.sort().forEach(function(entry){
            var plugin = path + "/" + entry;
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
    }


    //
    // Call the testJSON method on every plugin.
    //
    // Expects to receive a hash, as submitted by the remote
    // caller, and return a hash with the result.
    //
    // The hash will already be JSON-decoded, and could have
    // the redis-handle, etc, in it.  See note at top, we
    // might prefer to use the constructor for handling those
    // persistant arguments.
    //
    this.test_comment = function( data ) {

        //
        // The parsed object might contain some options.
        //
        // The options include plugin-names to skip.
        //
        // e.g.  data['options']='exclude=bayasian,exclude=yy,blacklist=1.2.3.4'
        //
        // See the legacy API for details:
        //
        //     http://blogspam.net/api/testComment.html
        //
        //
        var options = data['options'] || "";
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
        var site = data['site'] || "unknown";

        //
        //  Each of the plugins will now be called, in turn.
        //
        //  A result of next() will allow continuation, otherwise
        // the result value will be populated.
        //
        var result = {}


        data['_async'].eachSeries(plugins, function(plugin, callback) {
            var skip = false;

            exclude.forEach(function(element) {
                var name = element.trim();
                if (plugin.name().match(name)) {
                    skip = true;
                }
            });

            if (skip) {
                console.log("Skipping plugin: " + plugin.name());
                return callback(null);
            }

            console.log( "Calling plugin: " + plugin.name());

            // If no skip it will jump here directly, if skip is true the
            // return will make it go away and jump this part and the callback
            // will call the next in the series.
            plugin.testJSON(data, function(reason) {
                console.log("\tplugin " + plugin.name() + " said SPAM" );
                result = {
                    'result': "SPAM",
                    'reason': reason,
                    'blocker': plugin.name(),
                    'version': "2.0"
                };
                return;
            }, function(reason) {
                // ok
                console.log("\tplugin " + plugin.name() + " said OK" );
                result = {
                    'result': "OK",
                    'version': "2.0"
                };
                return;
            }, function(txt) {
                // next
                console.log("\tplugin " + plugin.name() + " said next : " + txt);
                return callback(null);
            });

        }, function (err) {
            if (err) {
                console.log("Error during processing plugin(s): " + err);
            }
        });

        return( result );
    };


};


//
// Dummy Debug-Code.
//


//
// Create the object and load the plugins.
//
var f = new BlogSpam();
f.load_plugins( "./plugins" );



//
// Test a comment-submission
//
var comment = {
    'name': "Steve Kemp",
    'link': 'http://steve.org.uk/',
    'email': 'steve@steve.org.uk',
    'comment': 'This is the body of my comment ..',
    'ip': "22.33.21.99",
    '_async': async,
    '_redis': redis,
    '_cidr': cidr_match
};

var result= f.test_comment( comment );
console.log( "Result of comment test " +JSON.stringify(result));
process.exit(0);
