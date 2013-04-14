{ compilers, directories } = plantation.config

module.exports = ->
  task 'info', 'Shows info about plantation', =>
    console.log """

      Plantation options:
        directories:
          current: #{directories.current}
          source:  #{directories.source}
          target:  #{directories.target}
    """

    console.log "\n  compilers:"
    for { name } in compilers
      console.log "    #{name}"