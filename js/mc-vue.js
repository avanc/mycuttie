if (!mc.hasOwnProperty("vue")) {
  mc.vue={};
}

mc.pd_version=1.0;

mc.vue.page = Vue.extend({
  props: ["data", "mqtt_state"],
  data: function () {
    return {
      error: {
        title: "",
        text: ""
      }
    }
  },
  watch: {
    "data": function(val){
    }
  },
  created: function() {
    this.checkVersion();
  },
  methods: {
    checkVersion: function() {
      var version=this.data.version;
      if (typeof version =="undefined") {
        version=0.0;
      }
      if (version<mc.pd_version) {
        this.error.title="Old page definition";
        this.error.text="This page definition uses an old schema (" + version + "). mycuttie is at schema version " + mc.pd_version + ".";
      }
      else if (version>mc.pd_version) {
        this.error.title="Old mycuttie";
        this.error.text="This page definition uses a newer schema (" + version + "). mycuttie is at schema version " + mc.pd_version + ". Please update mycuttie.";
      }
        
    }
  },
  template: `
    <div style="position:relative;">

      <div id="id01" class="w3-modal" style="display:block" v-show="error.title != ''">
        <div class="w3-modal-content w3-card-4">
          <header class="w3-container w3-red"> 
            <span v-on:click="error.title=''" 
            class="w3-button w3-display-topright">&times;</span>
            <h2>{{ error.title }}</h2>
          </header>
          <div class="w3-container">
            <p>{{ error.text }}</p>
          </div>
        </div>
      </div>
    
    
      <div v-show="!(mqtt_state.connected)" class="inactive overlay" style="background-color: white; opacity:0.85; position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index:1;"></div>
      <div class="w3-row-padding w3-stretch">
        <mc-card v-for="card in data.cards" v-bind:data="card"></> </mc-card>
      </div>
    </div>`
});
Vue.component('mc-page', mc.vue.page)

Vue.component('mc-card', {
  props: ["data"],
  template: `
    <div class="w3-third w3-margin-bottom">
      <div class="w3-container w3-theme-l2">
        <h3 class="w3-col">{{ data.name }}</h3>
      </div>
      <div class="w3-container w3-theme-l4">
        <component v-for="unit in data.units" v-bind:is="unit.type" v-bind:data="unit"></component><br>
      </div>      
    </div>`
})

Vue.component('mc-dropdown', {
  props: ["data"],
  data: function () {
    return {
      value: undefined,
      subscription: undefined
    }
  },
  watch: {
    "data.topic_get": function(val){
      console.log("get-topic changed");
      this.value=undefined;
      this.subscribe();
    }
  },
  created: function() {
    this.subscribe();
  },
  methods:{
    valueChanged: function() {
      mc.mqtt.publish(this.data.topic_set, this.value);
    },
    subscribe: function() {
      console.log(this.subscription)
      if (this.subscription){
        console.log("Removing subscription");
        this.subscription.remove();
      }
      
      console.log("Create callback for " + this.data.name);
      var context=this;
      var callback=function(data) {
        console.log("Data received for " + context.data.name);
        context.value=data.payload;
      };
      this.subscription=mc.mqtt.subscribe(this.data.topic_get, callback); 
    } 
  },
  template: `
    <div class="w3-cell-row w3-border-bottom">
      <label class="w3-cell w3-cell-middle">{{ data.name }}</label>
      <select class="w3-cell w3-cell-middle w3-select " v-model="value" @change="valueChanged">
        <option value="" disabled selected>Unbekannt</option>
        <option v-for="option in data.options" v-bind:value="option.value">
          {{ option.text }}
        </option>
      </select>
    </div>`
})

