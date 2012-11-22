(function() {
  var compilers, directories, execute_compiler, filter_sources, fs, make_target, path, readdir_recursive, register_build_tasks, sources, util;

  fs = require('fs');

  path = require('path');

  util = require('util');

  directories = [];

  sources = [];

  compilers = [];

  /*
  Export a function that registers tasks.
  */


  module.exports = function(plantation) {
    var name;
    directories = plantation.options.directories;
    sources = readdir_recursive(plantation.options.directories.source);
    compilers = (function() {
      var _i, _len, _ref, _results;
      _ref = plantation.options.compiler_order;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        _results.push(plantation.options.compilers[name]);
      }
      return _results;
    })();
    return register_build_tasks();
  };

  /*
  Registers cake build tasks for all compilers.
  */


  register_build_tasks = function() {
    var compiler, _i, _len, _results;
    task('build', 'Builds all source files', function() {
      var name, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = compilers.length; _i < _len; _i++) {
        name = compilers[_i].name;
        _results.push(invoke("build:" + name));
      }
      return _results;
    });
    _results = [];
    for (_i = 0, _len = compilers.length; _i < _len; _i++) {
      compiler = compilers[_i];
      _results.push((function(compiler) {
        return task("build:" + compiler.name, function() {
          console.log("\nCompiling " + compiler.name + ":");
          return execute_compiler(compiler);
        });
      })(compiler));
    }
    return _results;
  };

  /*
  Executes the given compiler:
  - finds matching source files
  - compiles the contents of matched files
  - writes the compilation result to the target file
  */


  execute_compiler = function(compiler) {
    var compiled, i, length, max_name_length, result, source, space, target, _i, _j, _len, _len1, _ref, _ref1, _results;
    compiled = [];
    max_name_length = 0;
    _ref = sources.filter(filter_sources(compiler.source));
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      source = _ref[_i];
      target = make_target(source, compiler.source, compiler.target);
      result = compiler.compiler(fs.readFileSync(source, 'utf8'));
      fs.writeFileSync(target, result);
      compiled.push([source, target].map(function(file) {
        return path.relative(directories.current, file);
      }));
      if (max_name_length < (length = compiled.slice(-1)[0][0].length)) {
        max_name_length = length;
      }
    }
    _results = [];
    for (_j = 0, _len1 = compiled.length; _j < _len1; _j++) {
      _ref1 = compiled[_j], source = _ref1[0], target = _ref1[1];
      space = (i = max_name_length - source.length, ((function() {
        var _results1;
        _results1 = [];
        while (i--) {
          _results1.push(' ');
        }
        return _results1;
      })()).join(''));
      _results.push(console.log("  " + source + space + " -> " + target));
    }
    return _results;
  };

  /*
  Creates a function to filter a string by the given selector.
  */


  filter_sources = function(selector) {
    if (typeof selector === 'string') {
      if (selector[0] === '.') {
        selector = selector.slice(1);
      }
      return function(source) {
        return source.slice(1 + source.lastIndexOf('.')) === selector;
      };
    } else if (typeof selector === 'function') {
      return function(source) {
        return !!selector(source);
      };
    } else if (selector instanceof RegExp) {
      return function(source) {
        return !!source.match(selector);
      };
    } else {
      throw new Exception("Don't know how to use selector " + (util.inspect(selector)));
    }
  };

  /*
  Makes a target file name based on the source and the compiler's target option.
  */


  make_target = function(source, selector, converter) {
    var target;
    target = path.resolve(directories.target, path.relative(directories.source, source));
    if (typeof converter === 'string') {
      if (converter[0] === '.') {
        converter = converter.slice(1);
      }
      return target.slice(0, +(target.lastIndexOf('.')) + 1 || 9e9) + converter;
    } else if (typeof converter === 'function') {
      return converter(target, selector);
    } else if (selector instanceof RegExp) {
      return target.replace(selector, converter);
    } else {
      throw new Exception("Don't know how to use converter " + (util.inspect(converter)));
    }
  };

  /*
  Recursively read a directory and return a flat array of files.
  */


  readdir_recursive = function(root) {
    var entry, files, _i, _len, _ref;
    files = [];
    _ref = fs.readdirSync(root);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      entry = _ref[_i];
      entry = path.join(root, entry);
      if (fs.statSync(entry).isFile()) {
        files.push(entry);
      } else {
        files = files.concat(readdir_recursive(entry));
      }
    }
    return files;
  };

}).call(this);
