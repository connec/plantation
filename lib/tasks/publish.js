(function() {
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
  /*
  Increments the `bit` bit of the `version` key in the `<source directory>/package.yml` file.
  */
  /*
  Pushes the current `HEAD` to `refs/heads/master`, pushes the release tag to `refs/tag/<new
  version>`, stashes anything in the repository, then publishes on npm.
  */
  /*
  Commits `<source directory>/package.yml` and `package.json`, then tags the commit with the version
  in package.json.
  */
  var VERSION_REGEX, build, bump, child_process, colors, directories, exec, exec_sequence, fs, path, publish, semver, spawn, tag, yaml;

  VERSION_REGEX = /^(\s*)(["']?)version\2(\s*):(\s*)(["']?)([^,\s]+)/m; // 1 - indent
  // 2 - opening quote for version key
  // 3 - arbitrary spacing before :
  // 4 - arbitrary spacing after :
  // 5 - opening quote for version value
  // 6 - the version value

  build = require('./build');

  child_process = require('child_process');

  fs = require('fs');

  path = require('path');

  semver = require('semver');

  colors = require('colors/safe');

  yaml = require('yaml-js');

  directories = null;

  module.exports = function(plantation) {
    var bit, bits, fn, fn1, i, j, k, len, len1, len2, results;
    ({directories} = plantation.config);
    bits = ['major', 'minor', 'patch', 'pre'];
// Iterate 3 times to ensure tasks are defined (and so appear) in the correct order
    fn = function(bit) {
      return task(`bump:${bit}`, `Bump the ${bit} version`, function() {
        return bump(bit);
      });
    };
    for (i = 0, len = bits.length; i < len; i++) {
      bit = bits[i];
      fn(bit);
    }
    fn1 = function(bit) {
      return task(`tag:${bit}`, "Bump then tag the repository", function() {
        bump(bit);
        return tag();
      });
    };
    for (j = 0, len1 = bits.length; j < len1; j++) {
      bit = bits[j];
      fn1(bit);
    }
    results = [];
    for (k = 0, len2 = bits.length; k < len2; k++) {
      bit = bits[k];
      results.push((function(bit) {
        return task(`publish:${bit}`, "Bump, tag then publish the package", function() {
          bump(bit);
          return tag(publish);
        });
      })(bit));
    }
    return results;
  };

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
      throw new Error(`Invalid version present in ${pkg_path}`);
    }
    console.log(`bumping ${pkg.version} -> ${new_version}`);
    pkg_src = pkg_src.replace(VERSION_REGEX, `$1$2version$2$3:$4$5${new_version}`);
    fs.writeFileSync(pkg_path, pkg_src);
    console.log(colors.green(`wrote ${pkg_path}`));
    return invoke('build');
  };

  tag = function(callback) {
    var pkg_json, pkg_src, version;
    pkg_json = directories.resolve({
      current: 'package.json'
    });
    pkg_src = directories.relative({
      current: directories.resolve({
        source: 'package.yml'
      })
    });
    ({version} = require(pkg_json));
    return exec_sequence([`git add ${pkg_json} ${pkg_src}`, `git commit -m ${version}`, `git tag -a ${version} -m ${version}`], function(e) {
      if (e != null) {
        console.error(colors.red(`\nError tagging\n${e.stack}`));
        return process.exit(1);
      } else {
        console.log(colors.green(`tagged ${version}`));
        return typeof callback === "function" ? callback() : void 0;
      }
    });
  };

  publish = function() {
    var version;
    ({version} = require(directories.resolve({
      current: 'package.json'
    })));
    return spawn('git', ['push', 'origin', 'HEAD:refs/heads/master', `refs/tags/${version}:refs/tags/${version}`], function(e) {
      if (e != null) {
        console.error(colors.red(`\nError publishing\n${e.stack}`));
        process.exit(1);
      }
      return exec_sequence(["git stash -u", "npm publish", "git stash pop"], function(e) {
        if (e != null) {
          console.error(colors.red(`\nError publishing\n${e.stack}`));
          return process.exit(1);
        } else {
          return console.log(colors.green(`published ${version}`));
        }
      });
    });
  };

  exec_sequence = function([command, ...commands], callback) {
    return exec(command, function(e) {
      if (e != null) {
        e.message = `Error executing ${command}: ${e}`;
      }
      if ((e != null) || commands.length === 0) {
        return callback(e);
      } else {
        return exec_sequence(commands, callback);
      }
    });
  };

  exec = function(command, callback) {
    var cwd;
    cwd = directories.current;
    return child_process.exec(command, {cwd}, callback);
  };

  spawn = function(command, args, callback) {
    var child, cwd;
    cwd = directories.current;
    child = child_process.spawn(command, args, {
      cwd,
      stdio: 'inherit'
    });
    return child.on('exit', function(code, signal) {
      var context;
      if (code || signal) {
        context = signal || `code ${code}`;
        return callback(new Error(`Error executing ${command}: ${context}`));
      } else {
        return callback();
      }
    });
  };

}).call(this);
