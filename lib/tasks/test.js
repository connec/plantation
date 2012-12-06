(function() {
  var path, spawn;

  path = require('path');

  spawn = require('child_process').spawn;

  module.exports = function() {
    var mocha_args, test_cwd;
    test_cwd = this.config.directories.current;
    mocha_args = [path.join(path.dirname(require.resolve('mocha')), 'bin', 'mocha'), '-R', 'spec', '--recursive', '--require', 'coffee-script', '--require', path.relative(test_cwd, path.join(__dirname, '..', 'test', 'support', 'test_helper')), '--compilers', 'coffee:coffee-script'];
    task('test', 'Runs the project\'s tests on the source', function() {
      return spawn(process.execPath, mocha_args, {
        customFds: [0, 1, 2],
        cwd: test_cwd
      });
    });
    return task('test:watch', 'Watches the project\'s source and reruns tests on changes', function() {
      return spawn(process.execPath, mocha_args.concat(['--watch']), {
        customFds: [0, 1, 2],
        cwd: test_cwd
      });
    });
  };

}).call(this);
