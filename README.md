![image](./bouncer.jpg)

## Bouncer

### Tool to evaluate the impact of loaded 3rd party scripts

#### Installation

```
npm install 3rd-party-bouncer
```

#### Usage

```
var Bouncer = require( '3rd-party-bouncer' );

var bouncer = new Bouncer( {
  proxy : {
    allowed : [
      '*.allowedScript1.com',
      '*.allowedScript2.com'
    ],
    port    : 8000,
    url     : 'http://yourWebsite.com'
  }
} );

bouncer.getReport( function( report ) {
  console.log( report );
} );
```

