(function() {
  var build, build_all, colors, compilers, directories, print_results, sources, spaces, util, watch, watch_all, watchr,
    slice = [].slice;

  watchr = require('watch');

  colors = require('colors/safe');

  util = require('../util');

  compilers = null;

  directories = null;

  sources = null;


  /*
  Export a function to define the tasks once plantation is configured.
   */

  module.exports = function(plantation) {
    var compiler, fn, j, k, len, len1, ref, results1;
    ref = plantation.config, compilers = ref.compilers, directories = ref.directories;
    task('build', 'Builds all source files', function() {
      return print_results.apply(null, build_all());
    });
    fn = function(compiler) {
      return task("build:" + compiler.name, function() {
        return print_results(build(compiler));
      });
    };
    for (j = 0, len = compilers.length; j < len; j++) {
      compiler = compilers[j];
      fn(compiler);
    }
    task('watch', 'Watches source files for changes', watch_all);
    results1 = [];
    for (k = 0, len1 = compilers.length; k < len1; k++) {
      compiler = compilers[k];
      results1.push((function(compiler) {
        return task("watch:" + compiler.name, function() {
          return watch(compiler);
        });
      })(compiler));
    }
    return results1;
  };

  build_all = function() {
    var compiler, j, len, results1;
    results1 = [];
    for (j = 0, len = compilers.length; j < len; j++) {
      compiler = compilers[j];
      results1.push(build(compiler));
    }
    return results1;
  };

  watch_all = function() {
    print_results.apply(null, build_all());
    return watchr.watchTree(directories.source, function(source, stat) {
      var compiler, j, len, results1;
      if (typeof source === 'object' || !(stat != null ? stat.nlink : void 0)) {
        return;
      }
      results1 = [];
      for (j = 0, len = compilers.length; j < len; j++) {
        compiler = compilers[j];
        if (compiler.should_compile(source)) {
          results1.push(print_results({
            compiler: compiler.name,
            results: [compiler.compile(source)]
          }));
        }
      }
      return results1;
    });
  };

  build = function(compiler) {
    var results, source;
    if (sources == null) {
      sources = util.readdir_recursive(directories.source);
    }
    results = (function() {
      var j, len, results1;
      results1 = [];
      for (j = 0, len = sources.length; j < len; j++) {
        source = sources[j];
        if (compiler.should_compile(source)) {
          results1.push(compiler.compile(source));
        }
      }
      return results1;
    })();
    return {
      compiler: compiler.name,
      results: results
    };
  };

  watch = function(compiler) {
    print_results(build(compiler));
    return watchr.watchTree(directories.source, function(source, stat) {
      if (typeof source === 'object' || !(stat != null ? stat.nlink : void 0)) {
        return;
      }
      if (compiler.should_compile(source)) {
        return print_results({
          compiler: compiler.name,
          results: [compiler.compile(source)]
        });
      }
    });
  };

  print_results = function() {
    var compiler, compiler_results, error, errors, j, k, l, len, len1, len2, len3, len4, m, max_compiler, max_source, o, ref, ref1, ref2, ref3, results, results1, source, target;
    compiler_results = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    console.log();
    max_compiler = 0;
    max_source = 0;
    for (j = 0, len = compiler_results.length; j < len; j++) {
      ref = compiler_results[j], compiler = ref.compiler, results = ref.results;
      if (compiler.length > max_compiler) {
        max_compiler = compiler.length;
      }
      for (k = 0, len1 = results.length; k < len1; k++) {
        source = results[k].source;
        if (source.length > max_source) {
          max_source = source.length;
        }
      }
    }
    errors = [];
    for (l = 0, len2 = compiler_results.length; l < len2; l++) {
      ref1 = compiler_results[l], compiler = ref1.compiler, results = ref1.results;
      compiler = spaces(max_compiler - compiler.length) + compiler;
      for (m = 0, len3 = results.length; m < len3; m++) {
        ref2 = results[m], source = ref2.source, target = ref2.target, error = ref2.error;
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
        console.log(["  " + (colors.cyan(compiler)) + " : " + (colors.yellow(source)) + "  >  ", colors[error != null ? 'red' : 'green'](target)].join(''));
      }
    }
    results1 = [];
    for (o = 0, len4 = errors.length; o < len4; o++) {
      ref3 = errors[o], source = ref3.source, error = ref3.error;
      results1.push(console.error(colors.red("\n\nError compiling " + source + "\n" + error.stack)));
    }
    return results1;
  };

  spaces = function(n) {
    var i;
    return ((function() {
      var j, ref, results1;
      results1 = [];
      for (i = j = 0, ref = n; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results1.push(' ');
      }
      return results1;
    })()).join('');
  };

}).call(this);
