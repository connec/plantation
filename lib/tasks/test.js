(function() {
  var directories, mocha, path, spawn;

  path = require('path');

  spawn = require('child_process').spawn;

  directories = null;

  module.exports = function(plantation) {
    var k, mocha_args, mocha_options, options, ref, ref1, v;
    ref = plantation.config, directories = ref.directories, options = ref.options;
    mocha_options = {
      R: 'spec',
      recursive: true,
      require: 'coffee-script',
      require: directories.relative({
        current: path.join(__dirname, '..', 'test', 'support', 'test_helper')
      }),
      compilers: 'coffee:coffee-script/register'
    };
    if (options.mocha != null) {
      ref1 = options.mocha;
      for (k in ref1) {
        v = ref1[k];
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
