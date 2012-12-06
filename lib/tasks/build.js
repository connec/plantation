(function() {
  var Builder, fs, path, sty, util;

  fs = require('fs');

  path = require('path');

  sty = require('sty');

  util = require('../util');

  /*
  Export a function that creates tasks.
  */


  module.exports = function() {
    new Builder(this.config).register_tasks();
    return void 0;
  };

  /*
  The Builder class encapsulates functionality for building sources using compilers registered with
  plantation.
  */


  Builder = (function() {
    /*
      Initialises a new Builder instance.
    
      @param  @config The plantation configuration
      @return         A new instance of Builder
    */

    function Builder(config) {
      var name, source, _i, _j, _len, _len1, _ref, _ref1;
      this.config = config;
      this.sources = util.readdir_recursive(this.config.directories.source);
      this.max_compiler_name_length = 0;
      this.max_source_name_length = 0;
      _ref = this.config.compilers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i].name;
        if (this.max_compiler_name_length < name.length) {
          this.max_compiler_name_length = name.length;
        }
      }
      _ref1 = this.sources;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        source = _ref1[_j];
        if (this.max_source_name_length < source.length) {
          this.max_source_name_length = source.length;
        }
      }
    }

    /*
      Registers cake tasks that leverage the builder instance.
    */


    Builder.prototype.register_tasks = function() {
      var compiler, _fn, _i, _len, _ref,
        _this = this;
      task('build', 'Builds all source files', function() {
        return _this.build_all();
      });
      task('watch', 'Watches all source files, and builds on changes', function() {
        return _this.watch_all();
      });
      _ref = this.config.compilers;
      _fn = function(compiler) {
        task("build:" + compiler.name, function() {
          return _this.build_using(compiler);
        });
        return task("watch:" + compiler.name, function() {
          return _this.watch_using(compiler);
        });
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        compiler = _ref[_i];
        _fn(compiler);
      }
      return void 0;
    };

    /*
      Builds using all registered compilers.
    */


    Builder.prototype.build_all = function() {
      var compiler, _i, _len, _ref;
      _ref = this.config.compilers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        compiler = _ref[_i];
        this.build_using(compiler);
      }
      return void 0;
    };

    /*
      Watches using all registered compilers.
    */


    Builder.prototype.watch_all = function() {
      var compiler, _i, _len, _ref;
      _ref = this.config.compilers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        compiler = _ref[_i];
        this.watch_using(compiler);
      }
      return void 0;
    };

    /*
      Builds source files for the given compiler.
    
      @param compiler Compiler descriptor
    */


    Builder.prototype.build_using = function(compiler) {
      var source, _i, _len, _ref;
      _ref = this.sources;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        source = _ref[_i];
        if (compiler.should_compile(this.relative_source(source))) {
          this.compile_source(source, compiler);
        }
      }
      return void 0;
    };

    /*
      Watches source files of the given compiler.
    
      @param compiler Compiler descriptor
    */


    Builder.prototype.watch_using = function(compiler) {
      return void 0;
    };

    /*
      Compiles a single source file using the given compiler.
    
      @param source   Path to the source file to compile
      @param compiler Compiler descriptor
    */


    Builder.prototype.compile_source = function(source, compiler) {
      var relative_source, relative_target, target;
      relative_source = this.relative_source(source);
      relative_target = compiler.make_target(relative_source);
      target = path.resolve(this.config.directories.target, relative_target);
      console.log(this.compilation_description(compiler.name, source, target));
      fs.writeFileSync(target, compiler.compile(relative_source, fs.readFileSync(source, 'utf8')));
      return void 0;
    };

    /*
      Gets a formatted description of an impending compilation.
    
      @param  compiler_name Name of the compiler about to be invoked
      @param  source        Path of the source file
      @param  target        Path of the target file
      @return               Formatted description
    */


    Builder.prototype.compilation_description = function(compiler_name, source, target) {
      var compiler_padding, i, source_padding;
      compiler_padding = ((function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = this.max_compiler_name_length - compiler_name.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(' ');
        }
        return _results;
      }).call(this)).join('');
      source_padding = ((function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = this.max_source_name_length - source.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(' ');
        }
        return _results;
      }).call(this)).join('');
      return ['  ', "" + compiler_padding + (sty.cyan(compiler_name)) + " : ", "" + (sty.yellow(path.relative(this.config.directories.current, source))) + source_padding + "  >  ", "" + (sty.green(path.relative(this.config.directories.current, target)))].join('');
    };

    /*
      Gets the relative path to the given source file from the source directory.
    
      @param source Path of the source file
    */


    Builder.prototype.relative_source = function(source) {
      return path.relative(this.config.directories.source, source);
    };

    return Builder;

  })();

}).call(this);
