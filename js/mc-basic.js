var mc = (function () {
  var config={}

  var saveConfig = function() {
    localStorage.setItem("mc-config", JSON.stringify(config));
  }

  var loadConfig = function() {
    var value = localStorage.getItem("mc-config");
    if (value) {
      config=JSON.parse(value);
    } else {
      config={
        pages:[]
      };
    }
  }
  loadConfig();
  
  
  return {
    plugins: {},
    config: config,
    saveConfig: saveConfig,
    loadConfig: loadConfig
  };

})();
