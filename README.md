
JSON BlogSpam Service
---------------------

This service is a node.js reimplementation of the [BlogSpam.net service](http://blogspam.net), which is designed to test whether incoming blog-comments are spam or not in realtime.

The original blogspam service was written in Perl and used XML::RPC for the
transport mechanism, that code is available [on CPAN](http://search.cpan.org/dist/Blog-Spam/).

This `node.js` service is currently underoing development with the intention
it can replace the legacy system.  It will receive HTTP POST requests containing
the comments a remote server submits, and will divide those comments into
"SPAM" or "OK".

The result of each comment submission will be a JSON hash, which contains a key
"result" declaring "`SPAM`" or "`OK`".  There may be other keys in the result,
such as "`reason`" which declares the reason for a SPAM result however these
are optional.



History
-------

I started the http://blogspam.net/ service a few years ago to handle the spammy
comments which were received upon the [Debian Administration](http://www.debian-administration.org/) website.

The comments that were spammy were a pain to deal with, but at the same time they
weren't really specific to the site.  The idea of abstracting away the spam
testing from the site was appealling.

Since then I've added support for the remote service to many other of my sites,
and also made it generally available to the internet at large.  The service is
pretty good, but hard to maintain for two reasons:

* The XML::RPC server is very heavy-weight.
   * I'd hope that node.js will be more efficient.
* The XML::RPC server has "issues" with UTF-8.
   * This causes 1/1000 messages to crash the server.
   * Again I hope node.js will sidestep this issue.

This javascript port of the service is aimed to replace the existing XML::RPC
interface in time.  (The XML::RPC method will have to remain for backward compatibility
but it will become a mere shim/proxy around the node.js version.)


API
---

The service recieves HTTP POST requests, (other HTTP methods return an error), and
we assume that each HTTP POST request contains a JSON payload.   The payload
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
passed through the loaded plugins in turn.

The individual plugins can handle the results by calling one of the three call-back
methods it receives:

* `spam`
   * The comment is definitely SPAM.
* `ham`
   * The comment is definitely HAM.
* `next`
   * The comment is undecided, keep proccessing by invoking all remaining plugins.

A spam or ham result terminates the processing, avoiding later plugins.

The actual result of the testing will be returned to the caller in the form of :

* A HTTP status code
   * 200 for SPAM/OK
   * 405 for invalid submissions.
   * 500 for server errors.
* A JSON body.
   * The JSON body will be a hash containing the key "`result`", as well as other optional keys.


**NOTE**: This means you **must** to have 99-ok.js, or similar, so that the final result is OK.


Testing
-------

In one terminal launch the blogspam service:

     node blogspam.js

In another run the test-cases by running:

     cd ./tests/
     ./run-tests

This will fire off some pre-cooked comments, and compare the results of the testing
against the expected result.  If you see errors which are surprising then you can
run a single case explicitly:


     ./run-tests --test ./exclude-plugins.test  [--verbose]


Dependencies & Deployment
-------------------------

To save state we use a [redis](http://redis.io/) store, which means that
you need to have a redis server running upon `localhost`.

It is expected that in live-usage the server will receive POST requests which
have been proxied via Apache/nginx/whatever.  You'll configure Apache/nginx/etc
to pass paths such as /blogspam/api/2.0/ directly to this running node.js
service.


Current Status
--------------

The current code is a pretty convincing proof of concept:

* It will bind to a scoket.
* It will accept and decode JSON POSTS.
* It will process the JSON submission via a series of plugins, each called in order.
* It will return the result of the plugin-tests.
* It keeps state, via redis, to implement the [getStats()](http://blogspam.net/api/getStats.html) part of our legacy API

However it will not:

* Identify more than about 50% of spam comments.
    * Primarily because it is missing plugins.

Steve
--
