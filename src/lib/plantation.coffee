module.exports = (packages) ->
  require "./#{pkg}" for pkg in packages