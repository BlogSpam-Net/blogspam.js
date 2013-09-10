#!/usr/bin/perl

use LWP::Simple;
use JSON;

use strict;
use warnings;


my $uri = 'http://localhost:8888/';

my %data;
$data{'name'} = 'Steve Kemp';
#$data{'email'} = 'steve@example.com';
$data{'ip'} = '109.194.111.184';

$data{'body'} = '<p>This is my body ..</p>';
my $json = encode_json \%data;


my $req = HTTP::Request->new( 'POST', $uri );
$req->header( 'Content-Type' => 'application/json' );
$req->content( $json );


my $lwp = LWP::UserAgent->new;
my $response = $lwp->request( $req );

print $response->code . " " . $response->decoded_content . "\n";
