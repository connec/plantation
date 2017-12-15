(function() {
  var cake, path, plantation;

  cake = require('coffeescript/lib/coffeescript/cake');

  path = require('path');

  plantation = require('./plantation');

  process.chdir(__dirname);

  cake.run();

}).call(this);
