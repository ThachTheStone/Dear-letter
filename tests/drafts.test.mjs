import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DRAFTS_KEY, LEGACY_KEY, LEGACY_ID, MAX_DRAFTS, MAX_STORED_CHARS, DraftError,
  loadDrafts, saveDraft, deleteDraft, clearDrafts, sanitizeDraftFields, newDraftId
} from '../src/drafts.js';

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  const writes = [];
  return {
    writes,
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { writes.push(['set', k]); map.set(k, String(v)); },
    removeItem: k => { writes.push(['remove', k]); map.delete(k); },
    raw: k => map.get(k)
  };
}
let counter = 0;
const ids = () => (++counter).toString(16).padStart(32, '0');
const letter = (n = 1) => ({ recipient: 'Bình', sender: 'An', title: `Thư ${n} ✨`, body: `Xin chào ❤️ lần ${n}`, theme: 'sage', font: 'modern' });

test('FR-005a: first save creates exactly one draft; saving again updates the same ID', () => {
  const s = memoryStorage();
  const first = saveDraft(s, letter(1), { now: 1000, makeId: ids });
  assert.equal(first.created, true);
  const second = saveDraft(s, { ...letter(1), body: 'Đã sửa' }, { id: first.id, now: 2000, makeId: ids });
  assert.deepEqual(second, { id: first.id, created: false });
  const { drafts } = loadDrafts(s);
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].body, 'Đã sửa');
  assert.equal(drafts[0].updatedAt, 2000);
});

test('drafts are listed newest first and preserve Vietnamese/emoji text', () => {
  const s = memoryStorage();
  saveDraft(s, letter(1), { now: 1, makeId: ids });
  saveDraft(s, letter(2), { now: 3, makeId: ids });
  saveDraft(s, letter(3), { now: 2, makeId: ids });
  assert.deepEqual(loadDrafts(s).drafts.map(d => d.title), ['Thư 2 ✨', 'Thư 3 ✨', 'Thư 1 ✨']);
  assert.equal(loadDrafts(s).drafts[0].body, 'Xin chào ❤️ lần 2');
});

test('FR-005b: a 13th draft is refused and existing data is untouched', () => {
  const s = memoryStorage();
  for (let i = 0; i < MAX_DRAFTS; i++) saveDraft(s, letter(i), { now: i, makeId: ids });
  const before = s.raw(DRAFTS_KEY);
  assert.throws(() => saveDraft(s, letter(99), { makeId: ids }), e => e instanceof DraftError && e.code === 'limit');
  assert.equal(s.raw(DRAFTS_KEY), before);
  // Updating an existing draft still works at the limit.
  const { drafts } = loadDrafts(s);
  assert.doesNotThrow(() => saveDraft(s, letter(50), { id: drafts[0].id, makeId: ids }));
});

test('saving with an ID that no longer exists (deleted in another tab) creates a new draft', () => {
  const s = memoryStorage();
  const r = saveDraft(s, letter(1), { id: 'f'.repeat(32), makeId: ids });
  assert.equal(r.created, true);
  assert.notEqual(r.id, 'f'.repeat(32));
});

test('FR-005c: v0.1 draft is listed without any write on load, and migrated only on explicit save', () => {
  const s = memoryStorage({ [LEGACY_KEY]: JSON.stringify({ title: 'Thư cũ', body: 'Nội dung cũ', theme: 'night', font: 'handwritten' }) });
  const { drafts } = loadDrafts(s);
  assert.equal(s.writes.length, 0, 'loading must not write to storage');
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].id, LEGACY_ID);
  assert.equal(drafts[0].legacy, true);
  assert.equal(drafts[0].theme, 'night');

  const saved = saveDraft(s, drafts[0], { id: LEGACY_ID, now: 5, makeId: ids });
  assert.equal(saved.created, true);
  assert.equal(s.raw(LEGACY_KEY), undefined, 'legacy key removed after successful save');
  const after = loadDrafts(s).drafts;
  assert.equal(after.length, 1);
  assert.equal(after[0].legacy, undefined);
  assert.equal(after[0].title, 'Thư cũ');
});

test('legacy draft is kept if migration fails because storage is full', () => {
  const s = memoryStorage({ [LEGACY_KEY]: JSON.stringify({ body: 'cũ' }) });
  s.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => saveDraft(s, { body: 'cũ' }, { id: LEGACY_ID, makeId: ids }), e => e.code === 'storage');
  assert.notEqual(s.raw(LEGACY_KEY), undefined);
});

