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
        path: mc.config.mqtt.path,
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
  template: `<div class="w3-row">
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
    
      <span class="w3-col s6">Config</span>
      <div class="w3-col s12">
        <label class="w3-text-gray">Host</label>
        <input class="w3-input w3-border" type="text" v-model="mqtt_config.host" placeholder="hostname">
        <label class="w3-text-gray">Port</label>
        <input class="w3-input w3-border" type="text" v-model.number="mqtt_config.port" placeholder="port">
        <label class="w3-text-gray">Path</label>
        <input class="w3-input w3-border" type="text" v-model="mqtt_config.path" placeholder="path">
        <label class="w3-text-gray">Username</label>
        <input class="w3-input w3-border" type="text" v-model="mqtt_config.username" placeholder="username">
        <label class="w3-text-gray">Password</label>
        <input class="w3-input w3-border" type="text" v-model="mqtt_config.password" placeholder="password">
        <button v-on:click="configureTestServer">Set test server</button>
        <button v-on:click="connect">Connect to server</button>
        
        <div class="">
          <label class="">Load Topic Config</label>
          <select class="w3-select w3-border" v-model="selected_topic" @change="topicselected">
            <option v-for="page in pages" v-bind:value="page.source">
              {{ page.source }}
            </option>
          </select>
        </div>
        <input class="w3-input w3-border" type="text" v-model="page.topic" placeholder="Topic">
        <textarea class = "w3-input" style = "width:100%; height: 300px" v-model="page.definition" placeholder="Page definition"></textarea>
        <button v-on:click="publish">Store config</button>
        
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
    configureTestServer: function() {
      this.mqtt_config.host="broker.hivemq.com";
      this.mqtt_config.port=8000;
      this.mqtt_config.path="/mqtt";
      this.mqtt_config.username=null;
      this.mqtt_config.password=null;
      this.page.topic="mycuttie/main/page";
      this.page.definition=`{
  "name": "Test Dashboard",
  "shortname": "main",
  "rank": 1,
  "type": "mc-page",
  "cards": [
    { "name": "Wohnzimmer",
      "type": "mc-card",
      "units": [
        {
          "name": "Rolladen",
          "type": "mc-dropdown",
          "topic_get": "test/rolladen/get/level",
          "topic_set": "test/rolladen/set/level",
          "options": [
            { "text": "geöffnet", "value": "geoeffnet" },
            { "text": "halb", "value": "halb" },
            { "text": "geschlossen", "value": "geschlossen" }
          ]
        },
        {
          "name": "Licht",
          "type": "mc-switch",
          "topic_get": "test/licht/get/state",
          "topic_set": "test/licht/set/state"
        }
      ]
    },
    { "name": "Wohnzimmer Kopie",
      "type": "mc-card",
      "units": [
        {
          "name": "Rolladen",
          "type": "mc-dropdown",
          "topic_get": "test/rolladen/set/level",
          "topic_set": "test/rolladen/get/level",
          "options": [
            { "text": "geöffnet", "value": "geoeffnet" },
            { "text": "halb", "value": "halb" },
            { "text": "geschlossen", "value": "geschlossen" }
          ]
        },
        {
          "name": "Licht",
          "type": "mc-switch",
          "topic_get": "test/licht/set/state",
          "topic_set": "test/licht/get/state"
        }
      ]
    }
  ]
}`;
    },
    connect: function() {
      console.log("Clicekd");
      mc.config.mqtt = {
        host: this.mqtt_config.host,
        port: this.mqtt_config.port,
        path: this.mqtt_config.path,
        username: this.mqtt_config.username,
        password: this.mqtt_config.password
      };
      mc.saveConfig();
    },
    publish: function() {
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
      mc.mqtt.publish(this.page.topic, this.page.definition, {retained: true})
    }
  }
})
