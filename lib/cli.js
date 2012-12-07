(function() {
  var cake, path, plantation;

  cake = require('coffee-script/lib/coffee-script/cake');

  path = require('path');

  plantation = require('./plantation');

  process.chdir(__dirname);

  cake.run();

}).call(this);
