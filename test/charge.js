var convert = require('../lib')
  , assert = require('assert')
  , tests = {};

var EPSILON = 0.000001

tests['C to C'] = function () {
  assert.strictEqual( convert(1).from('C').to('C') , 1);
};

tests['C to mC'] = function () {
  assert.strictEqual( convert(1).from('C').to('mC') , 1000);
};

tests['mC to C'] = function () {
  assert.strictEqual( convert(1).from('mC').to('C') , 1/1000);
};

tests['C to μC'] = function () {
  assert.strictEqual( convert(1).from('C').to('μC') , 1000000);
};

tests['μC to C'] = function () {
  assert.strictEqual( convert(1).from('μC').to('C') , 1/1000000);
};

tests['C to nC'] = function () {
  assert.strictEqual(true, Math.abs(convert(1).from('C').to('nC') - 1e9) < EPSILON);
};

tests['nC to C'] = function () {
  assert.strictEqual( convert(1).from('nC').to('C') , 1e-9);
};

tests['C to pC'] = function () {
  assert.strictEqual( convert(1).from('C').to('pC') , 1e12);
};

tests['pC to C'] = function () {
  assert.strictEqual( convert(1).from('pC').to('C') , 1e-12);
};

module.exports = tests;