test('empty drafts are not saved', () => {
  const s = memoryStorage();
  assert.throws(() => saveDraft(s, { body: '   ', title: '' }), e => e.code === 'empty');
  assert.equal(s.writes.length, 0);
});

test('delete removes one draft; deleting legacy removes the v0.1 key; clear removes everything', () => {
  const s = memoryStorage({ [LEGACY_KEY]: JSON.stringify({ body: 'cũ' }) });
  const a = saveDraft(s, letter(1), { now: 1, makeId: ids });
  const b = saveDraft(s, letter(2), { now: 2, makeId: ids });
  deleteDraft(s, a.id);
  assert.deepEqual(loadDrafts(s).drafts.map(d => d.id), [b.id, LEGACY_ID]);
  deleteDraft(s, LEGACY_ID);
  assert.deepEqual(loadDrafts(s).drafts.map(d => d.id), [b.id]);
  saveDraft(s, letter(3), { makeId: ids });
  s.setItem(LEGACY_KEY, JSON.stringify({ body: 'x' }));
  clearDrafts(s);
  assert.deepEqual(loadDrafts(s), { drafts: [], corrupt: false });
});

test('corrupt, oversized or wrong-shape storage is reported and never overwritten by save', () => {
  for (const raw of ['{not json', JSON.stringify({ version: 1, drafts: [] }), JSON.stringify([1, 2]), 'x'.repeat(MAX_STORED_CHARS + 1)]) {
    const s = memoryStorage({ [DRAFTS_KEY]: raw });
    assert.equal(loadDrafts(s).corrupt, true);
    assert.throws(() => saveDraft(s, letter(1), { makeId: ids }), e => e.code === 'corrupt');
    assert.equal(s.raw(DRAFTS_KEY), raw);
    clearDrafts(s);
    assert.equal(loadDrafts(s).corrupt, false);
  }
});

test('untrusted stored entries are filtered and sanitized', () => {
  const good = { id: 'a'.repeat(32), updatedAt: 1, body: 'ok', theme: 'evil" onclick="x', font: '<script>', title: 'T'.repeat(500), extra: 'drop me' };
  const s = memoryStorage({ [DRAFTS_KEY]: JSON.stringify({ version: 2, drafts: [
    good, { ...good }, // duplicate ID ignored
    { id: '../../etc', updatedAt: 1, body: 'bad id' },
    { id: 'b'.repeat(32), updatedAt: 'NaN', body: 'bad time' },
    null, 'string'
  ] }) });
  const { drafts, corrupt } = loadDrafts(s);
  assert.equal(corrupt, false);
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].theme, 'rose');
  assert.equal(drafts[0].font, 'serif');
  assert.equal(drafts[0].title.length, 100);
  assert.equal('extra' in drafts[0], false);
});

test('sanitizeDraftFields caps lengths and keeps whitespace typed by the author', () => {
  const f = sanitizeDraftFields({ body: '  a\n\n b  '.padEnd(5000, 'x'), recipient: 'r'.repeat(90) });
  assert.equal(f.body.length, 3000);
  assert.ok(f.body.startsWith('  a\n\n b'));
  assert.equal(f.recipient.length, 80);
});

test('NFD input is stored and returned as NFC so diacritics stay attached to their letter', () => {
  const s = memoryStorage();
  const nfd = 'me\u0302\u0301n';
  assert.notEqual(nfd, 'm\u1ebfn');
  saveDraft(s, { recipient: nfd, title: nfd, body: `Chúc ${nfd} vui vẻ` }, { now: 1, makeId: ids });
  const [draft] = loadDrafts(s).drafts;
  assert.equal(draft.recipient, 'm\u1ebfn');
  assert.equal(draft.title, 'm\u1ebfn');
  assert.equal(draft.body, 'Chúc m\u1ebfn vui vẻ');
  assert.ok(s.raw(DRAFTS_KEY).includes('"title":"m\u1ebfn"'), 'stored JSON is NFC');
});

test('newDraftId returns 32 lowercase hex characters', () => {
  const id = newDraftId();
  assert.match(id, /^[a-f0-9]{32}$/);
  assert.notEqual(id, newDraftId());
});
