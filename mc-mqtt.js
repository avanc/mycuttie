mc.mqtt = (function () {
  
  if (!mc.config.hasOwnProperty("mqtt")) {
    mc.config.mqtt={};
  }
  
    var client = null;
    
    var connected=false;

    var publish_stack=[];

    var Dispatcher = function() {
      this.list={}
    };
    
    Dispatcher.prototype.add = function(topic, callback) {
      if (!this.list.hasOwnProperty(topic)){
        this.list[topic]=[];
      }
      
      var callbacks=this.list[topic];
      callbacks.push(callback);
      console.log(callbacks.length + " callbacks registered for topic " + topic);
      
      var remove = function() {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
      
      return {remove: remove};
    }
    
    Dispatcher.prototype.call = function(topic, payload) {
      if (this.list.hasOwnProperty(topic)){
        for (var i=0; i<this.list[topic].length; i++) {
          this.list[topic][i]({topic: topic, payload:payload});
        }
      }
      else {
        console.log("No receiver for topic " + message.destinationName);
      }
    }
    
    var dispatcher=new Dispatcher();
    
    
    var onConnectionLost = function (responseObject) {
      if (responseObject.errorCode !== 0) {
        connected=false;
        console.log("onConnectionLost:"+responseObject.errorMessage);
      }
    }

    var onMessageArrived = function (message) {
      console.log("Received: " + message.destinationName + " : " + message.payloadString);
      var data=message.payloadString;
      try {
        data=JSON.parse(data);
      } catch (e) {
        //not a valid JSON, thus using data as string
      }
      dispatcher.call(message.destinationName, data);
    }

    var onSuccess = function() {
      connected=true;
      console.log("Connected");
      for (var topic in dispatcher.list) {
        if (dispatcher.list.hasOwnProperty(topic)) {
          console.log("Subscribe " + topic);
          client.subscribe(topic);
        }
      }
      
      while (publish_stack.length >0) {
        var data= publish_stack.pop();
        var qos=0;
        var retained=false;
        if(data.config && data.config.hasOwnProperty("retained") && data.config.retained) {
          retained=true;
        }
        console.log("Publish " + data.topic + " : " + data.data);
        client.send(data.topic, data.data, qos, retained);
      }
    }
    
    var connect= function() {
      console.log(typeof mc.config.mqtt.host);
      console.log(typeof mc.config.mqtt.port);
      console.log(typeof mc.config.mqtt.path);
      
      if ( (typeof mc.config.mqtt.host == "string") && (typeof mc.config.mqtt.port == "number") && (typeof mc.config.mqtt.path == "string") ) {
        client = new Paho.Client(mc.config.mqtt.host, mc.config.mqtt.port, mc.config.mqtt.path, "");
        client.onMessageArrived=onMessageArrived;
        client.onConnectionLost=onConnectionLost;
        
        client.connect({
          reconnect:true,
          onSuccess: onSuccess
        });
      } else {
        console.log("mqtt: no valid config");
      }
    }
    
    var publish=function(topic, data, config){
      var json_data=data;
      var qos=0;
      var retained=false;
      if(config && config.hasOwnProperty("retained") && config.retained) {
        retained=true;
      }
      
      console.log(typeof data);
      if (typeof data != "string"){
        json_data=JSON.stringify(data);
      }
      if (connected) {
        console.log("Publish " + topic + " : " + json_data);
        client.send(topic, json_data, qos, retained);
      }
      else if(config && config.hasOwnProperty("await") && config.await) {
        publish_stack.push({topic: topic, data: json_data, config: config});
      }
      else {
        console.log("Not published, as not connected to a broker.");
      }
    }
    
    var subscribe=function(topic, callback){
      console.log("Subscribe " + topic);
      var subscription = dispatcher.add(topic, callback);
      
      if (connected) {
        client.subscribe(topic);
      }
      return subscription;
    }
    
    return {
      connect: connect,
      subscribe: subscribe,
      publish: publish
    };

})();
