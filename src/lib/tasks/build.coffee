fs   = require 'fs'
path = require 'path'
util = require 'util'

directories = []
sources     = []
compilers   = []

###
Export a function that registers tasks.
###
module.exports = (plantation) ->
  # Cache directories for convenience
  directories = plantation.options.directories

  # Get the full list of source files
  sources = readdir_recursive plantation.options.directories.source

  # Build an array of compilers in the correct order
  compilers = (plantation.options.compilers[name] for name in plantation.options.compiler_order)

  register_build_tasks()

###
Registers cake build tasks for all compilers.
###
register_build_tasks = ->
  task 'build', 'Builds all source files', ->
    invoke "build:#{name}" for { name } in compilers

  for compiler in compilers then do (compiler) ->
    task "build:#{compiler.name}", ->
      console.log "\nCompiling #{compiler.name}:"
      execute_compiler compiler

###
Executes the given compiler:
- finds matching source files
- compiles the contents of matched files
- writes the compilation result to the target file
###
execute_compiler = (compiler) ->
  compiled        = []
  max_name_length = 0
  for source in sources.filter filter_sources compiler.source
    target = make_target source, compiler.source, compiler.target
    result = compiler.compiler fs.readFileSync source, 'utf8'

    fs.writeFileSync target, result

    compiled.push [ source, target ].map (file) -> path.relative directories.current, file
    max_name_length = length if max_name_length < length = compiled[-1..][0][0].length

  for [ source, target ] in compiled
    space = ( i = max_name_length - source.length ; (' ' while i--).join '' )
    console.log "  #{source}#{space} -> #{target}"

###
Creates a function to filter a string by the given selector.
###
filter_sources = (selector) ->
  if typeof selector is 'string'
    selector = selector[1..] if selector[0] is '.'
    (source) -> source[ (1 + source.lastIndexOf '.').. ] == selector
  else if typeof selector is 'function'
    (source) -> !!selector source
  else if selector instanceof RegExp
    (source) -> !!source.match selector
  else
    throw new Exception "Don't know how to use selector #{util.inspect selector}"

###
Makes a target file name based on the source and the compiler's target option.
###
make_target = (source, selector, converter) ->
  target = path.resolve directories.target, path.relative directories.source, source
  if typeof converter is 'string'
    converter = converter[1..] if converter[0] is '.'
    target[ ..(target.lastIndexOf '.') ] + converter
  else if typeof converter is 'function'
    converter target, selector
  else if selector instanceof RegExp
    target.replace selector, converter
  else
    throw new Exception "Don't know how to use converter #{util.inspect converter}"


###
Recursively read a directory and return a flat array of files.
###
readdir_recursive = (root) ->
  files = []
  for entry in fs.readdirSync root
    entry = path.join root, entry
    if fs.statSync(entry).isFile()
      files.push entry
    else
      files = files.concat readdir_recursive entry
  files