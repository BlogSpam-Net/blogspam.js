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
    //  Regexps to find links of different forms
    //
    //
    //
    //  So we have a max-links count.  We need to count the links
    //
    var ahref = comment.match(/href=['"]https?:\/\//gi);
    var url   = comment.match(/url=['"]?https?:\/\//gi);
    var link  = comment.match(/link=['"]?https?:\/\//gi);

    if ( ( ahref != null && ahref.length > 0 ) &&
         ( url != null &&  url.length > 0 ) &&
         ( link != null && link.length > 0 ) )
    {
        spam( "Multiple linking stratergies" );
    }


    //
    //  We passed this plugin.
    //
    next("next");
};


