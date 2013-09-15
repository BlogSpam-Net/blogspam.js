
JSON BlogSpam Service
---------------------

This service is a node.js re-implementation of the [BlogSpam.net service](http://blogspam.net), which is designed to test whether incoming blog-comments are spam or not in real-time.

The original blogspam service was written in Perl and used XML::RPC for the
transport mechanism, that code is available [on CPAN](http://search.cpan.org/dist/Blog-Spam/).

This `node.js` service is being developed with the intention of replacing the legacy system.
Rather than receiving comment-submissions via XML-RPC it will accept HTTP POST requests containing
JSON.  Those requests will then be tested, and the result will be returned as a JSON hash containing
a results key declaring "`SPAM`" or "`OK`".  There may be other keys in the result, such as "`reason`"
which declares the reason for a SPAM result however these are optional.



History
-------

I started the http://blogspam.net/ service a few years ago to handle the spammy
comments which were received upon the [Debian Administration](http://www.debian-administration.org/) website.

The comments that were spammy were a pain to deal with, but at the same time they
weren't really specific to the site.  The idea of abstracting away the spam
testing from the site was appealing.

Since then I've added support for the remote service to many other of my sites,
and also made it generally available to the internet at large.  The service is
pretty good, but hard to maintain for two reasons:

* The XML::RPC server is very heavy-weight.
   * I'd hope that node.js will be more efficient.
* The XML::RPC server has "issues" with UTF-8.
   * This causes 1/1000 messages to crash the server.
   * Again I hope node.js will sidestep this issue.

This javascript port of the service is aimed at replacing the existing XML::RPC
interface in time.  (The XML::RPC method will have to remain for backward compatibility
but it will become a mere shim/proxy around the node.js version.)


Wordpress Plugin
----------------

I've hacked together a minimal [Wordpress](http://wordpress.org/) plugin which will query comments in real-time against the production deployment of this server.

You can find the source code and installation instructions within the github repository:

* https://github.com/skx/blogspam-wordpress-plugin


API
---

The [API is documented online](http://blogspam.net/api/2.0), and contains three
end-points:

* A location for SPAM testing incoming JSON-encoded data.
* A locaiton for retrieving statistics.
* A location for retrieving plugin-names/data.

The main API is the spam-testing one, and that is the only one documented here.
The spam-testing API should receive JSON-encoded hash, via a HTTP POST.

Permitted hash fields are:

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
   * A link to your site, which can be later-used to lookup your SPAM/OK stats.
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
   * The comment is undecided, keep processing by invoking all remaining plugins.

A spam or ham result terminates the processing, avoiding later plugins.  **NOTE**: This means
you **must** have 99-ok.js, or similar plugin, so that the final result is OK.

The actual result of the testing will be returned to the caller in the form of :

* A HTTP status code
   * 200 for SPAM/OK
   * 405 for invalid submissions.
   * 500 for server errors.
* A JSON body.
   * The JSON body will be a hash containing the key "`result`", as well as other optional keys.



Deployment
----------

The code is designed to run directly from a git checkout, with no need to install it system-wide.  The only service dependency is an instance of the [redis](http://redis.io) which is assumed to run on the localhost.

However we do rely upon a couple of external `node.js` libraries, and there are two ways you can
install these:

1.  Using the `npm` tool.
2.  Using git submodules.

If you wish to use `npm` just run the following after cloning the `blogspam.js` repository:

      $ npm install

If you prefer to checkout the code locally run instead:

      $ git submodule init
      Submodule 'submodules/async' () registered for path 'submodules/async'
      Submodule 'submodules/node_redis' () registered for path 'submodules/node_redis'
      ..

      $ git submodule update
      ..
      ..

Now you've installed the dependencies, by one method or another, you can launch the server.
In one terminal run the main script:

     node server.js

In another run the test-cases by running:

     cd ./tests/
     ./run-tests

This will fire off some pre-cooked comments, and compare the results of the testing
against the expected result.  If you see errors which are surprising then you can
run a single case explicitly:


     ./run-tests --test ./exclude-plugins.test  [--verbose]


Utilities
---------

There are a couple of perl utility scripts located beneath `./utils`.  In brief these are:

* `dump`
   * When run with no arguments dump the JSON hash keys of the last few submissions.
   * When run with a hash key as an argument it will instead show the value received for that hash-key.
* `stats`
   * For each named URL on the command line show the SPAM/OK results for that site.
* `submitJSON`
   * A simple programming sample, showing how to submit a comment for testing.
   * Other examples are included in the [online code samples area](http://blogspam.net/code/samples/).

Current Status
--------------

The current code is now in production use at http://blogspam.net/ and
appears to be working very well.


Steve
--
