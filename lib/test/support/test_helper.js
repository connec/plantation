(function() {
  var chai, sinon, sinon_chai;

  chai = require('chai');

  sinon = require('sinon');

  sinon_chai = require('sinon-chai');

  chai.use(sinon_chai);

  global.expect = chai.expect;

  global.sinon = sinon;

}).call(this);
