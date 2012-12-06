(function() {
  var Compiler, util;

  util = require('util');

  /*
  A Compiler instance encapsulates the functionality required to compile a source file.
  */


  module.exports = Compiler = (function() {
    /*
      Initialize a new Compiler instance.
    
      @param  @name     Name for the compiler
      @param  @source   Source descriptor for matching source files
      @param  @target   Target descriptor for making target file names from source file names
      @param  @compiler Actual compile function, taking a string of source as input
      @param  @config   Configuration object from plantation
      @return           A new Compiler instance
    */

    function Compiler(name, source, target, compiler, config) {
      this.name = name;
      this.source = source;
      this.target = target;
      this.compiler = compiler;
      this.config = config;
    }

    /*
      Determines whether the compiler should compile the given source file.
    
      @param  source Path to a source file, relative to the source directory
      @return        True if the compiler should compile the file, false otherwise
    */


    Compiler.prototype.should_compile = function(source) {
      var _ref;
      if ((_ref = this.source_filter) == null) {
        this.source_filter = this.get_source_filter();
      }
      return this.source_filter(source);
    };

    /*
      Makes a target file name based on the given source file name.
    
      @param  source Path to a source file, relative to the source directory
      @return        Path to a target file, relative to the target directory
    */


    Compiler.prototype.make_target = function(source) {
      var _ref;
      if ((_ref = this.target_builder) == null) {
        this.target_builder = this.get_target_builder();
      }
      return this.target_builder(source);
    };

    /*
      Applies the compiler to the given source file.
    
      @param  source_name    Name of the file being compiled
      @param  source_content Source code to compile
      @return                Compilation result
    */


    Compiler.prototype.compile = function(source_name, source_content) {
      return this.compiler(source_content);
    };

    /*
      Gets the source filter.
    
      @return Function for filtering source file names
    */


    Compiler.prototype.get_source_filter = function() {
      var ext,
        _this = this;
      if (typeof this.source === 'function') {
        return function(source) {
          return !!this.source(source);
        };
      } else if (typeof this.source === 'string') {
        ext = this.source[0] === '.' ? this.source : '.' + this.source;
        return function(source) {
          return source.slice(source.lastIndexOf('.')) === ext;
        };
      } else if (this.source instanceof RegExp) {
        return function(source) {
          return !!source.match(_this.source);
        };
      } else {
        throw new Exception("Don't know how to use source descriptor: " + (util.inspect(this.source)));
      }
    };

    /*
      Gets the target builder.
    
      @return Function for making target file names from source file names
    */


    Compiler.prototype.get_target_builder = function() {
      var ext,
        _this = this;
      if (typeof this.target === 'function') {
        return function(source) {
          return _this.target(source);
        };
      } else if (typeof this.target === 'string') {
        ext = this.target[0] === '.' ? this.target.slice(1) : this.target;
        return function(source) {
          return source.slice(0, +(source.lastIndexOf('.')) + 1 || 9e9) + ext;
        };
      } else {
        throw new Exception("Don't know how to use target descriptor: " + (util.inspect(this.target)));
      }
    };

    return Compiler;

  })();

}).call(this);
