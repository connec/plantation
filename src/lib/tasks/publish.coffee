###
The publish tasks include:

- **bump:{major,minor,patch,pre}**
  Increase the version number in the package.yml file, and then build.

- **tag:{major,minor,patch,pre}**
  Bump, add, commit and then tag.  The commit message, tag, and tag message will all be `<new
  version>`.

  *Note:* only `package.json` and `<source directory>/package.yml` will be added to the commit.

- **publish:{major,minor,patch,pre}**
  Tag, push the current HEAD to origin as master, push tags, then npm publish.
###

VERSION_REGEX = ///
  ^(\s*)    # 1 - indent
  (["']?)   # 2 - opening quote for version key
  version
  \2
  (\s*)     # 3 - arbitrary spacing before :
  :
  (\s*)     # 4 - arbitrary spacing after :
  (["']?)   # 5 - opening quote for version value
  ([^,\s]+) # 6 - the version value
///m

build         = require './build'
child_process = require 'child_process'
fs            = require 'fs'
path          = require 'path'
semver        = require 'semver'
colors        = require 'colors/safe'
yaml          = require 'yaml-js'

directories   = null

module.exports = (plantation) ->
  { directories } = plantation.config

  bits = [ 'major', 'minor', 'patch', 'pre' ]

  # Iterate 3 times to ensure tasks are defined (and so appear) in the correct order

  for bit in bits then do (bit) ->
    task "bump:#{bit}",    "Bump the #{bit} version",            -> bump bit

  for bit in bits then do (bit) ->
    task "tag:#{bit}",     "Bump then tag the repository",       -> bump bit ; tag()

  for bit in bits then do (bit) ->
    task "publish:#{bit}", "Bump, tag then publish the package", -> bump bit ; tag() ; publish()

###
Increments the `bit` bit of the `version` key in the `<source directory>/package.yml` file.
###
bump = (bit) ->
  bit         = 'prerelease' if bit is 'pre'

  pkg_path    = directories.relative current: directories.resolve(source: 'package.yml')
  pkg_src     = fs.readFileSync pkg_path, 'utf8'
  pkg         = yaml.load pkg_src

  new_version = semver.inc pkg.version, bit
  throw new Error "Invalid version present in #{pkg_path}" unless new_version

  console.log "bumping #{pkg.version} -> #{new_version}"

  pkg_src = pkg_src.replace VERSION_REGEX, "$1$2version$2$3:$4$5#{new_version}"
  fs.writeFileSync pkg_path, pkg_src

  console.log colors.green "wrote #{pkg_path}"

  invoke 'build'

###
Commits `<source directory>/package.yml` and `package.json`, then tags the commit with the version
in package.json.
###
tag = ->
  pkg_json    = directories.resolve  current: 'package.json'
  pkg_src     = directories.relative current: directories.resolve(source: 'package.yml')
  { version } = require pkg_json

  exec_sequence [
    "git add #{pkg_json} #{pkg_src}"
    "git commit -m #{version}"
    "git tag -a #{version} -m #{version}"
  ], (e) ->
    if e?
      console.error colors.red "\nError tagging\n#{e.stack}"
      process.exit 1
    else
      console.log colors.green "tagged #{version}"

###
Pushes the current `HEAD` to `refs/heads/master`, pushes the release tag to `refs/tag/<new
version>`, stashes anything in the repository, then publishes on npm.
###
publish = ->
  { version } = require directories.resolve current: 'package.json'

  spawn 'git', [
    'push'
    'origin'
    'HEAD:refs/heads/master'
    "refs/tags/#{version}:refs/tags/#{version}"
  ], (e) ->
    if e?
      console.error colors.red "\nError publishing\n#{e.stack}"
      process.exit 1

    exec_sequence [
      "git stash -u"
      "npm publish"
      "git stash pop"
    ], (e) ->
      if e?
        console.error colors.red "\nError publishing\n#{e.stack}"
        process.exit 1
      else
        console.log colors.green "published #{version}"

exec_sequence = ([ command, commands... ], callback) ->
  exec command, (e) ->
    e?.message = "Error executing #{command}: #{e}"
    if e? or commands.length is 0
      callback e
    else
      exec_sequence commands, callback

exec = (command, callback) ->
  cwd = directories.current
  child_process.exec command, { cwd }, callback

spawn = (command, args, callback) ->
  cwd   = directories.current
  child = child_process.spawn command, args, { cwd, stdio: 'inherit' }
  child.on 'exit', (code, signal) ->
    if code or signal
      context = signal or "code #{code}"
      callback new Error "Error executing #{command}: #{context}"
    else
      callback()
