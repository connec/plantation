(function() {
  var Compiler, fs, relative, resolve, _ref;

  fs = require('fs');

  _ref = require('./plantation').config.directories, relative = _ref.relative, resolve = _ref.resolve;

  /*
  A Compiler instance encapsulates the functionality required to compile a source file.
  */


  module.exports = Compiler = (function() {
    /*
      Initialises a new instance.
    */

    function Compiler(name, _source_descriptor, _target_descriptor, _compile) {
      this.name = name;
      this._source_descriptor = _source_descriptor;
      this._target_descriptor = _target_descriptor;
      this._compile = _compile;
      this.should_compile = this.get_source_filter();
      this.make_target = this.get_target_builder();
    }

    /*
      Compiles the given source file and saves the result.
    */


    Compiler.prototype.compile = function(source) {
      var error, target;
      target = this.make_target(source);
      error = null;
      try {
        fs.writeFileSync(target, this._compile(fs.readFileSync(source, 'utf8'), {
          filename: source
        }));
      } catch (e) {
        error = e;
      }
      return new this.Result(source, target, error);
    };

    /*
      Gets the source filter.
    */


    Compiler.prototype.get_source_filter = function() {
      var ext,
        _this = this;
      if (typeof this._source_descriptor === 'function') {
        return function(source) {
          return !!this._source_descriptor(relative({
            source: source
          }));
        };
      } else if (typeof this._source_descriptor === 'string') {
        ext = this._source_descriptor[0] === '.' ? this._source_descriptor : '.' + this._source_descriptor;
        return function(source) {
          return source.slice(-ext.length) === ext;
        };
      } else if (this._source_descriptor instanceof RegExp) {
        return function(source) {
          return !!relative({
            source: source
          }).match(_this._source_descriptor);
        };
      } else {
        throw new Exception("Don't know how to use source descriptor: " + (util.inspect(this._source_descriptor)));
      }
    };

    /*
      Gets the target builder.
    */


    Compiler.prototype.get_target_builder = function() {
      var ext,
        _this = this;
      if (typeof this._target_descriptor === 'function') {
        return function(source) {
          return resolve({
            target: _this._target_descriptor(relative({
              source: source
            }))
          });
        };
      } else if (typeof this._target_descriptor === 'string') {
        ext = this._target_descriptor[0] === '.' ? this._target_descriptor.slice(1) : this._target_descriptor;
        return function(source) {
          return resolve({
            target: relative({
              source: source.slice(0, +(source.lastIndexOf('.')) + 1 || 9e9) + ext
            })
          });
        };
      } else {
        throw new Exception("Don't know how to use target descriptor: " + (util.inspect(this._target_descriptor)));
      }
    };

    /*
      Represents a compilation result.
    */


    Compiler.prototype.Result = (function() {
      /*
          Initialises a new instance.
      */

      function Result(source, target, error) {
        this.source = source;
        this.target = target;
        this.error = error != null ? error : null;
      }

      /*
          Determines whether this is a successful compilation result.
      */


      Result.prototype.is_success = function() {
        return !(this.error != null);
      };

      return Result;

    })();

    return Compiler;

  })();

}).call(this);
