#!/usr/bin/perl

use LWP::Simple;
use JSON;

use strict;
use warnings;


my $uri = 'http://localhost:8888/';

#
#  The data we'll send to the testing service.
#
my %data;
$data{'name'}    = 'Steve Kemp';
$data{'email'}   = 'steve@moi.com';
$data{'options'} = "whitelist=127.0.0.1,mandatory=subject,mandatory=comment";
$data{'ip'}      = '109.194.111.144';
$data{'comment'} = '<p>This is my body ..</p>';
$data{'subject'} = "This is the comment subject";

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
