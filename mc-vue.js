if (!mc.hasOwnProperty("vue")) {
  mc.vue={};
}

mc.vue.page = Vue.extend({
  props: ["data"],
  template: `
    <div>
      {{ data.name }}<br>
      <div class="w3-row">
        <mc-card v-for="card in data.cards" v-bind:data="card"></> </mc-card>
      </div>
    </div>`
});
Vue.component('mc-page', mc.vue.page)

Vue.component('mc-card', {
  props: ["data"],
  template: `<div class="w3-third w3-card">
      <header class="w3-container w3-blue">
        <h2>{{ data.name }}</h2>
      </header>
      <div class="w3-container">
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
  template: `<div class="w3-row">
      <label class="w3-col s6">{{ data.name }}</label>
      <select class="w3-col s6 w3-select w3-border" v-model="value" @change="valueChanged">
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
  template: `<div class="w3-row">
      <label class="w3-col s6">{{ data.name }}</label>
      <label class="switch">
        <input type="checkbox" v-model="value" @change="valueChanged">
        <span class="slider round"></span>
      </label>
    </div>`
})
