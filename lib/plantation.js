(function() {
  var compiler_names, compilers, directories, path, ref, register_default_compilers,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');


  /*
  The plantation object.
   */

  module.exports = global.plantation = function(options) {
    var k, v;
    for (k in options) {
      v = options[k];
      plantation.config.options[k] = v;
    }
    register_default_compilers();
    return plantation.cake();
  };


  /*
  Config.
   */

  plantation.config = (ref = {
    compilers: [],
    directories: {
      current: path.resolve('.'),
      source: path.resolve('./src'),
      target: path.resolve('.')
    },
    options: {}
  }, compilers = ref.compilers, directories = ref.directories, ref);


  /*
  Resolves the given path against the chosen given directory.
   */

  directories.resolve = function() {
    var args, type;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (args.length >= 2) {
      return path.resolve(directories[args[0]], args[1]);
    } else {
      type = Object.keys(args[0])[0];
      return path.resolve(directories[type], args[0][type]);
    }
  };


  /*
  Gets the relative path from the given directory to the given path.
   */

  directories.relative = function() {
    var args, type;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (args.length >= 2) {
      return path.relative(directories[args[0]], args[1]);
    } else {
      type = Object.keys(args[0])[0];
      return path.relative(directories[type], args[0][type]);
    }
  };


  /*
  Creates cake tasks.
   */

  plantation.cake = function() {
    var i, len, ref1, results, task;
    ref1 = require('./tasks');
    results = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      task = ref1[i];
      results.push(task());
    }
    return results;
  };


  /*
  Registers a compiler.
   */

  compiler_names = [];

  plantation.register_compiler = function(name, source, target, compiler) {
    var Compiler, ref1, ref2;
    Compiler = require('./compiler');
    if (name instanceof Compiler) {
      compiler = name;
    } else {
      if (compiler == null) {
        ref1 = [name, source, target], source = ref1[0], target = ref1[1], compiler = ref1[2];
      }
      compiler = new Compiler(name, source, target, compiler);
    }
    if (ref2 = compiler.name, indexOf.call(compiler_names, ref2) >= 0) {
      throw new Error("Compiler with name `" + name + "` has already been registered");
    }
    compiler_names.push(compiler.name);
    return compilers.push(compiler);
  };


  /*
  Registers default compilers for CoffeeScript and YAML.
   */

  register_default_compilers = function() {
    var compile_coffee, compile_yaml;
    compile_coffee = require('coffee-script').compile;
    compile_yaml = function(source) {
      return JSON.stringify(require('yaml-js').load(source), null, '  ');
    };
    plantation.register_compiler('coffee', 'js', compile_coffee);
    return plantation.register_compiler('yaml', /\.ya?ml$/, 'json', compile_yaml);
  };

}).call(this);
