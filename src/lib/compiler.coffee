fs                    = require 'fs'
{ relative, resolve } = require('./plantation').config.directories

###
A Compiler instance encapsulates the functionality required to compile a source file.
###
module.exports = class Compiler

  ###
  Initialises a new instance.
  ###
  constructor: (@name, @_source_descriptor, @_target_descriptor, @_compile) ->
    @should_compile = @get_source_filter()
    @make_target    = @get_target_builder()

  ###
  Compiles the given source file and saves the result.
  ###
  compile: (source) ->
    target = @make_target source

    error = null
    try
      fs.writeFileSync target, @_compile fs.readFileSync(source, 'utf8'), filename: source
    catch e
      error = e

    new @Result source, target, error

  ###
  Gets the source filter.
  ###
  get_source_filter: ->
    if typeof @_source_descriptor is 'function'
      (source) -> !!@_source_descriptor relative { source }

    else if typeof @_source_descriptor is 'string'
      ext = if @_source_descriptor[0] is '.' then @_source_descriptor else '.' + @_source_descriptor
      (source) -> source[ (source.lastIndexOf '.').. ] == ext

    else if @_source_descriptor instanceof RegExp
      (source) => !!relative({ source }).match @_source_descriptor

    else
      throw new Exception "Don't know how to use source descriptor: #{util.inspect @_source_descriptor}"

  ###
  Gets the target builder.
  ###
  get_target_builder: ->
    if typeof @_target_descriptor is 'function'
      (source) => resolve target: @_target_descriptor relative { source }

    else if typeof @_target_descriptor is 'string'
      ext = if @_target_descriptor[0] is '.' then @_target_descriptor[1..] else @_target_descriptor
      (source) -> resolve target: (relative source: source[ ..(source.lastIndexOf '.') ] + ext)

    else
      throw new Exception "Don't know how to use target descriptor: #{util.inspect @_target_descriptor}"

  ###
  Represents a compilation result.
  ###
  class @::Result

    ###
    Initialises a new instance.
    ###
    constructor: (@source, @target, @error = null) ->

    ###
    Determines whether this is a successful compilation result.
    ###
    is_success: ->
      not @error?