Vue.component('mc-switch', {
  props: ["data"],
  data: function () {
    return {
      value: undefined,
      subscription: undefined
    }
  },
  watch: {
    "data.topic_get": function(val){
      console.log("get-topic changed");
      this.value=undefined;
      this.subscribe();
    }
  },
  created: function() {
    this.subscribe();
  },
  methods:{
    valueChanged: function() {
      mc.mqtt.publish(this.data.topic_set, this.value);
    },
    subscribe: function() {
      console.log(this.subscription)
      if (this.subscription){
        console.log("Removing subscription");
        this.subscription.remove();
      }
      
      console.log("Create callback for " + this.data.name);
      var context=this;
      var callback=function(data) {
        console.log("Data received for " + context.data.name);
        context.value=data.payload;
      };
      this.subscription=mc.mqtt.subscribe(this.data.topic_get, callback); 
    } 
  },
  template: `
    <div class="w3-cell-row w3-border-bottom">
      <label class="w3-cell w3-cell-middle">{{ data.name }}</label>
      <label class="w3-cell w3-cell-middle switch">
        <input type="checkbox" v-model="value" @change="valueChanged">
        <span class="slider round"></span>
      </label>
    </div>`
})

Vue.component('mc-slider', {
  props: ["data"],
  data: function () {
    return {
      value: undefined,
      subscription: undefined
    }
  },
  watch: {
    "data.topic_get": function(val){
      console.log("get-topic changed");
      this.value=undefined;
      this.subscribe();
    }
  },
  created: function() {
    this.subscribe();
  },
  methods:{
    valueChanged: function() {
      mc.mqtt.publish(this.data.topic_set, this.value);
    },
    subscribe: function() {
      console.log(this.subscription)
      if (this.subscription){
        console.log("Removing subscription");
        this.subscription.remove();
      }
      
      console.log("Create callback for " + this.data.name);
      var context=this;
      var callback=function(data) {
        console.log("Data received for " + context.data.name);
        context.value=data.payload;
      };
      this.subscription=mc.mqtt.subscribe(this.data.topic_get, callback); 
    } 
  },
  template: `
    <div class="w3-cell-row w3-border-bottom">
      <label class="w3-cell w3-cell-middle">{{ data.name }}</label>
      <input class="w3-cell w3-cell-middle" type="range" v-bind:min="data.range.min" v-bind:max="data.range.max" v-bind:step="data.range.step" v-model="value" @change="valueChanged">
    </div>`
})

Vue.component('mc-text', {
  props: ["data"],
  data: function () {
    return {
      values: {},
      subscriptions: {}
    }
  },
  computed: {
    formattedText: function () {
      var formattedText=this.data.template;
      var templateAvailable=true;
      if (typeof formattedText == "undefined") {
        formattedText="";
        templateAvailable=false;
      }
      
      for (var key in this.values) {
        if (this.values.hasOwnProperty(key)) {
          if (templateAvailable) {
            formattedText = formattedText.replace(key, this.values[key]);
          }
          else {
            formattedText = formattedText + key + ": " + this.values[key] + "; ";
          }
        }
      }
      
      return formattedText;
    }
  },
  watch: {
    "data.topic_get": function(val){
      console.log("get-topic changed");
      this.value=undefined;
      this.subscribe();
    }
  },
  created: function() {
    this.subscribe();
  },
  methods:{
    subscribe: function() {

      for (var key in this.data.values) {
        if (this.data.values.hasOwnProperty(key)) {
//           if (this.subscriptions[key]){
//             console.log("Removing subscription");
//             this.subscription[key].remove();
//           }
          console.log("Create callback for " + key);
          this.$set(this.values, key, "");
          var callback = function(context, key){
            return function(data) {
              console.log("Data received for " + key);
              context.values[key]=data.payload;
            }
          }(this, key);
          this.subscriptions[key]=mc.mqtt.subscribe(this.data.values[key], callback); 
        }
      }
    }
  },
  template: `
    <div class="w3-cell-row w3-border-bottom">
      <span class="w3-cell w3-cell-middle">{{ formattedText }}</span>
    </div>`
})


mc.validatePage = function(page) {
  if (typeof page !== 'object' || page === null) return false;
  
  return true;
}
