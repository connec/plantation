for file in require('fs').readdirSync __dirname
  require "./#{file}"