/**
 * Execute a destructive-to-TEST-DATA-ONLY PostgreSQL concurrency/permission drill.
 *
 * Safety: Only accepts an explicit disposable DB name via loopback:54322.
 * Cannot connect to Supabase cloud; does not touch production or use paid tools.
 * Requires local `psql` and a local PostgreSQL server with service_role/anon
 * and authenticated roles. Not invoked by normal CI.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SQL_PATH = resolve(HERE, '../docs/drafts/INQUIRY_RATE_LIMIT_DRAFT.sql');
const TEST_DB = 'dioxyzine_rate_limit_test';
const TEST_ACK = 'DISPOSABLE_LOCAL_TEST_DB';

export function parseLocalRateTestDatabase(value, confirmation) {
  if (confirmation !== TEST_ACK) {
    throw new Error('Local test database acknowledgement is required.');
  }
  let uri;
  try {
    uri = new URL(value);
  } catch {
    throw new Error('An explicit local PostgreSQL connection is required.');
  }
  if (!['postgres:', 'postgresql:'].includes(uri.protocol) ||
      !['127.0.0.1', 'localhost', '[::1]'].includes(uri.hostname) ||
      uri.port !== '54322' ||
      uri.pathname !== `/${TEST_DB}` ||
      uri.search || uri.hash || !uri.username) {
    throw new Error('Refusing connection: use only loopback:54322 and the named disposable test database.');
  }
  return Object.freeze({
    PGHOST: uri.hostname === '[::1]' ? '::1' : uri.hostname,
    PGPORT: uri.port,
    PGDATABASE: TEST_DB,
    PGUSER: decodeURIComponent(uri.username),
    PGPASSWORD: decodeURIComponent(uri.password),
    PGSSLMODE: 'disable',
    PGAPPNAME: 'dioxyzine_local_rate_limit_drill',
  });
}

function psql(env, args, { allowFailure = false } = {}) {
  return new Promise((resolvePromise, reject) => {
    let stdout = '';
    let stderr = '';
    const child = spawn('psql', ['-X', '-A', '-t', '-q', '-v', 'ON_ERROR_STOP=1', ...args], {
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', error => reject(new Error(
      error.code === 'ENOENT' ? 'Local PostgreSQL psql binary not installed.' : 'Unable to start local psql.'
    )));
    child.on('close', code => {
      if (code !== 0 && !allowFailure) {
        // Deliberately avoid printing stderr to prevent leaking connection details.
        return reject(new Error('Local PostgreSQL query failed. Verify the disposable DB and roles.'));
      }
      resolvePromise({ code, value: stdout.trim() });
    });
  });
}

const query = async (env, statement) => (await psql(env, ['-c', statement])).value;

export async function runLocalRateBudgetDrill(env, { sqlPath = SQL_PATH } = {}) {
  // Verify server identity *before* loading the draft SQL.
  const identity = await query(env,
    "select current_database() || '|' || coalesce(inet_server_addr()::text,'socket');");
  assert.ok([
    `${TEST_DB}|127.0.0.1`,
    `${TEST_DB}|::1`,
  ].includes(identity), 'Server-side identity did not confirm the disposable loopback database.');

  const draft = await readFile(sqlPath, 'utf8');
  assert.match(draft, /create table if not exists inquiry_internal\.request_budgets/i);
  await psql(env, ['-f', sqlPath]);

  const permissions = [
    "select has_function_privilege('anon', 'public.consume_inquiry_rate_budget(text,integer,integer)', 'EXECUTE')",
    "select has_function_privilege('authenticated', 'public.consume_inquiry_rate_budget(text,integer,integer)', 'EXECUTE')",
    "select has_function_privilege('service_role', 'public.consume_inquiry_rate_budget(text,integer,integer)', 'EXECUTE')",
    "select has_schema_privilege('anon', 'inquiry_internal', 'USAGE')",
    "select has_table_privilege('anon', 'inquiry_internal.request_budgets', 'INSERT')",
    "select has_table_privilege('authenticated', 'inquiry_internal.request_budgets', 'UPDATE')",
  ];
  const expected = ['f', 'f', 't', 'f', 'f', 'f'];
  for (let index = 0; index < permissions.length; index++) {
    assert.equal(await query(env, permissions[index]), expected[index],
      `Failed grant/privilege gate #${index + 1}`);
  }

  // Atomic contention test: 32 independent database connections race on one
  // unique scope key. Exactly 10 must reserve a spot in the fixed window.
  await query(env, 'truncate table inquiry_internal.request_budgets');
  const concurrent = await Promise.all(
    Array.from({ length: 32 }, () => query(env,
      "select case when public.consume_inquiry_rate_budget('inquiry-preverify',10,60) then 'allow' else 'deny' end"))
  );
  const allows = concurrent.filter(result => result === 'allow').length;
  const denies = concurrent.filter(result => result === 'deny').length;
  assert.equal(allows, 10, 'Race condition: exceeded authorized reservations.');
  assert.equal(denies, 22, 'Expected all remaining attempts to be denied.');
  assert.equal(
    await query(env, "select request_count from inquiry_internal.request_budgets where scope='inquiry-preverify'"),
    '10', 'Stored counter does not match accepted attempts.'
  );

  // Scope isolation and explicit rejection at the limit.
  const first = await query(env,
    "select public.consume_inquiry_rate_budget('inquiry-accepted',2,3600)");
  const second = await query(env,
    "select public.consume_inquiry_rate_budget('inquiry-accepted',2,3600)");
  const third = await query(env,
    "select public.consume_inquiry_rate_budget('inquiry-accepted',2,3600)");
  assert.deepEqual([first, second, third], ['t', 't', 'f']);
  assert.equal(
    await query(env, "select request_count from inquiry_internal.request_budgets where scope='inquiry-preverify'"),
    '10'
  );

  // Simulate expiration without sleeping for a full minute.
  await query(env,
    "update inquiry_internal.request_budgets set window_started_at = now() - interval '2 minutes' where scope='inquiry-preverify'");
  assert.equal(await query(env,
    "select public.consume_inquiry_rate_budget('inquiry-preverify',10,60)"), 't');
  assert.equal(await query(env,
    "select request_count from inquiry_internal.request_budgets where scope='inquiry-preverify'"), '1');

  // Explicitly check a role switch is rejected, not just grant metadata.
  const unauthorized = await psql(env,
    ['-c', "begin; set local role anon; select public.consume_inquiry_rate_budget('inquiry-preverify',100,60); rollback;"],
    { allowFailure: true });
  assert.notEqual(unauthorized.code, 0, 'Anonymous caller unexpectedly executed protected RPC.');

  await query(env, 'truncate table inquiry_internal.request_budgets');
  return Object.freeze({
    disposableDatabase: TEST_DB,
    concurrentAttempts: concurrent.length,
    allowed: allows,
    denied: denies,
    grantsVerified: permissions.length,
    counterReset: true,
    unauthorizedExecutionRejected: true,
    cleanup: true,
  });
}

const invokedAsCli = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (invokedAsCli) {
  try {
    const env = parseLocalRateTestDatabase(
      process.env.INQUIRY_LOCAL_DATABASE_URL,
      process.env.INQUIRY_RATE_TEST_ACK
    );
    const result = await runLocalRateBudgetDrill(env);
    process.stdout.write(`Local test succeeded: ${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`Local test not passed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
