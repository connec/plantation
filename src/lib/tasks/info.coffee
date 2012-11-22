module.exports = (plantation) ->
  task 'info', 'Shows info about plantation', ->
    console.log """

      Plantation options:
        directories:
          current: #{plantation.options.directories.current}
          source:  #{plantation.options.directories.source}
          target:  #{plantation.options.directories.target}
    """

    console.log "\n  packages:"
    for pkg in plantation.options.packages
      name = pkg.package_name ? '[unknown]'
      console.log "    #{name}"

    console.log "\n  compilers:"
    for name in plantation.options.compiler_order
      console.log "    #{name}"