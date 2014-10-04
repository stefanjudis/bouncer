![image](./bouncer.jpg)

## Bouncer

### Tool to evaluate the impact of loaded 3rd party scripts

#### How does it work?

Bouncer will kick off a HTTP proxy and will loaded your site via Google Chrome. In the first run Bouncer will evaluate which assets are loaded that are actually not included in the allowed resource list.

Afterwards the proxy configuration will be changed to allow 3rd party after 3rd party to be loaded. For each seperate 3rd party its impact regarding requests and page loadtime will be evaluated.

#### Installation

```
npm install 3rd-party-bouncer
```

#### Usage

First you have to launch Google Chrome with `remote-debugging` flag, to allow remote debugging.

```
sudo /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 ----disable-cache
```


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

