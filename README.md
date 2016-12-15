# Plantation

`plantation` is a collection of [cake](http://coffeescript.org/#cake) tasks to simplify working on
projects using multiple transpilers, particularly coffee-script and YAML.  It has strong opinions
about the tools you want to use.

## Status

The project is currently under very fitful development, and may be subject to breaking rewrites at
any time.

## Installation

There are two ways to install plantation:

1.  **Install globally**

    You can install `plantation` globally:

        npm install -g plantation

    You can then run `plantation` in your shell to see the list of commands available.

    *This option is not really recommended*, it ties all your projects to the same version.

2.  **Install locally**

    You can install `plantation` locally on a per-project basis:

        npm install plantation

    You can then run `node_module/.bin/plantation` in your shell to see the list of commands
    available.  Alternatively, you can create/modify a `Cakefile` to contain:

        do require 'plantation'

    You can then run `cake` in your shell to see the list of commands available.

    This will load the tasks from the local installation of `plantation`.  This allows you to lock
    your project on a specific version of `plantation`, giving you a way to hide from breaking
    changes.

## Usage

Run the commands below with the executable you installed.

-   **info**

    Shows the configuration that `plantation` will run with.  Configuration is typically inferred
    based on convention, but can be given explicitly (see [API](#api)).

    The configuration shown will look something like:

        Plantation options:
          directories:         # the directories plantation will use
            current: <cwd>     # the 'project directory'
            source:  <cwd>/src # the directory in which plantation will look for source files to compile
            target:  <cwd>     # the directory in which plantation will write compiled files
          compilers:           # the compilers plantation has registered
            coffee             # the coffee-script compiler
            yaml               # the YAML compiler

-   **build[:compiler]**

    Performs a build, either with all registered compilers or a specific compiler.

    A build involves trying to compile every source file with every compiler (though typically the
    compiler will only agree to compile files with a specific file extension).

    Running `plantation build` will produce something like:

        coffee : src/lib/class.coffee > lib/class.js
          yaml : src/package.yml      > package.json

-   **watch[:compiler]**

    Starts watching all files in the source directory.  When they change they will be built, either
    with the given compiler or with all registered compilers.

    Running `plantation watch`, then editting `src/package.yml` will produce something like:

        yaml : src/package.yml  >  package.json

-   **test[:watch]**

    `test` runs all tests using mocha.  `test:watch` provides the `--watch` argument to mocha.
    [`chai.expect`](http://chaijs.com/api/bdd/) and [`sinon`](http://sinonjs.org/) are available
    globally in the tests, and chai is configured to use
    [`sinon-chai`](https://github.com/domenic/sinon-chai) assertions.

    Default mocha configuration can be overidden by setting the `mocha` key when configuring
    plantation.

    See [the mocha homepage](http://mochajs.org/) for more information about mocha.

-   **bump:{major,minor,patch,pre}**

    Bumps a bit of the version and overwrites the version in `<source directory>/package.yml`, then
    performs a build to update `package.json`.  Uses [semver](https://github.com/isaacs/node-semver)
    for manipulating versions.

    The output from `bump:minor` might look like:

        bumping 0.2.3 -> 0.3.0
        wrote src/package.yml
          yaml : src/package.yml  >  package.json

-   **tag:{major,minor,patch,pre}**

    Performs a `bump` of the given bit, then commits the changed package file and tags the commit.
    The commit message, tag name, and tag message will all simply equal `<new version>`.

    The output from `tag:minor` might look like:

        bumping 0.2.3 -> 0.3.0
        wrote src/package.yml
          yaml : src/package.yml  >  package.json
        tagged 0.3.0

-   **publish:{major,minor,patch,pre}**

    Performs a `tag` of the given bit, then pushes the new `HEAD` to `origin/master`, pushes the
    new tag and publishes the new version to npm.

    The output from `publish:minor` might look like:

        bumping 0.2.3 -> 0.3.0
        wrote src/package.yml
          yaml : src/package.yml  >  package.json
        tagged 0.3.0
        [git push output]
           abc123..def456  HEAD -> master
         * [new tag]       0.3.0 -> 0.3.0
        published 0.3.0

## API

See source.
