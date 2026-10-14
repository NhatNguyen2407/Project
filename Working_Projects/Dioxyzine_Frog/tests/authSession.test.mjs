import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('auth provider does not log session payloads to the browser console', () => {
  const source = readFileSync(new URL('../src/app/context/AuthContext.jsx', import.meta.url), 'utf8');

  // A session contains access/refresh tokens; logging its full object is unsafe.
  assert.doesNotMatch(source, /console\.(?:log|info|debug|warn|error)\s*\([^;]*(?:\bsession\b|\bcurrentUser\b)/i);
});
