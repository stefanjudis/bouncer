var Chrome   = require( 'chrome-remote-interface' );
var Proxy    = require( '3rd-party-bouncer-proxy' );
var Queue    = require( './lib/utils/queue' );
var Reporter = {
  requests : require( './lib/reporter/requests' )
};
var debug    = require( 'debug' )( 'BOUNCER' );
var _        = require( 'lodash' );


/**
 * Constructor
 * @param {Object} options options
 */
var Bouncer = function( options ) {
  this.options     = options;
  this.blockedUrls = [];
  this.report      = {
    requests : []
  };
  this.proxy       = new Proxy( options.proxy );
  this.queue       = new Queue();
  this.setupDone   = false;

};


Bouncer.prototype.getReport = function( callback ) {
  if ( typeof callback === 'function' ) {
    this.done = callback;
    this._setup();
  } else {
    throw new Error( 'No callback defined' );
  }
};


/**
 * Kick it off and evaluate given site
 * with different allowed third parties
 */
Bouncer.prototype._kickItOff = function() {
  debug( 'KickOff with following blocked urls: \n', this.blockedUrls.join( ', ' ) );

  _.each( this.blockedUrls, function( url ) {
    this.queue.push( function() {
      this._run( url );
    }.bind( this ) );
  }, this );
};


/**
 * Initial setup
 * - attach all the event handlers to Chrome
 */
Bouncer.prototype._setup = function() {
  Chrome( function ( chrome ) {
    debug( 'Chrome started' );
    this.chrome = chrome;

    this.chrome.Page.enable();
    this.chrome.Network.enable();
    this.chrome.Console.enable();


    /**
     * Add load event handler
     */
    this.chrome.on( 'Page.loadEventFired', function( timestamp ) {
      var currentReporter = this.report.requests[ this.report.requests.length - 1 ];
      var currentUrl = currentReporter.getBlockedUrl();

      currentReporter.setPageLoadTimestamp( + ( new Date() ) );

      debug(
        'Page loaded - Report: \n' +
        JSON.stringify(
          this.report.requests[ this.report.requests.length - 1 ].getReport(), null, 2
        )
      );

      if ( !this.setupDone ) {
        this.setupDone = true;

        this._kickItOff();
      } else {
        this.proxy.removeAllowedUrl( currentUrl, function( error, url ) {
          if ( error ) {
            throw new Error( error );
          }

          this.queue.pop();

          if ( this.queue.isEmpty() ) {
            this.done( this.report );
          }
        }, this );
      }
    }.bind( this ) );


    /**
     * Add response received handler
     */
    this.chrome.on( 'Network.responseReceived', function( req ) {
      this.report.requests[ this.report.requests.length - 1 ].add( req );
    }.bind( this) );


    /**
     * Add console message added handler
     */
    this.chrome.on( 'Console.messageAdded', function( msg ) {
      if ( !this.setupDune ) {
        var match = msg.message.text.match(
          /Refused to load the script \'http(s){0,1}:\/\/(.*?)\'.*/
        );

        if (
          msg.message.source === 'security' &&
          msg.message.level === 'error' &&
          match
        ) {
          // TODO make this with some regex magic
          var url = match[ 2 ].split( '/' )[ 0 ];

          if ( this.blockedUrls.indexOf( url ) === -1 ) {
            this.blockedUrls.push( url );
          }
        }
      }
    }.bind( this ) );


    // set new reporter and navigation to page
    this.report.requests.push( new Reporter.requests() );
    this.chrome.Page.navigate( { url : 'localhost:' + this.options.proxy.port } );
  }.bind( this ) )
};


/**
 * Run one page load
 * @param  {String} url [description]
 */
Bouncer.prototype._run = function( url ) {
  this.proxy.addAllowedUrl( url, function( error, url ) {
    this.report.requests.push( new Reporter.requests( url ) );

    this.chrome.Page.navigate( { url : 'localhost:' + this.options.proxy.port } );
  }, this );
};
