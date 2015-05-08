(function() {
  var compilers, directories, ref;

  ref = plantation.config, compilers = ref.compilers, directories = ref.directories;

  module.exports = function() {
    return task('info', 'Shows info about plantation', (function(_this) {
      return function() {
        var i, len, name, results;
        console.log("\nPlantation options:\n  directories:\n    current: " + directories.current + "\n    source:  " + directories.source + "\n    target:  " + directories.target);
        console.log("\n  compilers:");
        results = [];
        for (i = 0, len = compilers.length; i < len; i++) {
          name = compilers[i].name;
          results.push(console.log("    " + name));
        }
        return results;
      };
    })(this));
  };

}).call(this);
