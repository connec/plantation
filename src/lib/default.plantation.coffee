CoffeeScript = require 'coffee-script'
YamlJS       = require 'yaml-js'

module.exports = (plantation) ->
  plantation.register_compiler 'coffee', 'js', compile_coffee_script
  plantation.register_compiler 'yaml', /ya?ml/, 'json', compile_yaml

###
Compiles the given coffeescript string into javascript.
###
compile_coffee_script = (coffee_script) ->
  CoffeeScript.compile coffee_script

###
Compiles the given yaml into json.
###
compile_yaml = (yaml) ->
  JSON.stringify YamlJS.load(yaml), null, '  '

module.exports.package_name = 'default (coffee, yaml)'