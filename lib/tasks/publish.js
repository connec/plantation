/*
The publish tasks include:

- **bump:{major,minor,patch,pre}**
  Increase the version number in the package.yml file, and then build.

- **tag:{major,minor,patch,pre}**
  Bump, add, commit and then tag.  The commit message, tag, and tag message will all be `<new
  version>`.

  *Note:* only `package.json` and `<source directory>/package.yml` will be added to the commit.

- **publish:{major,minor,patch,pre}**
  Tag, push the current HEAD to origin as master, push tags, then npm publish.
*/


(function() {
  var VERSION_REGEX, build, bump, child_process, directories, exec, exec_sequence, fs, path, publish, semver, spawn, sty, tag, yaml;

  VERSION_REGEX = /^(\s*)(["']?)version\1(\s*):(\s*)(["']?)([^,\s]+)/m;

  directories = plantation.config.directories;

  build = require('./build');

  child_process = require('child_process');

  fs = require('fs');

  path = require('path');

  semver = require('semver');

  sty = require('sty');

  yaml = require('yaml-js');

  module.exports = function() {
    var bit, _fn, _fn1, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
    _ref = ['major', 'minor', 'patch', 'pre'];
    _fn = function(bit) {
      return task("bump:" + bit, "Bump the " + bit + " version", function() {
        return bump(bit);
      });
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      bit = _ref[_i];
      _fn(bit);
    }
    _ref1 = ['major', 'minor', 'patch', 'pre'];
    _fn1 = function(bit) {
      return task("tag:" + bit, "Bump then tag the repository", function() {
        bump(bit);
        return tag();
      });
    };
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      bit = _ref1[_j];
      _fn1(bit);
    }
    _ref2 = ['major', 'minor', 'patch', 'pre'];
    _results = [];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      bit = _ref2[_k];
      _results.push((function(bit) {
        return task("publish:" + bit, "Bump, tag then publish the package", function() {
          bump(bit);
          tag();
          return publish();
        });
      })(bit));
    }
    return _results;
  };

  /*
  Increments the `bit` bit of the `version` key in the `<source directory>/package.yml` file.
  */


  bump = function(bit) {
    var new_version, pkg, pkg_path, pkg_src;
    if (bit === 'pre') {
      bit = 'prerelease';
    }
    pkg_path = directories.relative({
      current: directories.resolve({
        source: 'package.yml'
      })
    });
    pkg_src = fs.readFileSync(pkg_path, 'utf8');
    pkg = yaml.load(pkg_src);
    new_version = semver.inc(pkg.version, bit);
    if (!new_version) {
      throw new Error("Invalid version present in " + pkg_path);
    }
    console.log("bumping " + pkg.version + " -> " + new_version);
    pkg_src = pkg_src.replace(VERSION_REGEX, "$1$2version$1$3:$4$5" + new_version);
    fs.writeFileSync(pkg_path, pkg_src);
    console.log(sty.green("wrote " + pkg_path));
    return invoke('build');
  };

  /*
  Commits `<source directory>/package.yml` and `package.json`, then tags the commit with the version
  in package.json.
  */


  tag = function() {
    var pkg_json, pkg_src, version;
    pkg_json = directories.resolve({
      current: 'package.json'
    });
    pkg_src = directories.relative({
      current: directories.resolve({
        source: 'package.yml'
      })
    });
    version = require(pkg_json).version;
    return exec_sequence(["git add " + pkg_json + " " + pkg_src, "git commit -m " + version, "git tag -a " + version + " -m " + version], function(e) {
      if (e != null) {
        console.error(sty.red("\nError tagging\n" + e.stack));
        return process.exit(1);
      } else {
        return console.log(sty.green("tagged " + version));
      }
    });
  };

  /*
  Pushes the current `HEAD` to `refs/heads/master`, pushes the release tag to `refs/tag/<new
  version>`, stashes anything in the repository, then publishes on npm.
  */


  publish = function() {
    var version;
    version = require(directories.resolve({
      current: 'package.json'
    })).version;
    return spawn('git', ['push', 'origin', 'HEAD:refs/heads/master', "refs/tags/" + version + ":refs/tags/" + version], function(e) {
      if (e != null) {
        console.error(sty.red("\nError publishing\n" + e.stack));
        process.exit(1);
      }
      return exec_sequence(["git stash -u", "npm publish", "git stash pop"], function(e) {
        if (e != null) {
          console.error(sty.red("\nError publishing\n" + e.stack));
          return process.exit(1);
        } else {
          return console.log(sty.green("published " + version));
        }
      });
    });
  };

  exec_sequence = function(commands, callback) {
    var command;
    command = commands[0];
    return exec(command, function(e) {
      if (e != null) {
        e.message = "Error executing " + command + ": " + e;
      }
      if ((e != null) || commands.length === 1) {
        return callback(e);
      } else {
        return exec_sequence(commands.slice(1), callback);
      }
    });
  };

  exec = function(command, callback) {
    var cwd;
    cwd = directories.current;
    return child_process.exec(command, {
      cwd: cwd
    }, callback);
  };

  spawn = function(command, args, callback) {
    var child, cwd;
    cwd = directories.current;
    child = child_process.spawn(command, args, {
      cwd: cwd,
      stdio: 'inherit'
    });
    return child.on('exit', function(code, signal) {
      var context;
      if (code || signal) {
        context = signal || ("code " + code);
        return callback(new Error("Error executing " + command + ": " + context));
      } else {
        return callback();
      }
    });
  };

}).call(this);
