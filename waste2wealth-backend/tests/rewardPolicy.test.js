'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { verifiedPoints } = require('../lib/rewardPolicy');
test('one verified kilogram awards ten points', () => assert.equal(verifiedPoints(1), 10));
test('verified weights use ten points per kilogram', () => assert.equal(verifiedPoints(2.5), 25));
test('invalid weights are rejected', () => {
 for (const value of [0,-1,NaN,Infinity,'2',null,undefined]) assert.throws(() => verifiedPoints(value), RangeError);
});
