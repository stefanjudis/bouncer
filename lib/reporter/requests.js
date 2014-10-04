var Reporter = function( url ) {
  var now = + ( new Date () );
  this.blockedUrl = url || '';

  this.requests = [];
  this.report = {
    allowed3rd  : url,
    countByType : {
      all : 0
    },
    events : {
      load     : now
    }
    // weightByType : {
    //   all : 0
    // }
  };
};

Reporter.prototype.add = function( request ) {
  if ( typeof this.report.countByType[ request.type ] === 'undefined' ) {
    this.report.countByType[ request.type ] = 0;
  }

  // if ( typeof this.report.weightByType[ request.type ] === 'undefined' ) {
  //   this.report.weightByType[ request.type ] = 0;
  // }

  ++this.report.countByType.all;
  ++this.report.countByType[ request.type ];

  // this.report.weightByType.all += request.response.headers[ 'Content-Length' ];
  // this.report.weightByType[ request.type] += request.response.headers[ 'Content-Length' ];

  this.requests.push( request );
};

Reporter.prototype.getBlockedUrl = function() {
  return this.blockedUrl;
}

Reporter.prototype.getReport = function() {
  return this.report;
};

Reporter.prototype.setPageLoadTimestamp = function( timestamp ) {
  this.report.events.load = timestamp - this.report.events.load;
};

module.exports = Reporter;
