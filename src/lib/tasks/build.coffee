{ compilers, directories } = plantation.config

watchr = require 'watch'
colors = require 'colors/safe'
util   = require '../util'

sources = null

###
Export a function to define the tasks once plantation is configured.
###
module.exports = ->
  task 'build', 'Builds all source files', -> print_results build_all()...
  for compiler in compilers then do (compiler) ->
    task "build:#{compiler.name}", -> print_results build compiler

  task 'watch', 'Watches source files for changes', watch_all
  for compiler in compilers then do (compiler) ->
    task "build:#{compiler.name}", -> print_results build compiler
    task "watch:#{compiler.name}", -> watch compiler

build_all = ->
  build compiler for compiler in compilers

watch_all = ->
  print_results build_all()...
  watchr.watchTree directories.source, (source, stat) ->
    return if typeof source is 'object' or not stat?.nlink
    for compiler in compilers when compiler.should_compile source
      print_results
        compiler: compiler.name
        results:  [ compiler.compile source ]

build = (compiler) ->
  sources ?= util.readdir_recursive directories.source
  results  = (compiler.compile source for source in sources when compiler.should_compile source)
  {
    compiler: compiler.name
    results:  results
  }

watch = (compiler) ->
  print_results build compiler
  watchr.watchTree directories.source, (source, stat) ->
    return if typeof source is 'object' or not stat?.nlink
    if compiler.should_compile source
      print_results
        compiler: compiler.name
        results:  [ compiler.compile source ]

print_results = (compiler_results...) ->
  console.log()

  max_compiler = 0
  max_source   = 0
  for { compiler, results } in compiler_results
    max_compiler = compiler.length if compiler.length > max_compiler
    (max_source  = source.length   if source.length   > max_source) for { source } in results

  errors = []
  for { compiler, results } in compiler_results
    compiler = spaces(max_compiler - compiler.length) + compiler
    for { source, target, error } in results
      source = directories.relative(current: source) + spaces max_source - source.length
      target = directories.relative current: target
      errors.push { source, error } if error?

      console.log [
        "  #{colors.cyan compiler} : #{colors.yellow source}  >  "
        colors[if error? then 'red' else 'green'] target
      ].join ''

  for { source, error } in errors
    console.error colors.red "\n\nError compiling #{source}\n#{error.stack}"

spaces = (n) ->
  (' ' for i in [0...n]).join ''