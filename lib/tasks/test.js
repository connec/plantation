(function() {
  var directories, mocha, path, spawn;

  path = require('path');

  ({spawn} = require('child_process'));

  directories = null;

  module.exports = function(plantation) {
    var k, mocha_args, mocha_options, options, ref, v;
    ({directories, options} = plantation.config);
    mocha_options = {
      R: 'spec',
      recursive: true,
      require: 'coffeescript',
      require: directories.relative({
        current: path.join(__dirname, '..', 'test', 'support', 'test_helper')
      }),
      compilers: 'coffee:coffeescript/register'
    };
    if (options.mocha != null) {
      ref = options.mocha;
      for (k in ref) {
        v = ref[k];
        mocha_options[k] = v;
      }
    }
    mocha_args = [];
    for (k in mocha_options) {
      v = mocha_options[k];
      if (!v) {
        continue;
      }
      mocha_args.push(`-${(k.length === 1 ? '' : '-')}${k}`);
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
      cwd: directories.current,
      stdio: 'inherit'
    });
  };

}).call(this);
