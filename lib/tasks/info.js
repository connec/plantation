(function() {

  module.exports = function(plantation) {
    return task('info', 'Shows info about plantation', function() {
      var name, pkg, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;
      console.log("\nPlantation options:\n  directories:\n    current: " + plantation.options.directories.current + "\n    source:  " + plantation.options.directories.source + "\n    target:  " + plantation.options.directories.target);
      console.log("\n  packages:");
      _ref = plantation.options.packages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pkg = _ref[_i];
        name = (_ref1 = pkg.package_name) != null ? _ref1 : '[unknown]';
        console.log("    " + name);
      }
      console.log("\n  compilers:");
      _ref2 = plantation.options.compiler_order;
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        name = _ref2[_j];
        _results.push(console.log("    " + name));
      }
      return _results;
    });
  };

}).call(this);
