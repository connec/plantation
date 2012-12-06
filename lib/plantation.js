(function() {
  var Compiler, compiler_names, config, path, plantation,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Compiler = require('./compiler');

  path = require('path');

  /*
  The plantation object.
  */


  module.exports = plantation = function() {
    plantation.use(require('./default_package'));
    return plantation.cake();
  };

  /*
  Options.
  */


  plantation.config = config = {
    compilers: [],
    packages: [],
    directories: {
      current: path.resolve('.'),
      source: path.resolve('./src'),
      target: path.resolve('.')
    }
  };

  /*
  Use the given package.
  */


  plantation.use = function(pkg) {
    if (__indexOf.call(config.packages, pkg) >= 0) {
      return plantation;
    }
    config.packages.push(pkg);
    pkg.call(plantation.proxy);
    return plantation;
  };

  /*
  Load cake tasks.
  */


  plantation.cake = function() {
    var task, _i, _len, _ref, _results;
    _ref = require('./tasks');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      task = _ref[_i];
      _results.push(task.call(plantation));
    }
    return _results;
  };

  /*
  Registers a compiler function.
  */


  compiler_names = [];

  plantation.register_compiler = function(name, source, target, compiler) {
    var _ref, _ref1;
    if (name instanceof Compiler) {
      compiler = name;
    } else {
      if (compiler == null) {
        _ref = [name, source, target], source = _ref[0], target = _ref[1], compiler = _ref[2];
      }
      compiler = new Compiler(name, source, target, compiler, config);
    }
    if (_ref1 = compiler.name, __indexOf.call(compiler_names, _ref1) >= 0) {
      throw new Error("Compiler with name `" + name + "` has already been registered");
    }
    compiler_names.push(compiler.name);
    return config.compilers.push(compiler);
  };

  /*
  A proxy object given to packages.
  */


  plantation.proxy = {
    register_compiler: plantation.register_compiler
  };

}).call(this);
