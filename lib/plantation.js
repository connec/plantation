(function() {
  var compiler_names, compilers, directories, path, register_default_compilers, _ref,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  /*
  The plantation object.
  */


  module.exports = global.plantation = function() {
    register_default_compilers();
    return plantation.cake();
  };

  /*
  Config.
  */


  plantation.config = (_ref = {
    compilers: [],
    directories: {
      current: path.resolve('.'),
      source: path.resolve('./src'),
      target: path.resolve('.')
    }
  }, compilers = _ref.compilers, directories = _ref.directories, _ref);

  /*
  Resolves the given path against the chosen given directory.
  */


  directories.resolve = function() {
    var args, type;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
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
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
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
    var task, _i, _len, _ref1, _results;
    _ref1 = require('./tasks');
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      task = _ref1[_i];
      _results.push(task());
    }
    return _results;
  };

  /*
  Registers a compiler.
  */


  compiler_names = [];

  plantation.register_compiler = function(name, source, target, compiler) {
    var Compiler, _ref1, _ref2;
    Compiler = require('./compiler');
    if (name instanceof Compiler) {
      compiler = name;
    } else {
      if (compiler == null) {
        _ref1 = [name, source, target], source = _ref1[0], target = _ref1[1], compiler = _ref1[2];
      }
      compiler = new Compiler(name, source, target, compiler);
    }
    if (_ref2 = compiler.name, __indexOf.call(compiler_names, _ref2) >= 0) {
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
    return plantation.register_compiler('yaml', /ya?ml/, 'json', compile_yaml);
  };

}).call(this);
