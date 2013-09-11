#!/usr/bin/perl
#
# Submit a comment-test request to the local-host.
#
# This is a standalone script which is designed to be simple to
# understand and modify for real usage, rather than a complete
# test of the server.
#
# For server-tests please see ./tests/
#
# Steve
#

use LWP::Simple;
use JSON;

use strict;
use warnings;


#
# The location of the server we're going to test-against
#
my $uri = 'http://localhost:8888/';

#
#  The data we'll send to the testing service.
#
my %data;
$data{'name'}    = 'Steve Kemp';
$data{'email'}   = 'steve@moi.com';
$data{'options'} = "whitelist=127.0.0.1,mandatory=subject,mandatory=comment";
$data{'ip'}      = '124.132.111.144';
$data{'comment'} = '<p>This is my body ..</p>';
$data{'subject'} = "This is the comment subject";


#
#  Encode the hash prior to submission.
#
#  The server expects JSON.
#
my $json = encode_json \%data;


#
#  We're going to use a HTTP POST.
#
my $req = HTTP::Request->new( 'POST', $uri );
$req->header( 'Content-Type' => 'application/json' );
$req->content( $json );

#
#  Send the request.
#
my $lwp = LWP::UserAgent->new;
my $response = $lwp->request( $req );

#
#  Show the result which was received.
#
print $response->code . " " . $response->decoded_content . "\n";
