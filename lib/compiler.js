(function() {
  var Compiler, fs, relative, resolve;

  fs = require('fs');

  ({relative, resolve} = require('./plantation').config.directories);

  /*
  A Compiler instance encapsulates the functionality required to compile a source file.
  */
  module.exports = Compiler = (function() {
    class Compiler {
      /*
      Initialises a new instance.
      */
      constructor(name, _source_descriptor, _target_descriptor, _compile) {
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
      compile(source) {
        var e, error, target;
        target = this.make_target(source);
        error = null;
        try {
          fs.writeFileSync(target, this._compile(fs.readFileSync(source, 'utf8'), {
            filename: source
          }));
        } catch (error1) {
          e = error1;
          error = e;
        }
        return new this.Result(source, target, error);
      }

      /*
      Gets the source filter.
      */
      get_source_filter() {
        var ext;
        if (typeof this._source_descriptor === 'function') {
          return function(source) {
            return !!this._source_descriptor(relative({source}));
          };
        } else if (typeof this._source_descriptor === 'string') {
          ext = this._source_descriptor[0] === '.' ? this._source_descriptor : '.' + this._source_descriptor;
          return function(source) {
            return source.slice(-ext.length) === ext;
          };
        } else if (this._source_descriptor instanceof RegExp) {
          return (source) => {
            return !!relative({source}).match(this._source_descriptor);
          };
        } else {
          throw new Exception(`Don't know how to use source descriptor: ${util.inspect(this._source_descriptor)}`);
        }
      }

      /*
      Gets the target builder.
      */
      get_target_builder() {
        var ext;
        if (typeof this._target_descriptor === 'function') {
          return (source) => {
            return resolve({
              target: this._target_descriptor(relative({source}))
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
          throw new Exception(`Don't know how to use target descriptor: ${util.inspect(this._target_descriptor)}`);
        }
      }

    };

    /*
    Represents a compilation result.
    */
    Compiler.prototype.Result = class Result {
      /*
      Initialises a new instance.
      */
      constructor(source1, target1, error1 = null) {
        this.source = source1;
        this.target = target1;
        this.error = error1;
      }

      /*
      Determines whether this is a successful compilation result.
      */
      is_success() {
        return this.error == null;
      }

    };

    return Compiler;

  })();

}).call(this);
