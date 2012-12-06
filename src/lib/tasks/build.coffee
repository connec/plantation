fs   = require 'fs'
path = require 'path'
sty  = require 'sty'
util = require '../util'

###
Export a function that creates tasks.
###
module.exports = ->
  new Builder(@config).register_tasks()
  undefined

###
The Builder class encapsulates functionality for building sources using compilers registered with
plantation.
###
class Builder

  ###
  Initialises a new Builder instance.

  @param  @config The plantation configuration
  @return         A new instance of Builder
  ###
  constructor: (@config) ->
    # Eagerly load the full list of source files
    @sources = util.readdir_recursive @config.directories.source

    # Some handy things to know, for formatting
    @max_compiler_name_length = 0
    @max_source_name_length   = 0
    for { name } in @config.compilers
      @max_compiler_name_length = name.length if @max_compiler_name_length < name.length
    for source in @sources
      @max_source_name_length = source.length if @max_source_name_length < source.length

  ###
  Registers cake tasks that leverage the builder instance.
  ###
  register_tasks: ->
    task 'build', 'Builds all source files',                         => @build_all()
    task 'watch', 'Watches all source files, and builds on changes', => @watch_all()

    for compiler in @config.compilers then do (compiler) =>
      task "build:#{compiler.name}", => @build_using compiler
      task "watch:#{compiler.name}", => @watch_using compiler

    undefined

  ###
  Builds using all registered compilers.
  ###
  build_all: ->
    @build_using compiler for compiler in @config.compilers
    undefined

  ###
  Watches using all registered compilers.
  ###
  watch_all: ->
    @watch_using compiler for compiler in @config.compilers
    undefined

  ###
  Builds source files for the given compiler.

  @param compiler Compiler descriptor
  ###
  build_using: (compiler) ->
    for source in @sources when compiler.should_compile @relative_source source
      @compile_source source, compiler
    undefined

  ###
  Watches source files of the given compiler.

  @param compiler Compiler descriptor
  ###
  watch_using: (compiler) ->
    undefined

  ###
  Compiles a single source file using the given compiler.

  @param source   Path to the source file to compile
  @param compiler Compiler descriptor
  ###
  compile_source: (source, compiler) ->
    relative_source = @relative_source source
    relative_target = compiler.make_target relative_source
    target          = path.resolve @config.directories.target, relative_target

    # Print before we actually run the compiler, so the user knows which source failed
    console.log @compilation_description compiler.name, source, target

    fs.writeFileSync target, compiler.compile relative_source, fs.readFileSync source, 'utf8'

    undefined

  ###
  Gets a formatted description of an impending compilation.

  @param  compiler_name Name of the compiler about to be invoked
  @param  source        Path of the source file
  @param  target        Path of the target file
  @return               Formatted description
  ###
  compilation_description: (compiler_name, source, target) ->
    compiler_padding = (' ' for i in [0...@max_compiler_name_length - compiler_name.length]).join ''
    source_padding   = (' ' for i in [0...@max_source_name_length - source.length]).join ''
    [
      '  '
      "#{compiler_padding}#{sty.cyan compiler_name} : "
      "#{sty.yellow path.relative @config.directories.current, source}#{source_padding}  >  "
      "#{sty.green path.relative @config.directories.current, target}"
    ].join ''

  ###
  Gets the relative path to the given source file from the source directory.

  @param source Path of the source file
  ###
  relative_source: (source) ->
    path.relative @config.directories.source, source