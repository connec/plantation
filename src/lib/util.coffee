fs   = require 'fs'
path = require 'path'

###
Gets an array of all the files under the given root.

@param root Path to root directory
@return     Array of files under the given root
###
exports.readdir_recursive = (root) ->
  files = []
  for entry in fs.readdirSync root
    entry = path.join root, entry
    if fs.statSync(entry).isFile()
      files.push entry
    else
      files = files.concat exports.readdir_recursive entry
  files