path    = require 'path'
{spawn} = require 'child_process'

directories = null

module.exports = (plantation) ->
  { directories, options } = plantation.config

  mocha_options =
    R:         'spec'
    recursive: true
    require:   'coffee-script'
    require:   directories.relative(current: path.join __dirname, '..', 'test', 'support', 'test_helper')
    compilers: 'coffee:coffee-script/register'

  if options.mocha?
    mocha_options[k] = v for k, v of options.mocha

  mocha_args = []
  for k, v of mocha_options
    continue unless v
    mocha_args.push "-#{if k.length is 1 then '' else '-'}#{k}"
    mocha_args.push v if v isnt true

  task 'test', 'Runs the project\'s tests on the source', ->
    mocha mocha_args

  task 'test:watch', 'Watches the project\'s source and reruns tests on changes', ->
    mocha mocha_args.concat [ '--watch' ]

mocha = (args) ->
  spawn process.execPath,
    [ path.join path.dirname(require.resolve 'mocha'), 'bin', 'mocha' ].concat(args),
    { customFds: [ 0, 1, 2 ], cwd: directories.current }