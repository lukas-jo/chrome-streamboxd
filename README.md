
# chrome-streamboxd

This chrome extension shows on a Letterboxd film page where this film can be streamed

## About

While Letterboxd already shows where a film can be streamed, this only counts for the USA. This extension allows everyone to see where a film can be streamed in their respective country.

![](https://image.prntscr.com/image/zW7PKzOlQ8et-FXENm3JJA.png =450x)

## Install

 1. Clone this repository or download the zip & unpack it
 2. go to [chrome://extensions](chrome://extensions) and enable Developer Mode
 3. Click 'Load Unpacked' and select the chrome-streamboxd folder
 4. Done


## Test

This Extension uses the node package [justwatch-api](https://github.com/lufinkey/node-justwatch-api) which is a wrapper for the API of justwatch.com. [Browserify](http://browserify.org/) was used to allow the node package to be used in the browser.
