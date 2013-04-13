(function() {
  var build, build_all, compilers, directories, print_results, sources, spaces, sty, util, _ref,
    __slice = [].slice;

  _ref = plantation.config, compilers = _ref.compilers, directories = _ref.directories;

  util = require('../util');

  sty = require('sty');

  sources = util.readdir_recursive(directories.source);

  /*
  Export a function to define the tasks once plantation is configured.
  */


  module.exports = function() {
    var compiler, _i, _len, _results;
    task('build', 'Builds all source files', function() {
      return print_results.apply(null, build_all());
    });
    _results = [];
    for (_i = 0, _len = compilers.length; _i < _len; _i++) {
      compiler = compilers[_i];
      _results.push((function(compiler) {
        return task("build:" + compiler.name, function() {
          return print_results(build(compiler));
        });
      })(compiler));
    }
    return _results;
  };

  build_all = function() {
    var compiler, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = compilers.length; _i < _len; _i++) {
      compiler = compilers[_i];
      _results.push(build(compiler));
    }
    return _results;
  };

  build = function(compiler) {
    var results, source;
    results = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        source = sources[_i];
        if (compiler.should_compile(source)) {
          _results.push(compiler.compile(source));
        }
      }
      return _results;
    })();
    return {
      compiler: compiler.name,
      results: results
    };
  };

  print_results = function() {
    var compiler, compiler_results, error, errors, max_compiler, max_source, results, source, target, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref1, _ref2, _ref3, _ref4, _results;
    compiler_results = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    console.log();
    max_compiler = 0;
    max_source = 0;
    for (_i = 0, _len = compiler_results.length; _i < _len; _i++) {
      _ref1 = compiler_results[_i], compiler = _ref1.compiler, results = _ref1.results;
      if (compiler.length > max_compiler) {
        max_compiler = compiler.length;
      }
      for (_j = 0, _len1 = results.length; _j < _len1; _j++) {
        source = results[_j].source;
        if (source.length > max_source) {
          max_source = source.length;
        }
      }
    }
    errors = [];
    for (_k = 0, _len2 = compiler_results.length; _k < _len2; _k++) {
      _ref2 = compiler_results[_k], compiler = _ref2.compiler, results = _ref2.results;
      compiler = spaces(max_compiler - compiler.length) + compiler;
      for (_l = 0, _len3 = results.length; _l < _len3; _l++) {
        _ref3 = results[_l], source = _ref3.source, target = _ref3.target, error = _ref3.error;
        source = directories.relative({
          current: source
        }) + spaces(max_source - source.length);
        target = directories.relative({
          current: target
        });
        if (error != null) {
          errors.push({
            source: source,
            error: error
          });
        }
        console.log(["  " + (sty.cyan(compiler)) + " : " + (sty.yellow(source)) + "  >  ", sty[error != null ? 'red' : 'green'](target)].join(''));
      }
    }
    _results = [];
    for (_m = 0, _len4 = errors.length; _m < _len4; _m++) {
      _ref4 = errors[_m], source = _ref4.source, error = _ref4.error;
      _results.push(console.log(sty.red("\n\nError compiling " + source + "\n" + error.stack)));
    }
    return _results;
  };

  spaces = function(n) {
    var i;
    return ((function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
        _results.push(' ');
      }
      return _results;
    })()).join('');
  };

}).call(this);
