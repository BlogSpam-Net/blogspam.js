Plugin Directory
----------------

This directory contains plugins for the blogspam detection service.

Each plugin is loaded when the server launches, and when a new submission
of JSON data is received each will be invoked in turn - unless a prior
plugin has decided a submission is definitely-spam, or definitely-OK.

The naming/ordering of the plugins is solely designed to complete the
"cheaper" tests first.

For example analysis of the submission is cheaper than making a DNS request,
while making DNS request is cheaper than making a HTTP request.


API
---

`void init()`
Called once at server-start time, if it exists.

`void testJSON(obj, spam, ham, next)`
Called each time there is a new JSON submission to test.

The arguments are:

* `obj`
   * The JSON object to be tested.
* `spam`
   * A call-back to invoke if the submission is definitely SPAM.
* `ham`
   * A call-back to invoke if the submission is definitely OK.
* `next`
   * A call-back to invoke if the submission cannot be judged.


The obj-object contains the submitted data from the remote-caller
as well as a handle to the redis server:

    var redis = obj['_redis']


