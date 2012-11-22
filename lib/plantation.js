(function() {
  var options, path, plantation,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  /*
  The plantation object.
  */


  module.exports = plantation = function() {
    plantation.use(require('./default.plantation'));
    return plantation.cake();
  };

  /*
  Options.
  */


  plantation.options = options = {
    compilers: {},
    compiler_order: [],
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
    if (__indexOf.call(options.packages, pkg) >= 0) {
      return plantation;
    }
    options.packages.push(pkg);
    pkg(plantation.proxy);
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
      _results.push(task(plantation));
    }
    return _results;
  };

  /*
  Registers a compiler function.
  */


  plantation.register_compiler = function(name, source, target, compiler) {
    var _ref;
    if (name in options.compilers) {
      throw new Error("Compiler with name `" + name + "` has already been registered");
    }
    if (!compiler) {
      _ref = [name, source, target], source = _ref[0], target = _ref[1], compiler = _ref[2];
    }
    options.compilers[name] = {
      name: name,
      source: source,
      target: target,
      compiler: compiler
    };
    return options.compiler_order.push(name);
  };

  /*
  A proxy object given to packages.
  */


  plantation.proxy = {
    register_compiler: plantation.register_compiler
  };

}).call(this);
