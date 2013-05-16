{ compilers, directories } = plantation.config

node_watch = require 'node-watch'
sty        = require 'sty'
util       = require '../util'

sources    = util.readdir_recursive directories.source

###
Export a function to define the tasks once plantation is configured.
###
module.exports = ->
  task 'build', 'Builds all source files', -> print_results build_all()...
  task 'watch', 'Watches source files for changes', watch_all

  for compiler in compilers then do (compiler) ->
    task "build:#{compiler.name}", -> print_results build compiler

  for compiler in compilers then do (compiler) ->
    task "build:#{compiler.name}", -> print_results build compiler
    task "watch:#{compiler.name}", -> watch compiler

build_all = ->
  build compiler for compiler in compilers

watch_all = ->
  node_watch directories.source, (source) ->
    for compiler in compilers when compiler.should_compile source
      print_results
        compiler: compiler.name
        results:  [ compiler.compile source ]

build = (compiler) ->
  results = (compiler.compile source for source in sources when compiler.should_compile source)
  {
    compiler: compiler.name
    results:  results
  }

watch = (compiler) ->
  node_watch directories.source, (source) ->
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
        "  #{sty.cyan compiler} : #{sty.yellow source}  >  "
        sty[if error? then 'red' else 'green'] target
      ].join ''

  for { source, error } in errors
    console.log sty.red "\n\nError compiling #{source}\n#{error.stack}"

spaces = (n) ->
  (' ' for i in [0...n]).join ''