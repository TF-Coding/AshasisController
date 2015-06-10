# Ashasis-Controller

## Thanks to
- special thanks to original MySensors-Team for permission to use the library and providing the base NodeJsController
- the openHAB team for releasing their software as open-source
- arduino.cc for minimizing the hardware needs
- lemaker.org for allowing the commercial use and providing the Banana Pro for testing
- all other contributors, which are not named here

## Licensing
Released with GPLv3
more infos at http://www.gnu.org/licenses/gpl.html

## Install
- copy config.js.dist to config.js
- migrate tables.sql
- edit and set setting in it
- start via "./app", "npm start" or "node app"

## Web API (mostly for internal use; can be used externally)
REMARK:
- all requests are POST - one exception: /config
- POST bodies are always JSON encoded
- if auth is needed (config.webif.auth.enabled == true) just add to body JSON: {[...]auth: { username: "XXX", password: "YYY" },[...]}
- API url is prefixed with config.webif.root
- it's very likely to change in future version

(GET)   /config = returns some informations (e.g. if auth required)
(POST)  /mappings = SHOULD return all created mappings
(POST)  /auth = returns if auth is valid
(POST)  /openhab/push = relays data to openhabs' item (needed body data: item, value)
(POST)  /controller/push = relays data via gateway (needed body data: item, value)