#!/usr/bin/perl
#
# Submit a statistics-request to the server.
#
# For example to lookup my stats:
#
#  ./stats --server=http://test.blogspam.net:9999/stats/ http://blog.steve.org.uk/
#
# Steve
# --

use Getopt::Long;
use JSON;
use LWP::Simple;

use strict;
use warnings;


#
#  Config
#
my %CONFIG;

#
#  Default server end-point.
#
$CONFIG{ 'server' } = "http://localhost:9999/stats/";


#
#  Parse our options
#
exit if ( !GetOptions( "server=s", \$CONFIG{ 'server' } ) );


#
#  For each named argument
#
foreach my $site (@ARGV)
{
    my %data;
    $data{ 'site' } = $site;

    print "Looking up stats for : $site\n";

    #
    #  Encode it.
    #
    my $json = encode_json \%data;

    #
    #  We're going to use a HTTP POST.
    #
    my $req = HTTP::Request->new( 'POST', $CONFIG{ 'server' } );
    $req->header( 'Content-Type' => 'application/json' );
    $req->content($json);

    #
    #  Send the request.
    #
    my $lwp      = LWP::UserAgent->new;
    my $response = $lwp->request($req);

    #
    #  Show the result
    #
    print $response->code . " " . $response->decoded_content . "\n";
}
