//
//  Note this function is naive.  Compare implementations later:
//
//    http://stackoverflow.com/questions/765419/javascript-word-count-for-any-given-dom-element
//


exports.name    = function() {return "45-wordcount.js" ; };
exports.purpose = function() {return "Count the words in the body and abort on too few/many." ; };
exports.author  = function() { return "Steve Kemp <steve@steve.org.uk>" };


//
//  As per the legacy API we look look for word-count limits.
//
exports.testJSON = function ( obj, spam, ok, next)
{
    var options = obj['options'] || 'min-words=5';
    var comment = obj['comment'] || '';

    //
    //  Count the words in the comment.
    //
    comment = comment.replace(/(^\s*)|(\s*$)/gi,"");
    comment = comment.replace(/[ ]{2,}/gi," ");
    comment = comment.replace(/\n /,"\n");
    var wcount = comment.split(' ').length;

    //
    // Split the options.
    //
    var array = options.split( "," );

    //
    //  Look for "min-words=XX" and "max-words=XX" in the options.
    //
    var reg = /^(min-words|max-words)=(.*)$/;

    //
    //  Test each one
    //
    for (var i = 0; i < array.length; i++)
    {
        var option = array[i].trim()

        //
        //  If we match then we can compare the size.
        //
        var match = reg.exec( option );
        if ( match )
        {
            var type = match[1].trim()
            var size = match[2].trim()

            if ( ( type == "min-words" ) &&
                 ( wcount < size ) )
            {
                spam( "The comment had too few words." );
                return
            }

            if ( ( type == "max-words" ) &&
                 ( wcount > size ) )
            {
                spam( "The comment had too many words." );
                return
            }
        }
    }

    //
    //  We passed this plugin.
    //
    next("next");
};


