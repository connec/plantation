Compiler = require './compiler'
path     = require 'path'

###
The plantation object.
###
module.exports = plantation = ->
  plantation.use require './default_package'
  plantation.cake()

###
Options.
###
plantation.config = config =
  compilers:   []
  packages:    []
  directories:
    current:   path.resolve '.'
    source:    path.resolve './src'
    target:    path.resolve '.'

###
Use the given package.
###
plantation.use = (pkg) ->
  return plantation if pkg in config.packages
  config.packages.push pkg

  pkg.call plantation.proxy
  plantation

###
Load cake tasks.
###
plantation.cake = ->
  task.call plantation for task in require './tasks'

###
Registers a compiler function.
###
compiler_names = []
plantation.register_compiler = (name, source, target, compiler) ->
  if name instanceof Compiler
    compiler = name
  else
    [ source, target, compiler ] = [ name, source, target ] unless compiler?
    compiler = new Compiler name, source, target, compiler, config

  if compiler.name in compiler_names
    throw new Error "Compiler with name `#{name}` has already been registered"

  compiler_names.push   compiler.name
  config.compilers.push compiler

###
A proxy object given to packages.
###
plantation.proxy =
  register_compiler: plantation.register_compiler