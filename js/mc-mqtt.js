mc.mqtt = (function () {
  
  if (!mc.config.hasOwnProperty("mqtt")) {
    mc.config.mqtt={};
  }
  
    var client = null;
    
    var state= {connected:false};

    var publish_stack=[];

    var mqttWildcard=function(topic, wildcard) { 
      if (topic === wildcard) {
          return true;
      } else if (wildcard === '#') {
          return true;
      }

      var t = String(topic).split('/');
      var w = String(wildcard).split('/');

      var i = 0;
      for (var lt = t.length; i < lt; i++) {
        if (w[i] === '#') {
            return true;
        } else if (w[i] === '+') {
            //OK
        } else if (w[i] !== t[i]) {
            return null;
        }
      }

      if (w[i] === '#') {
          i += 1;
      }

      return (i === w.length);
    }
    
    
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
      var found=false;
      for (var wildcard in this.list){
        if (this.list.hasOwnProperty(wildcard)){
          if (mqttWildcard(topic, wildcard)) {
            found=true;
            for (var i=0; i<this.list[wildcard].length; i++) {
              this.list[wildcard][i]({topic: topic, payload:payload});
            }
          }
        }
      }
      if (!found) {
        console.log("No handler found for topic " + topic);
      }
    }
    
    var dispatcher=new Dispatcher();
    
    
    var onConnectionLost = function (responseObject) {
      if (responseObject.errorCode !== 0) {
        state.connected=false;
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
      state.connected=true;
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
    
    var validateConfig= function() {
      return ( (typeof mc.config.mqtt.host == "string") && (typeof mc.config.mqtt.port == "number") && (typeof mc.config.mqtt.path == "string") );
    }
    
    
    var connect= function() {
      
      if (client) {
        client.disconnect();
      }
      state.connected=false;
      
      if ( validateConfig() ) {
        client = new Paho.Client(mc.config.mqtt.host, mc.config.mqtt.port, mc.config.mqtt.path, "");
        client.onMessageArrived=onMessageArrived;
        client.onConnectionLost=onConnectionLost;
        
        client.connect({
          reconnect:true,
          onSuccess: onSuccess,
          useSSL: (mc.config.mqtt.useSSL==true)
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
      if (state.connected) {
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
      
      if (state.connected) {
        client.subscribe(topic);
      }
      return subscription;
    }
    

    
    var handleVisibilityChange = function() {
      if (document.hidden) {
        console.log("hidden");
      } else  {
        console.log("shown");
        if (!state.connected) {
          connect();
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange, false);
    
    return {
      validateConfig: validateConfig,
      connect: connect,
      subscribe: subscribe,
      publish: publish,
      state: state
    };

})();
