path       = require 'path'
plantation = require './plantation'

coffee_dir = path.dirname require.resolve 'coffee-script'
cake       = require path.join coffee_dir, './cake'

process.chdir __dirname
cake.run()