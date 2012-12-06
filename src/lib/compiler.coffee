util = require 'util'

###
A Compiler instance encapsulates the functionality required to compile a source file.
###
module.exports = class Compiler

  ###
  Initialize a new Compiler instance.

  @param  @name     Name for the compiler
  @param  @source   Source descriptor for matching source files
  @param  @target   Target descriptor for making target file names from source file names
  @param  @compiler Actual compile function, taking a string of source as input
  @param  @config   Configuration object from plantation
  @return           A new Compiler instance
  ###
  constructor: (@name, @source, @target, @compiler, @config) ->

  ###
  Determines whether the compiler should compile the given source file.

  @param  source Path to a source file, relative to the source directory
  @return        True if the compiler should compile the file, false otherwise
  ###
  should_compile: (source) ->
    @source_filter ?= @get_source_filter()
    @source_filter source

  ###
  Makes a target file name based on the given source file name.

  @param  source Path to a source file, relative to the source directory
  @return        Path to a target file, relative to the target directory
  ###
  make_target: (source) ->
    @target_builder ?= @get_target_builder()
    @target_builder source

  ###
  Applies the compiler to the given source file.

  @param  source_name    Name of the file being compiled
  @param  source_content Source code to compile
  @return                Compilation result
  ###
  compile: (source_name, source_content) ->
    @compiler source_content

  ###
  Gets the source filter.

  @return Function for filtering source file names
  ###
  get_source_filter: ->
    if typeof @source is 'function'
      (source) -> !!@source source
    else if typeof @source is 'string'
      ext = if @source[0] is '.' then @source else '.' + @source
      (source) -> source[ (source.lastIndexOf '.').. ] == ext
    else if @source instanceof RegExp
      (source) => !!source.match @source
    else
      throw new Exception "Don't know how to use source descriptor: #{util.inspect @source}"

  ###
  Gets the target builder.

  @return Function for making target file names from source file names
  ###
  get_target_builder: ->
    if typeof @target is 'function'
      (source) => @target source
    else if typeof @target is 'string'
      ext = if @target[0] is '.' then @target[1..] else @target
      (source) -> source[ ..(source.lastIndexOf '.') ] + ext
    else
      throw new Exception "Don't know how to use target descriptor: #{util.inspect @target}"