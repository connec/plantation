(function() {
  var fs, path;

  fs = require('fs');

  path = require('path');


  /*
  Gets an array of all the files under the given root.
  
  @param root Path to root directory
  @return     Array of files under the given root
   */

  exports.readdir_recursive = function(root) {
    var entry, files, i, len, ref;
    files = [];
    ref = fs.readdirSync(root);
    for (i = 0, len = ref.length; i < len; i++) {
      entry = ref[i];
      entry = path.join(root, entry);
      if (fs.statSync(entry).isFile()) {
        files.push(entry);
      } else {
        files = files.concat(exports.readdir_recursive(entry));
      }
    }
    return files;
  };

}).call(this);
