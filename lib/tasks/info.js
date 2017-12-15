(function() {
  module.exports = function(plantation) {
    var compilers, directories;
    ({compilers, directories} = plantation.config);
    return task('info', 'Shows info about plantation', () => {
      var i, len, name, results;
      console.log(`\nPlantation options:\n  directories:\n    current: ${directories.current}\n    source:  ${directories.source}\n    target:  ${directories.target}`);
      console.log("\n  compilers:");
      results = [];
      for (i = 0, len = compilers.length; i < len; i++) {
        ({name} = compilers[i]);
        results.push(console.log(`    ${name}`));
      }
      return results;
    });
  };

}).call(this);
