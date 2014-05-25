exports.name    = function() {return "50-multilinks.js" ; };
exports.purpose = function() {return "Look for different linking stratergies." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  Reject comments that try to hedge their bets and submit
// links in multiple formats.  (e.g. HTML + BBCode)
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var options = obj['options'] || '';
    var comment = obj['comment'] || '';

    //
    // Count of linking-methods.
    //
    var methods = 0;

    //
    // Naive identification of the different linking methods.
    //
    var stratergies = [ /<a href="https?:/i,
                        /\[?url=https?:/i,
                        /\[?link=https?:/i,
                        /\s+https?:/i  ]

    //
    // For each method.
    //
    stratergies.forEach(function(regexp){
        if ( comment.match( regexp ) )
        {
            console.log( "Matched linking strategy regexp: " + regexp );
            methods += 1;
        }
    });


    //
    // Block on too many.
    //
    if ( methods >= 3 )
    {
        spam( "Multiple linking strategies" );
    }
    else
    {
        //
        //  We passed this plugin.
        //
        next("next");
    }
};


