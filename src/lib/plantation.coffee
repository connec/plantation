path = require 'path'

###
The plantation object.
###
module.exports = plantation = (options) ->
  plantation.config.options[k] = v for k, v of options
  register_default_compilers()
  plantation.cake()

###
Config.
###
plantation.config = { compilers, directories } =
  compilers:   []
  directories:
    current:   path.resolve '.'
    source:    path.resolve './src'
    target:    path.resolve '.'
  options:     {}

###
Resolves the given path against the chosen given directory.
###
directories.resolve = (args...) ->
  if args.length >= 2
    path.resolve directories[args[0]], args[1]
  else
    type = Object.keys(args[0])[0]
    path.resolve directories[type], args[0][type]

###
Gets the relative path from the given directory to the given path.
###
directories.relative = (args...) ->
  if args.length >= 2
    path.relative directories[args[0]], args[1]
  else
    type = Object.keys(args[0])[0]
    path.relative directories[type], args[0][type]

###
Creates cake tasks.
###
plantation.cake = ->
  task plantation for task in require './tasks'

###
Registers a compiler.
###
compiler_names = []
plantation.register_compiler = (name, source, target, compiler) ->
  Compiler = require './compiler'

  if name instanceof Compiler
    compiler = name
  else
    [ source, target, compiler ] = [ name, source, target ] unless compiler?
    compiler = new Compiler name, source, target, compiler

  if compiler.name in compiler_names
    throw new Error "Compiler with name `#{name}` has already been registered"

  compiler_names.push   compiler.name
  compilers.push compiler

###
Registers default compilers for CoffeeScript and YAML.
###
register_default_compilers = ->
  compile_coffee = require('coffeescript').compile
  compile_yaml   = (source) -> JSON.stringify require('yaml-js').load(source), null, '  '

  plantation.register_compiler 'coffee', 'js', compile_coffee
  plantation.register_compiler 'yaml', /\.ya?ml$/, 'json', compile_yaml
