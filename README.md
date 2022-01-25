# Telescope Monitoring

<img align="right" src="/.doc/telescopeMonitoring2.png" width="450"></img>
Web browser application providing a user-friendly interface to monitor various kind of telemetry data produced by a remote device.<br>
I made this application on demand, as a monitoring platform for a telescope in a NASA project (see below). <br>
Unfortunately, this mission was not executed and so this application wasn't used in real scenario. <br>

Please click here for [full video presentation of the application (13 minutes)](https://youtu.be/4Kk7DvttR24).

## About the NASA project
**web:** https://techport.nasa.gov/view/94313 <br>
**contact person:** Viliam Klein, viliam.klein@gmail.com, +1 303-827-6422 <br>

## Publicly available<br>
Application is available online for anybody who would like to try it out. If you are interested, please visit this page: <https://87.197.183.237:5444>. <br>
Your browser might alert you about untrusted connection certificate, please confirm an exception for this certificate to proceed. <br>
To start the application, please log in using the following credentials:<br>
```
visitor
1:OgaI82LKvjsd82/sk2F
```
## Tools used
* [Angular 8](https://angular.io/), [Node.js](https://nodejs.org), [MySQL](https://www.mysql.com/)
* maps were created using [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org)
* graphs were created using [Dygraphs](http://dygraphs.com/)

## This code repository
Full source code of this project can be found in this repository.<br>
* [app-developement](https://github.com/MarekDrabik/TelescopeMonitoring/tree/master/app-developement) - Typescript source code of Angular web application before compilation
* [server-public](https://github.com/MarekDrabik/TelescopeMonitoring/tree/master/server-public/app) - public Node.js web server, as well as data server providing communication between client and remote device
