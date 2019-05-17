mycuttie
========

mycuttie is a web dashboard for home automation projects using MQTT.
The main advantage is, that it doesn't need any additional backend software. It uses websockets to communicate with the MQTT broker. Websockets are supported by e.g. mosquitto. In addition, mosquitto can serve web pages via http.

Demo
----
Just head over to [https://avanc.github.io/mycuttie](https://avanc.github.io/mycuttie), click the connection icon on the top left and configure the MQTT server. For testing, you can set a default public server.

While opening the page in Chrome on Android, you can add it to the main screen as web app.

Note: As the github.io page is provided encrypted using https, the MQTT server also has to be encrypted using SSL/TLS. If your MQTT server does not allow secure connections, just install mycuttie locally (see below).

Installation
------------
mycuttie is _just_ a plain web page. Thus, it can be served by any webserver. Following is an example on how to use moqsuitto to serve the mycuttie webpages:

Clone mycuttie:

    cd /my/path/to
    git clone https://github.com/avanc/mycuttie

Configure mosquitto in mosquitto.conf to allow websocket connections and serve the webpage from /my/path/to/mycuttie:

    listener 9001
    protocol websockets
    http_dir /my/path/to/mycuttie

Now you can access mycuttie by browsing [http://yourserver:9001](http://yourserver:9001).
