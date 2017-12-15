(function() {

  /*
  Registers a compiler.
  */
  /*
  Registers default compilers for CoffeeScript and YAML.
  */
  var compiler_names, compilers, directories, path, plantation, register_default_compilers,
    indexOf = [].indexOf;

  path = require('path');

  /*
  The plantation object.
  */
  module.exports = plantation = function(options) {
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
  plantation.config = ({compilers, directories} = {
    compilers: [],
    directories: {
      current: path.resolve('.'),
      source: path.resolve('./src'),
      target: path.resolve('.')
    },
    options: {}
  });

  /*
  Resolves the given path against the chosen given directory.
  */
  directories.resolve = function(...args) {
    var type;
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
  directories.relative = function(...args) {
    var type;
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
    var i, len, ref, results, task;
    ref = require('./tasks');
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      task = ref[i];
      results.push(task(plantation));
    }
    return results;
  };

  compiler_names = [];

  plantation.register_compiler = function(name, source, target, compiler) {
    var Compiler, ref;
    Compiler = require('./compiler');
    if (name instanceof Compiler) {
      compiler = name;
    } else {
      if (compiler == null) {
        [source, target, compiler] = [name, source, target];
      }
      compiler = new Compiler(name, source, target, compiler);
    }
    if (ref = compiler.name, indexOf.call(compiler_names, ref) >= 0) {
      throw new Error(`Compiler with name \`${name}\` has already been registered`);
    }
    compiler_names.push(compiler.name);
    return compilers.push(compiler);
  };

  register_default_compilers = function() {
    var compile_coffee, compile_yaml;
    compile_coffee = require('coffeescript').compile;
    compile_yaml = function(source) {
      return JSON.stringify(require('yaml-js').load(source), null, '  ');
    };
    plantation.register_compiler('coffee', 'js', compile_coffee);
    return plantation.register_compiler('yaml', /\.ya?ml$/, 'json', compile_yaml);
  };

}).call(this);
