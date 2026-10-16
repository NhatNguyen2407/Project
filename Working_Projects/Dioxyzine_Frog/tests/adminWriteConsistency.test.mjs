import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/app/pages/AdminPage.jsx', import.meta.url), 'utf8');

function handlerBody(name) {
  const start = source.indexOf('const ' + name + ' = async');
  assert.ok(start >= 0, 'Missing handler ' + name);
  const end = source.indexOf('\n  };', start);
  assert.ok(end > start, 'Missing end of ' + name);
  return source.slice(start, end);
}

test('all eight Admin write handlers fail closed before DB or Storage calls', () => {
  for (const name of ["handleUpdateStatus","handleSaveReply","handleToggleReviewVisibility","handleSaveProduct","handleDeleteProduct","handleSaveVoucher","handleToggleVoucher","handleDeleteVoucher"]) {
    const body = handlerBody(name);
    const guard = body.indexOf('if (!allowAdminWrite()) return;');
    assert.ok(guard >= 0, name + ' missing guard');
    for (const api of ["supabase.from(", "supabase.storage.from("]) {
      const call = body.indexOf(api);
      if (call >= 0) assert.ok(guard < call, name + ' guards after external action');
    }
  }
  assert.match(source, /const allowAdminWrite = \(\) => \{[\s\S]*?canUseLiveExternalServices\(/);
});

test('reply and review visibility require confirmed single-row writes before UI success', () => {
  for (const name of ['handleSaveReply', 'handleToggleReviewVisibility']) {
    const body = handlerBody(name);
    const query = body.indexOf(".update(");
    const select = body.indexOf(".select('id')", query);
    const confirmation = body.indexOf('assertConfirmedMutation({ data, error }, id)', select);
    const ui = body.indexOf('setOrders(', confirmation);
    const toast = body.indexOf('toast.success(', ui);
    assert.ok(query >= 0 && select > query && confirmation > select && ui > confirmation && toast > ui, name);
  }
});

test('product upsert and voucher insert wait for database row confirmation', () => {
  const product = handlerBody('handleSaveProduct');
  assert.match(product, /\.upsert\(dataToSave\)\.select\('id'\)/);
  assert.match(product, /assertConfirmedMutation\(\{ data, error \}, productForm\.id\)/);
  const voucher = handlerBody('handleSaveVoucher');
  assert.match(voucher, /\.insert\(\[finalData\]\)\.select\('id'\)/);
  assert.match(voucher, /assertSingleInsertedRow\(\{ data, error \}\)/);
});
