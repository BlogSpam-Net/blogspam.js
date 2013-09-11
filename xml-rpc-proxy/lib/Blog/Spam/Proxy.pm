
=head1 NAME

Blog::Spam::Proxy - An RPC server which detects comment spam.

=cut

=head1 ABOUT

This module is a hacked-up version of the module which is contained in the
BlogSpam package on CPAN:

=over 8

    http://search.cpan.org/~skx/Blog-Spam/

=back

Rather than detecting SPAM via a series of plugin-tests this module is
nothing more than a wrapper around the JSON+HTTP service implemented in
node.js.

=cut

=head1 AUTHOR

=over 4

=item Steve Kemp

http://www.steve.org.uk/

=back

=cut


=head1 LICENSE

Copyright (c) 2008-2013 by Steve Kemp.  All rights reserved.

This module is free software;
you can redistribute it and/or modify it under
the same terms as Perl itself.
The LICENSE file contains the full text of the license.

=cut


package Blog::Spam::Proxy;


use vars qw($VERSION);
our $VERSION = "1.0.2";

#
#  The modules we require
#
use Sys::Syslog qw(:standard :macros);
$RPC::XML::ENCODING = 'utf-8';

use RPC::XML::Server;
use LWP::Simple;
use JSON;



#
#  Standard pragmas.
#
use strict;
use warnings;




=begin doc

Create a new instance of this object.

=end doc

=cut

sub new
{
    my ( $proto, %supplied ) = (@_);
    my $class = ref($proto) || $proto;

    my $self = {};

    #
    #  Allow user supplied values to override our defaults
    #
    foreach my $key ( keys %supplied )
    {
        $self->{ lc $key } = $supplied{ $key };
    }

    #
    #  The JSON server we proxy to.
    #
    $self->{ 'json' } = 'http://localhost:9999/';

    #
    #  Open syslog
    #
    my $name = $0;
    $name = $2 if ( $name =~ /(.*)\/(.*)$/ );
    openlog( $name, "pid", "local0" );

    bless( $self, $class );

    return $self;

}



=begin doc

Create our child XML-RPC server.

=end doc

=cut

sub createServer
{
    my ( $self, %params ) = (@_);

    my %options = ();
    $options{ 'port' } = $params{ 'port' } || 8888;
    $options{ 'host' } = $params{ 'host' } if ( $params{ 'host' } );

    $self->{ 'verbose' } && print "Creating RPC server.\n";

    #
    # Create the server object.
    #
    $self->{ 'daemon' } = RPC::XML::Server->new(%options);

    #
    # Did we fail to bind?
    #
    if ( ( !$self->{ 'daemon' } ) ||
         ( !$self->{ 'daemon' }->can("add_method") ) )
    {
        print "ERROR: Failed to bind!\n";
        return undef;
    }

    $self->{ 'verbose' } && print "Adding RPC methods.\n";

    #
    # Add our 'testComment' method.
    #
    $self->{ 'daemon' }->add_method( {
          name      => 'testComment',
          signature => ['string struct'],
          code      => sub {$self->testComment(@_)}
        } );

    #
    # Add our (re)train comment method
    #
    $self->{ 'daemon' }->add_method( {
          name      => 'classifyComment',
          signature => ['string struct'],
          code      => sub {$self->classifyComment(@_)}
        } );

    #
    # Add our 'getStats' method.
    #
    $self->{ 'daemon' }->add_method( {
          name      => 'getStats',
          signature => ['struct string'],
          code      => sub {$self->getStats(@_)}
        } );


}




=begin doc

Run the main loop of our L<RPC::XML::Server> object and don't return.

=end doc

=cut

sub runLoop
{
    my ($self) = (@_);

    $self->{ 'verbose' } && print "Starting server loop\n";

    if ( ( !$self->{ 'daemon' } ) ||
         ( !$self->{ 'daemon' }->can("add_method") ) )
    {
        print "ERROR: Server not loaded!\n";
        return undef;
    }

    $self->{ 'daemon' }->server_loop();

}




=begin doc

This method is invoked for each incoming SPAM-testing submission.

It receives the parameters and proxies them to the JSON server we
have running on the localhost.

=end doc

=cut

sub testComment
{
    my ( $self, $xmlrpc, $struct ) = (@_);

    #
    #  The parameters the user submitted, as a hash so
    # they're easy to work with.
    #
    my %struct;

    #
    #  Copy each supplied value to the struct we'll use
    # from here on in - but lower-case the key-names.
    #
    foreach my $key ( keys %$struct )
    {
        my $lkey = lc($key);

        $struct{ $lkey } = $struct->{ $key };
    }

    #
    #  Log the peer.
    #
    if ( $xmlrpc->{ 'peerhost' } )
    {
        $struct{ 'peer' } = $xmlrpc->{ 'peerhost' };

        $self->{ 'verbose' } &&
          print "Connection from " . $struct{ 'peer' } . "\n";

    }


    ##
    ##  Send %struct to our JSON server, and return the result.
    ##
    #
    # The location of the server we're going to test-against
    #
    my $uri = $self->{ 'json' };

    #
    #  JSON-encode the hash prior to submission.
    #
    my $json = encode_json \%struct;


    #
    #  We're going to use a HTTP POST.
    #
    my $req = HTTP::Request->new( 'POST', $uri );
    $req->header( 'Content-Type' => 'application/json' );
    $req->content($json);

    #
    #  Send the request.
    #
    my $lwp      = LWP::UserAgent->new;
    my $response = $lwp->request($req);

    #
    #  Show the result which was received.
    #
    if ( $response->is_success() )
    {
        my $r = decode_json( $response->decoded_content );

        my $result = $r->{ 'result' } . ":";
        if ( $r->{ 'reason' } )
        {
            $result .= " ";
            $result .= $r->{ 'reason' };
        }
        return ($result);
    }
    else
    {
        return "ERROR: " . $response->decoded_content();
    }

}




=begin doc

NOP.

=end doc

=cut

sub classifyComment
{
    my ( $self, $xmlrpc, $struct ) = (@_);

    return ("NOP");
}


=begin doc

This method will return the SPAM/OK counts either globally or for the
given site.

=end doc

=cut

sub getStats
{
    my ( $self, $xmlrpc, $site ) = (@_);


    ##
    ##  Send %struct to our JSON server, and return the result.
    ##
    #
    # The location of the server we're going to test-against
    #
    my $uri = $self->{ 'json' } . "stats";

    #
    #  JSON-encode the hash prior to submission.
    #
    my %struct;
    $struct{ 'site' } = $site;

    my $json = encode_json \%struct;


    #
    #  We're going to use a HTTP POST.
    #
    my $req = HTTP::Request->new( 'POST', $uri );
    $req->header( 'Content-Type' => 'application/json' );
    $req->content($json);

    #
    #  Send the request.
    #
    my $lwp      = LWP::UserAgent->new;
    my $response = $lwp->request($req);

    #
    #  Show the result which was received.
    #
    if ( $response->is_success() )
    {
        my $r = decode_json( $response->decoded_content );
        my $results;
        $results->{ 'spam' } = $r->{ 'spam' } || 0;
        $results->{ 'ok' }   = $r->{ 'ok' }   || 0;
        return ($results);
    }
    else
    {
        my $results;
        $results->{ 'spam' } = 0;
        $results->{ 'ok' }   = 0;

        return ($results);
    }
}



1;