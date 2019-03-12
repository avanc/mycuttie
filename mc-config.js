if (!mc.hasOwnProperty("vue")) {
  mc.vue={};
}

mc.vue.config = Vue.extend({
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
        definition: JSON.stringify(mc.config.pages[0], null, 2),
        topic: mc.config.pages[0].source
      }
    }
  },
  template: `<div class="w3-row">
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
        
        <input class="w3-input w3-border" type="text" v-model="page.topic" placeholder="Topic">
        <textarea class = "w3-input" style = "width:100%; height: 300px" v-model="page.definition" placeholder="Page definition"></textarea>
        <button v-on:click="publish">Store config</button>
        
      </div>
    </div>`,
  methods: {
    configureTestServer: function() {
      this.mqtt_config.host="broker.hivemq.com";
      this.mqtt_config.port=8000;
      this.mqtt_config.path="/mqtt";
      this.mqtt_config.username=null;
      this.mqtt_config.password=null;
      this.page.topic="mycutie/main/page";
      this.page.definition=`{
  "name": "Test Dashboard",
  "shortname": "main",
  "rank": 1, // Rank for sorting pages in the link list
  "type": "mc-page",
  "cards": [
    { "name": "Wohnzimmer",
      "type": "mc-card",
      "units": [
        {
          "name": "Rolladen",
          "type": "mc-dropdown",
          "topic_get": "test/rolladen/get/state",
          "topic_set": "test/rolladen/set/state",
          "value": undefined,
          "options": [
            { "text": 'geöffnet', "value": 'geoeffnet' },
            { "text": 'halb', "value": 'halb' },
            { "text": 'geschlossen', "value": 'geschlossen' }
          ]
        },
        {
          "name": "Licht",
          "type": "mc-switch",
          "value": undefined,
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
          "topic_get": "test/rolladen/set/state",
          "topic_set": "test/rolladen/get/state",
          "value": undefined,
          "options": [
            { "text": 'geöffnet', "value": 'geoeffnet' },
            { "text": 'halb', "value": 'halb' },
            { "text": 'geschlossen', "value": 'geschlossen' }
          ]
        },
        {
          "name": "Licht",
          "type": "mc-switch",
          "value": undefined,
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
        mc.mqtt.publish(this.page.topic, this.page.definition, {retained: true})
      } catch (e) {
        console.log("Invalid JSON")
        console.log(e)
        
      }
    }
  }
})
