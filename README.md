
JSON BlogSpam Service
---------------------

This node.js server implements the [BlogSpam.net](http://blogspam.net) v2 API.

The blogspam API & service allows site-owners to test incoming blog/forum comments for SPAM in real-time.

The original (v1) blogspam API was written in Perl and used XML::RPC as thetransport mechanism, that code is available
[on CPAN](http://search.cpan.org/dist/Blog-Spam/), but has been depreciated
and replaced by this new API/implementation.

In brief:

* Comment-submissions are accepted via JSON-encoded submissions over HTTP.
* Those submission will be tested by a series of plugins.
* The result will be returned as a JSON hash containing a results key declaring "`SPAM`" or "`OK`".
    * There may be other keys in the result, such as "`reason`" which declares the reason for a SPAM result, however these are optional.

There are clients for this server-API available for several applications including Trac, IkiWiki, and also [a wordpress plugin](https://github.com/skx/blogspam-wordpress-plugin).

History
-------

I started the http://blogspam.net/ service a few years ago to handle the spammy
comments which were received upon the [Debian Administration](http://www.debian-administration.org/) website.

The comments that were spammy were a pain to deal with, but at the same
time they weren't really specific to the site.  The idea of abstracting
away the spam testing from the site was appealing.

Since then I've added support for the remote service to many other of my sites,
and also made it generally available to the internet at large.  The service was
pretty good, but became hard to maintain for two main reasons:

* The XML::RPC server is very heavy-weight.
   * The node.js replacement performs significantly better.
* The XML::RPC server has "issues" with UTF-8.
   * This causes 1/1000 messages to crash the server.
   * In practice the node.js replacement has sidestepped this issue completely.

This javascript port of the service replaces the legacy API and suffers
from none of the drawbacks.  For compatibility there exists [an XML::RPC proxy](https://github.com/skx/blogspam-xml-rpc-proxy)
but this is no longer deployed live, as the old API has been retired.



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
* A location for retrieving statistics.
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

Plugins are loaded when the server starts up from beneath:

* `plugins/`
* `plugins.local/`
   * If this directory exists.

The individual plugins can handle the results by calling one of the three call-back
methods it receives:

* `spam`
   * The comment is definitely SPAM.
* `ham`
   * The comment is definitely HAM.
* `next`
   * The comment is undecided, keep processing by invoking all remaining plugins.

A spam or ham result terminates the processing, avoiding later plugins.

> **NOTE**: This means you **must** have 99-ok.js, or similar plugin, so that the final result is OK.

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

> **NOTE**: You can specify the address of your redis-server in the `config.js` file if it runs on a different host/port.

The server relies upon a small number of `node.js` libraries, which you can install with:

      $ npm install

Now you've installed the dependencies  you can launch the server.

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



Steve
--
