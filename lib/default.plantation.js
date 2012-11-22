(function() {
  var CoffeeScript, YamlJS, compile_coffee_script, compile_yaml;

  CoffeeScript = require('coffee-script');

  YamlJS = require('yaml-js');

  module.exports = function(plantation) {
    plantation.register_compiler('coffee', 'js', compile_coffee_script);
    return plantation.register_compiler('yaml', /ya?ml/, 'json', compile_yaml);
  };

  /*
  Compiles the given coffeescript string into javascript.
  */


  compile_coffee_script = function(coffee_script) {
    return CoffeeScript.compile(coffee_script);
  };

  /*
  Compiles the given yaml into json.
  */


  compile_yaml = function(yaml) {
    return JSON.stringify(YamlJS.load(yaml), null, '  ');
  };

  module.exports.package_name = 'default (coffee, yaml)';

}).call(this);
