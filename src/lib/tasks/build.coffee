coffee  = require 'coffee-script'
fs      = require 'fs'
glob    = require 'glob'
path    = require 'path'
{spawn} = require 'child_process'
yamljs  = require 'yaml-js'

coffee_args = [
  path.join path.dirname(require.resolve 'coffee-script'), '..', '..', 'bin', 'coffee'
  '--output',  '.'
  '--compile', 'src'
]

task 'build', 'Builds the project', ->
  invoke 'build:coffee'
  invoke 'build:yaml'

task 'build:coffee', ->
  spawn process.execPath, coffee_args, { customFds: [ 0, 1, 2 ] }

task 'build:yaml', ->
  glob 'src/{*.,**/*.}{yaml,yml}', (err, files) ->
    for file in files
      yaml = file.replace(/^src\//, '').replace(/ya?ml$/, 'json')
      fs.writeFileSync yaml, JSON.stringify (yamljs.load fs.readFileSync file), null, '  '