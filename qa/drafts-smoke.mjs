// Usage: npm run dev, then: node qa/drafts-smoke.mjs "<path to chrome>" [http://127.0.0.1:4173/] [screenshot dir]
// Requires Chrome/Edge only (DevTools protocol over Node's built-in WebSocket; Node >= 22). Uses a throwaway profile.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = process.argv[2];
const URL_ = process.argv[3] || 'http://127.0.0.1:4173/';
const OUT = process.argv[4] || mkdtempSync(path.join(tmpdir(), 'dl-shots-'));
const port = 9333;
const profile = mkdtempSync(path.join(tmpdir(), 'dl-smoke-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch {}
  if (!target) await sleep(200);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let seq = 0; const pending = new Map(); const errors = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value).join(' '));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(m.params.entry.text);
});
const send = (method, params = {}) => new Promise(r => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async expr => {
  const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval failed');
  return r.result.result.value;
};
const load = async () => { await send('Page.navigate', { url: URL_ }); await sleep(800); await evaluate('window.confirm = () => window.__confirmAnswer ?? true; window.__confirms = []; const c = window.confirm; window.confirm = m => { window.__confirms.push(m); return c(m); };'); };
await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); };
const helpers = `
  const $ = id => document.getElementById(id);
  const type = (id, v) => { $(id).value = v; $(id).dispatchEvent(new Event('input', { bubbles: true })); };
  const items = () => [...document.querySelectorAll('#drafts-list li')].map(li => ({ title: li.querySelector('strong').textContent, meta: li.querySelector('small').textContent, current: li.getAttribute('aria-current') === 'true' }));
  const stored = () => JSON.parse(localStorage.getItem('dear-letter:drafts:v2') || 'null');
`;

// 1. Legacy v0.1 draft: listed, no write on load.
await load();
await evaluate(`localStorage.clear(); localStorage.setItem('dear-letter:draft:v1', JSON.stringify({ title: 'Thư cũ v0.1', body: 'Nội dung cũ ❤️', theme: 'night', font: 'handwritten' }));`);
await load();
let r = await evaluate(`${helpers} return { items: items(), v2: localStorage.getItem('dear-letter:drafts:v2'), count: $('drafts-count').textContent, emptyHidden: $('drafts-empty').hidden, editorBody: $('body').value };`);
check('legacy draft listed on load', r.items.length === 1 && r.items[0].title === 'Thư cũ v0.1' && /Bản nháp cũ/.test(r.items[0].meta), JSON.stringify(r.items));
check('no storage write on load (v2 key absent)', r.v2 === null);
check('editor not auto-filled on load', r.editorBody === '');

// 2. Open legacy, save -> migrated.
r = await evaluate(`${helpers} document.querySelector('#drafts-list li button').click(); const body = $('body').value, theme = document.querySelector('input[name=theme]:checked').value, font = $('font').value;
  $('save-draft').click(); return { body, theme, font, legacy: localStorage.getItem('dear-letter:draft:v1'), stored: stored(), items: items(), status: $('status').textContent };`);
check('legacy opens into editor with theme/font', r.body === 'Nội dung cũ ❤️' && r.theme === 'night' && r.font === 'handwritten', JSON.stringify(r));
check('legacy migrated on explicit save and old key removed', r.legacy === null && r.stored?.drafts.length === 1 && r.items.length === 1 && r.items[0].current, JSON.stringify(r.items));

// 3. Save again updates same ID.
r = await evaluate(`${helpers} const id = stored().drafts[0].id; type('body', 'Đã chỉnh sửa'); $('save-draft').click(); return { same: stored().drafts.length === 1 && stored().drafts[0].id === id && stored().drafts[0].body === 'Đã chỉnh sửa', status: $('status').textContent };`);
check('second save updates same draft', r.same && /cập nhật/.test(r.status), r.status);

// 4. New letter with unsaved changes: cancel keeps text, accept clears.
r = await evaluate(`${helpers} type('title', 'Chưa lưu'); window.__confirmAnswer = false; window.__confirms = []; $('new-letter').click();
  const kept = $('title').value; const asked = window.__confirms.length; window.__confirmAnswer = true; $('new-letter').click();
  return { kept, asked, cleared: $('title').value === '' && $('body').value === '', current: items().some(i => i.current), focus: document.activeElement.id };`);
check('new letter asks before discarding; cancel keeps text', r.asked === 1 && r.kept === 'Chưa lưu', JSON.stringify(r));
check('new letter clears editor and current marker, focuses recipient', r.cleared && !r.current && r.focus === 'recipient', JSON.stringify(r));

// 5. Untrusted text stays text (no HTML injection).
r = await evaluate(`${helpers} type('title', '<img src=x onerror="window.__xss=1">'); type('body', 'b'); $('save-draft').click();
  return { xss: window.__xss === 1, imgs: document.querySelectorAll('#drafts-list img').length, title: items()[0].title };`);
check('HTML in draft title rendered as text', !r.xss && r.imgs === 0 && r.title.startsWith('<img'), JSON.stringify(r));

// 6. Fill to 12, 13th refused.
r = await evaluate(`${helpers} for (let i = 0; i < 12; i++) { window.__confirmAnswer = true; $('new-letter').click(); type('body', 'Thư số ' + i); $('save-draft').click(); }
  return { n: stored().drafts.length, count: $('drafts-count').textContent, status: $('status').textContent, items: items().length };`);
