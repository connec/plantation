(function() {
  var directories, mocha, options, path, spawn, _ref;

  path = require('path');

  spawn = require('child_process').spawn;

  _ref = plantation.config, directories = _ref.directories, options = _ref.options;

  module.exports = function() {
    var k, mocha_args, mocha_options, v, _ref1;
    mocha_options = {
      R: 'spec',
      recursive: true,
      require: 'coffee-script',
      require: directories.relative({
        current: path.join(__dirname, '..', 'test', 'support', 'test_helper')
      }),
      compilers: 'coffee:coffee-script'
    };
    if (options.mocha != null) {
      _ref1 = options.mocha;
      for (k in _ref1) {
        v = _ref1[k];
        mocha_options[k] = v;
      }
    }
    mocha_args = [];
    for (k in mocha_options) {
      v = mocha_options[k];
      if (!v) {
        continue;
      }
      mocha_args.push("-" + (k.length === 1 ? '' : '-') + k);
      if (v !== true) {
        mocha_args.push(v);
      }
    }
    task('test', 'Runs the project\'s tests on the source', function() {
      return mocha(mocha_args);
    });
    return task('test:watch', 'Watches the project\'s source and reruns tests on changes', function() {
      return mocha(mocha_args.concat(['--watch']));
    });
  };

  mocha = function(args) {
    return spawn(process.execPath, [path.join(path.dirname(require.resolve('mocha')), 'bin', 'mocha')].concat(args), {
      customFds: [0, 1, 2],
      cwd: directories.current
    });
  };

}).call(this);
