(function() {
  var build, build_all, colors, compilers, directories, max_compiler, max_source, print_results, sources, spaces, util, watch, watch_all, watchr;

  watchr = require('node-watch');

  colors = require('colors/safe');

  util = require('../util');

  compilers = null;

  directories = null;

  sources = null;

  max_compiler = 0;

  max_source = 0;

  /*
  Export a function to define the tasks once plantation is configured.
  */
  module.exports = function(plantation) {
    var compiler, fn, j, k, len, len1, results1;
    ({compilers, directories} = plantation.config);
    task('build', 'Builds all source files', function() {
      return print_results(...build_all());
    });
    fn = function(compiler) {
      return task(`build:${compiler.name}`, function() {
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
        return task(`watch:${compiler.name}`, function() {
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
    print_results(...build_all());
    return watchr(directories.source, function(source) {
      var compiler, j, len, results1;
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
    return watchr(directories.source, function(source) {
      if (compiler.should_compile(source)) {
        return print_results({
          compiler: compiler.name,
          results: [compiler.compile(source)]
        });
      }
    });
  };

  print_results = function(...compiler_results) {
    var compiler, error, errors, j, k, l, len, len1, len2, len3, len4, m, o, results, results1, source, target;
    console.log();
    for (j = 0, len = compiler_results.length; j < len; j++) {
      ({compiler, results} = compiler_results[j]);
      if (compiler.length > max_compiler) {
        max_compiler = compiler.length;
      }
      for (k = 0, len1 = results.length; k < len1; k++) {
        ({source} = results[k]);
        (source.length > max_source ? max_source = source.length : void 0);
      }
    }
    errors = [];
    for (l = 0, len2 = compiler_results.length; l < len2; l++) {
      ({compiler, results} = compiler_results[l]);
      compiler = spaces(max_compiler - compiler.length) + compiler;
      for (m = 0, len3 = results.length; m < len3; m++) {
        ({source, target, error} = results[m]);
        source = directories.relative({
          current: source
        }) + spaces(max_source - source.length);
        target = directories.relative({
          current: target
        });
        if (error != null) {
          errors.push({source, error});
        }
        console.log([`  ${colors.cyan(compiler)} : ${colors.yellow(source)}  >  `, colors[error != null ? 'red' : 'green'](target)].join(''));
      }
    }
    results1 = [];
    for (o = 0, len4 = errors.length; o < len4; o++) {
      ({source, error} = errors[o]);
      results1.push(console.error(colors.red(`\n\nError compiling ${source}\n${error.stack}`)));
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
