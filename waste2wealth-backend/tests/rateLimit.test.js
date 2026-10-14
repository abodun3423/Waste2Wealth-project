const test = require('node:test');
const assert = require('node:assert/strict');
const rateLimit = require('../middleware/rateLimit');

test('authentication limiter permits requests up to its threshold then returns 429', () => {
  const middleware = rateLimit({ max: 2, windowMs: 60000 });
  const req = { ip: 'test-ip-threshold' };
  let allowed = 0;
  const res = { statusCode: 200, headers: {}, set(k,v) { this.headers[k]=v; return this; }, status(code) { this.statusCode=code; return this; }, json(payload) { this.payload=payload; return this; } };
  middleware(req,res,()=>allowed++);
  middleware(req,res,()=>allowed++);
  middleware(req,res,()=>allowed++);
  assert.equal(allowed,2);
  assert.equal(res.statusCode,429);
  assert.ok(Number(res.headers['Retry-After']) > 0);
});
test('authentication limiter keeps different client IPs independent', () => {
  const middleware = rateLimit({max: 1,windowMs:60000});
  let allowed=0;
  const res = {set() {return this;}, status() {return this;}, json() {return this;}};
  middleware({ip:'test-client-a'},res,()=>allowed++);
  middleware({ip:'test-client-b'},res,()=>allowed++);
  assert.equal(allowed,2);
});
