(function() {

  module.exports = function() {
    var _this = this;
    return task('info', 'Shows info about plantation', function() {
      var name, pkg, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;
      console.log("\nPlantation options:\n  directories:\n    current: " + _this.config.directories.current + "\n    source:  " + _this.config.directories.source + "\n    target:  " + _this.config.directories.target);
      console.log("\n  packages:");
      _ref = _this.config.packages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pkg = _ref[_i];
        console.log("    " + ((_ref1 = pkg.package_name) != null ? _ref1 : '[unknown]'));
      }
      console.log("\n  compilers:");
      _ref2 = _this.config.compilers;
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        name = _ref2[_j].name;
        _results.push(console.log("    " + name));
      }
      return _results;
    });
  };

}).call(this);
