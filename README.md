
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
   * 403 for SPAM
   * 200 for OK
* A single line of text
   * Confirming "OK", or declaring the reason for the rejection

**NOTE**: This means you **must** to have 99-ok.js, or similar, so that the final result is OK.


Current Status
--------------

The current code is just a proof of concept.  It has a ropy plugin-system which needs
converting to using "real" javascript objects.

I can replay real comments to this server for testing purposes though, which will allow
me to directly compare load, and reliability.


Submissions Welcome
-------------------

The biggest drawback to the current code is that it lacks the majority of the plugins
which the live version of the blogspam service contains.

If you wish to contribute a plugin please do, either ported or distinct and new.



Deployment
----------

This will sit behind Apache/nginx/whatever and will handle POSTs to paths
such as /api/2.0/

We want to version requests so that we don't back ourselves into a corner in the future.


TODO
----

* Port all missing plugins.
* Add new ones.
* Change the return-handling, as per feedback from Steven C.
   * Return a JSON array.  At least two members "Result" and "Reason".

Steve
--
