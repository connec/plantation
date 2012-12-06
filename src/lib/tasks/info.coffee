module.exports = ->
  task 'info', 'Shows info about plantation', =>
    console.log """

      Plantation options:
        directories:
          current: #{@config.directories.current}
          source:  #{@config.directories.source}
          target:  #{@config.directories.target}
    """

    console.log "\n  packages:"
    for pkg in @config.packages
      console.log "    #{pkg.package_name ? '[unknown]'}"

    console.log "\n  compilers:"
    for { name } in @config.compilers
      console.log "    #{name}"