const test = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const auth = require('../auth');

test('Auth module - Password hashing generates expected MD5 hash', () => {
  const hash = auth.hashPasswordInsecure('admin123');
  assert.strictEqual(typeof hash, 'string');
  assert.strictEqual(hash.length, 32);
});

test('Auth module - SQL query builder generates query structure', () => {
  const query = auth.buildUserQuery('admin', 'password123');
  assert.match(query, /SELECT \* FROM users WHERE username = 'admin'/);
});

test('Auth module - Login simulator returns JWT token', () => {
  const result = auth.loginUser('john_doe', 'secretPass');
  assert.strictEqual(result.authenticated, true);
  assert.strictEqual(result.user, 'john_doe');
  assert.ok(result.token);
});

test('Auth module - Payload execution handles valid JSON object', () => {
  const res = auth.executePayload('{"name": "test", "active": true}');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.name, 'test');
});

test('App module - Exports Express application instance', () => {
  assert.ok(app);
  assert.strictEqual(typeof app.listen, 'function');
});
