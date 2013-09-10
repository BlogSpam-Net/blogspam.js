
JSON BlogSpam Service
---------------------

This service receives POSTed JSON data, from blogs, etc.

It tests each submission to divide the comments received into two classes:

* SPAM
* HAM

Spam tests will return a HTTP 403 response, with an explaination.

Valid comments will receive a HTTP 200 response, with the message "OK".



History
-------

I started the http://blogspam.net/ service a few years ago to handle the spammy
comments which were received upon the [Debian Administration](http://www.debian-administration.org/) website.

The comments that were spammy were a pain to deal with, but at the same time they
weren't really specific to the site.  The idea of abstracting away the spam
testing from the site was appealling.

Since then I've added support to several sites for testing for spammy-comments
via a remote XML::RPC interface, but XML::RPC is annoying and bad.

This javascript port of the service is aimed to replace the existing XML::RPC
interface in time.


API
---

The service recieves HTTP POST requests, (other HTTP methods return an error), and
weill assume that each HTTP POST request contains a JSON payload.   The payload
should be a hash with the following members:

* comment
   * The body of the submitted comment.
* ip
   * The IP address the comment was submitted from.
* agent
   * The user-agent the submitter supplied.
* email
   * The email address the submitter supplied.
* link
   * The homepage link the submitter supplied.
* name
   * The name the submitter supplied.
* options
   * Additional options to control how things should work.
* site
   * A link to your site - this parameter is needed for the getStats() function to be useful.
* subject
   * The subject/title the submitter supplied.


The server will load a series of plugins on-startup, and each submission will be
passed through the loaded plugins.

The plugin will be invoked and can handle the results by calling one of the three
call-back methods it receives:

* `spam`
   * The comment is definitely SPAM
* `ham`
   * The comment is definitely HAM.
* `next`
   * The comment is undecided, keep proccessing by invoking all remaining plugins.

Each plugin will be invoked in turn, unless a SPAM or OK result terminates the processing, and the result will be returned to the caller in the form of :

* A HTTP status code
   * 403 for SPAM
   * 200 for OK
* A single line of text
   * Confirming "OK", or declaring the reason for the rejection

**NOTE**: This means you need to have 99-ok.js, or similar, so that the final result is OK.


Plugin API
----------

Each plugin should have a method `testJSON( object, spam, ham)`, where spam and ham are callbacks invoked on failure/success.


Steve
--
