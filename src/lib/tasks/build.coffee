{ compilers, directories } = plantation.config

util     = require '../util'
sty      = require 'sty'

sources  = util.readdir_recursive directories.source

build_all = ->
  build compiler for compiler in compilers

build = (compiler) ->
  results = (compiler.compile source for source in sources when compiler.should_compile source)
  {
    compiler: compiler.name
    results:  results
  }

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

###
Export a function to define the tasks once plantation is configured.
###
module.exports = ->
  task 'build', 'Builds all source files', -> print_results build_all()...

  for compiler in compilers then do (compiler) ->
    task "build:#{compiler.name}", -> print_results build compiler