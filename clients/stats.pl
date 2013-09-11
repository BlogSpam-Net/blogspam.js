#!/usr/bin/perl
#
#  Submit a request to http://localhost:8888/stats to get the per-site stats.
#
#  NOTE: This is currently a nop.
#

use LWP::Simple;
use JSON;

use strict;
use warnings;


my $uri = 'http://localhost:8888/stats';

#
#  The data we'll send to the testing service.
#
my %data;
$data{'site'} = "http://www.debian-administration.org/";

#
#  Encode it.
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
#  Show the result
#
print $response->code . " " . $response->decoded_content . "\n";
