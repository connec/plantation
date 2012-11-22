path = require 'path'

###
The plantation object.
###
module.exports = plantation = ->
  plantation.use require './default.plantation'
  plantation.cake()

###
Options.
###
plantation.options = options =
  compilers:      {}
  compiler_order: []
  packages:       []
  directories:
    current:      path.resolve '.'
    source:       path.resolve './src'
    target:       path.resolve '.'

###
Use the given package.
###
plantation.use = (pkg) ->
  return plantation if pkg in options.packages

  options.packages.push pkg
  pkg plantation.proxy
  plantation

###
Load cake tasks.
###
plantation.cake = ->
  task plantation for task in require './tasks'

###
Registers a compiler function.
###
plantation.register_compiler = (name, source, target, compiler) ->
  if name of options.compilers
    throw new Error "Compiler with name `#{name}` has already been registered"

  unless compiler
    [ source, target, compiler ] = [ name, source, target ]

  options.compilers[name] = { name, source, target, compiler }
  options.compiler_order.push name

###
A proxy object given to packages.
###
plantation.proxy =
  register_compiler: plantation.register_compiler