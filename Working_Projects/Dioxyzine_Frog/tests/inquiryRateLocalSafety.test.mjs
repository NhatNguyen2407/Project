import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseLocalRateTestDatabase,
} from '../scripts/verify-inquiry-rate-limit-local.mjs';

const ACK = 'DISPOSABLE_LOCAL_TEST_DB';

test('only the disposable local database and TCP port are accepted', () => {
  const accepted = parseLocalRateTestDatabase(
    'postgresql://tester:password@127.0.0.1:54322/dioxyzine_rate_limit_test', ACK
  );
  assert.deepEqual(accepted, {
    PGHOST: '127.0.0.1',
    PGPORT: '54322',
    PGDATABASE: 'dioxyzine_rate_limit_test',
    PGUSER: 'tester',
    PGPASSWORD: 'password',
    PGSSLMODE: 'disable',
    PGAPPNAME: 'dioxyzine_local_rate_limit_drill',
  });
});

test('no explicit disposable database acknowledgement means no connection', () => {
  const local = 'postgresql://tester:password@127.0.0.1:54322/dioxyzine_rate_limit_test';
  for (const ack of ['', undefined, 'YES', 'PRODUCTION', 'DISPOSABLE_TEST']) {
    assert.throws(() => parseLocalRateTestDatabase(local, ack));
  }
});

test('remote, cloud, non-test, alternate-port and connection string options fail closed', () => {
  const urls = [
    undefined, '', 'postgres://db.example.com/database',
    'postgresql://u:p@db.example.com:54322/dioxyzine_rate_limit_test',
    'postgresql://u:p@127.0.0.2:54322/dioxyzine_rate_limit_test',
    'postgresql://u:p@127.0.0.1:5432/dioxyzine_rate_limit_test',
    'postgresql://u:p@127.0.0.1:54322/postgres',
    'postgresql://u:p@127.0.0.1:54322/dioxyzine_rate_limit_test?sslmode=require',
    'postgresql://u:p@127.0.0.1:54322/dioxyzine_rate_limit_test#anything',
    'https://u:p@127.0.0.1:54322/dioxyzine_rate_limit_test',
    'postgresql://u:p@someproject.supabase.co:54322/dioxyzine_rate_limit_test',
  ];
  for (const url of urls) {
    assert.throws(() => parseLocalRateTestDatabase(url, ACK), String(url));
  }
});