check('13th draft refused at 12 with message', r.n === 12 && r.items === 12 && r.count === '(12/12)' && /12 bản nháp/.test(r.status), JSON.stringify(r));

// 7. Delete one: cancel keeps, accept removes.
r = await evaluate(`${helpers} const before = stored().drafts.length; window.__confirmAnswer = false; document.querySelectorAll('#drafts-list li')[1].querySelectorAll('button')[1].click(); const afterCancel = stored().drafts.length;
  window.__confirmAnswer = true; document.querySelectorAll('#drafts-list li')[1].querySelectorAll('button')[1].click(); return { before, afterCancel, after: stored().drafts.length, label: document.querySelector('#drafts-list li button').getAttribute('aria-label') };`);
check('delete asks; cancel keeps, accept removes one', r.before === 12 && r.afterCancel === 12 && r.after === 11, JSON.stringify(r));
check('row buttons have descriptive accessible names', /^Mở bản nháp: /.test(r.label), r.label);

// 8. Clear all keeps editor text.
r = await evaluate(`${helpers} type('body', 'Giữ lại'); window.__confirmAnswer = true; $('clear-drafts').click(); return { v2: localStorage.getItem('dear-letter:drafts:v2'), items: items().length, empty: !$('drafts-empty').hidden, clearHidden: $('clear-drafts').hidden, body: $('body').value };`);
check('clear all removes drafts, shows empty state, keeps editor text', r.v2 === null && r.items === 0 && r.empty && r.clearHidden && r.body === 'Giữ lại', JSON.stringify(r));

// 9. Corrupt storage.
await evaluate(`localStorage.setItem('dear-letter:drafts:v2', '{broken');`);
await load();
r = await evaluate(`${helpers} $('body').value = 'x'; $('body').dispatchEvent(new Event('input', { bubbles: true })); $('save-draft').click(); return { msg: $('drafts-empty').textContent, visible: !$('drafts-empty').hidden, clearVisible: !$('clear-drafts').hidden, raw: localStorage.getItem('dear-letter:drafts:v2'), status: $('status').textContent };`);
check('corrupt storage reported, not overwritten, clear-all offered', r.visible && /hỏng/.test(r.msg) && r.clearVisible && r.raw === '{broken' && /hỏng/.test(r.status), JSON.stringify(r));

// 10. Encrypted link still works end to end.
await evaluate(`localStorage.clear();`);
await load();
r = await evaluate(`${helpers} type('title', 'Thư ✨'); type('body', 'Xin chào ❤️'); document.querySelector('#letter-form button[type=submit]').click(); await new Promise(r => setTimeout(r, 500)); return $('share-url').value;`);
const shareUrl = r;
await send('Page.navigate', { url: shareUrl }); await sleep(800);
r = await evaluate(`const d = document.getElementById('read-dialog'); document.getElementById('open-letter').click(); return { open: d.open, body: document.getElementById('read-body').textContent };`);
check('encrypt -> open link -> read letter still works', r.open && r.body === 'Xin chào ❤️', JSON.stringify(r));

// 11. Responsive layout with drafts present.
await load();
await evaluate(`${helpers} localStorage.clear(); for (let i = 0; i < 3; i++) { $('new-letter').click(); type('title', 'Một tiêu đề rất dài để kiểm tra việc cắt chữ trên màn hình nhỏ số ' + i); type('recipient', 'Người nhận có tên khá dài'); type('body', 'x'); $('save-draft').click(); }`);
for (const [w, h] of [[1280, 900], [390, 844], [320, 700]]) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
  await sleep(300);
  r = await evaluate(`document.getElementById('drafts-heading').scrollIntoView({ block: 'start' }); const btns = [...document.querySelectorAll('#drafts-list button, #new-letter, #clear-drafts')].map(b => b.getBoundingClientRect()); const panel = document.getElementById('letter-form').getBoundingClientRect(); const contained = [...document.querySelectorAll('#drafts-list li, #drafts-list button')].every(e => { const b = e.getBoundingClientRect(); return b.left >= panel.left - 1 && b.right <= panel.right + 1; }); return { contained, overflow: document.documentElement.scrollWidth > window.innerWidth, minH: Math.min(...btns.map(b => b.height)), minW: Math.min(...btns.map(b => b.width)) };`);
  check(`${w}px: rows inside panel, no horizontal scroll, targets >= 44px`, r.contained && !r.overflow && r.minH >= 44 && r.minW >= 44, JSON.stringify(r));
  await sleep(200);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path.join(OUT, `drafts-${w}.png`), Buffer.from(shot.result.data, 'base64'));
}

check('no JS errors or console errors', errors.length === 0, errors.join(' | '));
const version = await send('Browser.getVersion');
console.log(`Browser: ${version.result.product}`);
for (const t of results) console.log(`${t.ok ? 'PASS' : 'FAIL'}  ${t.name}${t.ok ? '' : '  -> ' + t.detail}`);
console.log(`${results.filter(t => t.ok).length}/${results.length} passed`);
ws.close(); chrome.kill();
process.exit(results.every(t => t.ok) ? 0 : 1);
