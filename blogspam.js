var fs = require('fs');


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
// Test we loaded plugins as expected.
//
var loaded = f.get_plugins()

//
// Log them to be sure.
//
console.log( JSON.stringify(loaded));

