if (!mc.hasOwnProperty("vue")) {
  mc.vue={};
}

mc.vue.config = Vue.extend({
  props: ["pages"],
  data: function () {
    return {
      mqtt_config: {
        host: mc.config.mqtt.host,
        port: mc.config.mqtt.port,
        ssl: mc.config.mqtt.useSSL,
        path: mc.config.mqtt.path,
        topic: mc.config.mqtt.topic,
        username: mc.config.mqtt.username,
        password: mc.config.mqtt.password
      },
      page: {
        definition: "",
        topic: ""
      },
      selected_topic: undefined,
      error: {
        title: "",
        text: ""
      }
    }
  },
  template: `
    <div class="w3-row">
      <div id="id01" class="w3-modal" style="display:block" v-show="error.title != ''">
        <div class="w3-modal-content w3-card-4">
          <header class="w3-container w3-red"> 
            <span v-on:click="error.title=''" 
            class="w3-button w3-display-topright">&times;</span>
            <h2>{{ error.title }}</h2>
          </header>
          <div class="w3-container">
            <p>{{ error.text}}.</p>
          </div>
        </div>
      </div>
    
      <div class="w3-container w3-theme-l2">
        <h3 class="w3-col">Config</h3>
      </div>
      
      <div class="w3-col s12 w3-container w3-theme-l4">
        <label class="w3-text-gray">Host</label>
        <input class="w3-input w3-border" type="text" v-model="mqtt_config.host" placeholder="hostname">
        <label class="w3-text-gray">Port</label>
        <input class="w3-input w3-border" type="text" v-model.number="mqtt_config.port" placeholder="port">
        <label class="w3-text-gray">SSL</label>
        <input class="w3-check" type="checkbox" v-model.number="mqtt_config.ssl"><br>
        <label class="w3-text-gray">Websocket Path</label>
        <input class="w3-input w3-border" type="text" v-model="mqtt_config.path" placeholder="path">
        <label class="w3-text-gray">Page Definition Topic</label>
        <input class="w3-input w3-border" type="text" v-model="mqtt_config.topic" placeholder="topic">
        <label class="w3-text-gray">Username</label>
        <input class="w3-input w3-border" type="text" v-model="mqtt_config.username" placeholder="username">
        <label class="w3-text-gray">Password</label>
        <input class="w3-input w3-border" type="text" v-model="mqtt_config.password" placeholder="password">
        <button v-on:click="setTestServer">Set test server</button>
        <button v-on:click="connect">Connect to server</button>
      </div>
      
      <div class="w3-container w3-theme-l2">
        <h3 class="w3-col">Edit page definition</h3>
      </div>
      
      <div class="w3-col s12 w3-container w3-theme-l4">
        <select class="w3-select w3-border" v-model="selected_topic" @change="topicselected">
          <option v-for="page in pages" v-bind:value="page.source">
            {{ page.source }}
          </option>
        </select>
        <input class="w3-input w3-border" type="text" v-model="page.topic" placeholder="Topic">
        <textarea class = "w3-input" style = "width:100%; height: 300px" v-model="page.definition" placeholder="Page definition"></textarea>
        <button v-on:click="setTestData">Set example page definition</button>
        <button v-on:click="publish">Store page definition</button>
      </div>    
    </div>`,
  methods: {
    topicselected: function() {
      this.page.topic=this.selected_topic;
      for (var i=0; i< this.pages.length; i++) {
        if (this.pages[i].source==this.selected_topic) {
          this.page.definition=JSON.stringify(this.pages[i], null, 2);
        }
      }
    },
    setTestServer: function() {
      this.mqtt_config.host="test.mosquitto.org";
      this.mqtt_config.port=8081;
      this.mqtt_config.ssl=true;
      this.mqtt_config.path="/mqtt";
      this.mqtt_config.topic="mycuttie/+/page";
      this.mqtt_config.username=null;
      this.mqtt_config.password=null;
    },
    setTestData: function() {
      this.page.topic="mycuttie/main/page";
      this.page.definition=`{
  "name": "Test Dashboard",
  "shortname": "main",
  "rank": 1,
  "version": 1.0,
  "type": "mc-page",
  "cards": [
    {
      "name": "Living Room",
      "type": "mc-card",
      "units": [
        {
          "name": "Roller Shutter",
          "type": "mc-dropdown",
          "topic_get": "test/shutter/get/level",
          "topic_set": "test/shutter/set/level",
          "options": [
            {
              "text": "Open",
              "value": "open"
            },
            {
              "text": "Half",
              "value": "half"
            },
            {
              "text": "Closed",
              "value": "closed"
            }
          ]
        },
        {
          "name": "Light",
          "type": "mc-switch",
          "topic_get": "test/light/get/state",
          "topic_set": "test/light/set/state"
        }
      ]
    },
    {
      "name": "Another Room",
      "type": "mc-card",
      "units": [
        {
          "name": "Dimmer",
          "type": "mc-slider",
          "topic_get": "test/light/get/level",
          "topic_set": "test/light/set/level",
          "range": {
            "min": 0,
            "max": 1,
            "step": 0.01
          }
        }
      ]
    },
    {
      "name": "Simulation",
      "type": "mc-card",
      "units": [
        {
          "name": "Roller Shutter Copy",
          "type": "mc-dropdown",
          "topic_get": "test/shutter/set/level",
          "topic_set": "test/shutter/get/level",
          "options": [
            {
              "text": "Open",
              "value": "open"
            },
            {
              "text": "Half",
              "value": "half"
            },
            {
              "text": "Closed",
              "value": "closed"
            }
          ]
        },
        {
          "name": "Light Copy",
          "type": "mc-switch",
          "topic_get": "test/light/set/state",
          "topic_set": "test/light/get/state"
        },
        {
          "name": "Dimmer Copy",
          "type": "mc-slider",
          "topic_get": "test/light/set/level",
          "topic_set": "test/light/get/level",
          "range": {
            "min": 0,
            "max": 1,
            "step": 0.01
          }
        },
        {
          "name": "Text",
          "type": "mc-text",
          "template": "The dimmer is at level $dimmerlevel and the shutter is $shutterstate.",
          "values": {
            "$dimmerlevel": "test/light/set/level",
            "$shutterstate": "test/shutter/set/level"
          }
        }
      ]
    }
  ]
}`;
    },
    connect: function() {
      mc.config.mqtt = {
        host: this.mqtt_config.host,
        port: this.mqtt_config.port,
        useSSL: this.mqtt_config.ssl,
        path: this.mqtt_config.path,
        topic: this.mqtt_config.topic,
        username: this.mqtt_config.username,
        password: this.mqtt_config.password
      };
      mc.saveConfig();
      mc.mqtt.connect();
    },
    publish: function() {
      if (this.page.definition != "") {
        try {
          // Test if valid JSON
          JSON.parse(this.page.definition);
        } catch (e) {
          console.log("Invalid JSON")
          //console.log(e)
          this.error.title="Invalid JSON configuration"
          this.error.text=e.message;
          return;
        }
      }
      mc.mqtt.publish(this.page.topic, this.page.definition, {retained: true})
    }
  }
})
