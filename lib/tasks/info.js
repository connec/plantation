(function() {
  var compilers, directories, _ref;

  _ref = plantation.config, compilers = _ref.compilers, directories = _ref.directories;

  module.exports = function() {
    var _this = this;
    return task('info', 'Shows info about plantation', function() {
      var name, _i, _len, _results;
      console.log("\nPlantation options:\n  directories:\n    current: " + directories.current + "\n    source:  " + directories.source + "\n    target:  " + directories.target);
      console.log("\n  compilers:");
      _results = [];
      for (_i = 0, _len = compilers.length; _i < _len; _i++) {
        name = compilers[_i].name;
        _results.push(console.log("    " + name));
      }
      return _results;
    });
  };

}).call(this);
