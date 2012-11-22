path    = require 'path'
{spawn} = require 'child_process'

module.exports = (plantation) ->
  test_cwd = plantation.options.directories.current

  mocha_args = [
    path.join path.dirname(require.resolve 'mocha'), 'bin', 'mocha'
    '-R', 'spec'
    '--recursive',
    '--require', 'coffee-script'
    '--require', path.relative test_cwd, path.join __dirname, '..', 'test', 'support', 'test_helper'
    '--compilers', 'coffee:coffee-script'
  ]

  task 'test', 'Runs the project\'s tests on the source', ->
    spawn process.execPath, mocha_args, customFds: [ 0, 1, 2 ], cwd: test_cwd

  task 'test:watch', 'Watches the project\'s source and reruns tests on changes', ->
    spawn process.execPath, mocha_args.concat([ '--watch' ]), customFds: [ 0, 1, 2 ], cwd: test_cwd