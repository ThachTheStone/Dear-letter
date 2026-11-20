// T-012 check: Vietnamese diacritics in the serif preview.
// Usage: npm run dev, then: node qa/diacritics-smoke.mjs "<path to chrome>" [http://127.0.0.1:4173/] [screenshot dir]
// No dependencies; needs Node >= 22 (global WebSocket).
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = process.argv[2];
const URL_ = process.argv[3] || 'http://127.0.0.1:4173/';
const OUT = process.argv[4] || mkdtempSync(path.join(tmpdir(), 'dl-vi-'));
const port = 9334;
const profile = mkdtempSync(path.join(tmpdir(), 'dl-vi-profile-'));
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
});
const send = (method, params = {}) => new Promise(r => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async expr => {
  const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval failed');
  return r.result.result.value;
};
// Font(s) the browser actually used to draw the node's text.
const platformFonts = async selector => {
  const { result: { root } } = await send('DOM.getDocument', { depth: -1 });
  const { result: { nodeId } } = await send('DOM.querySelector', { nodeId: root.nodeId, selector });
  const r = await send('CSS.getPlatformFontsForNode', { nodeId });
  return r.result.fonts.map(f => `${f.familyName}${f.isCustomFont ? ' (web)' : ''}:${f.glyphCount}`);
};

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });

await send('Page.enable'); await send('Runtime.enable'); await send('DOM.enable'); await send('CSS.enable');
await send('Page.navigate', { url: URL_ }); await sleep(800);

// Decomposed (NFD) input, as macOS/iOS keyboards can produce.
const NFD = 'Gửi người thương mến, chúc ngủ ngon. Đặc biệt: ế ữ ặ ỗ ị'.normalize('NFD');
await evaluate(`
  const $ = id => document.getElementById(id);
  const type = (id, v) => { $(id).value = v; $(id).dispatchEvent(new Event('input', { bubbles: true })); };
  type('recipient', ${JSON.stringify('Mến'.normalize('NFD'))});
  type('title', ${JSON.stringify('Thư gửi người thương'.normalize('NFD'))});
  type('body', ${JSON.stringify(NFD)});
`);
const preview = await evaluate(`return { body: document.getElementById('preview-body').textContent, rec: document.getElementById('preview-recipient').textContent };`);
check('NFD input is shown as NFC in preview', preview.body === NFD.normalize('NFC') && preview.rec === 'Mến', JSON.stringify(preview).slice(0, 80));
check('preview contains no combining marks', !/[̀-ͯ]/.test(preview.body + preview.rec));

const cssStack = await evaluate(`return getComputedStyle(document.getElementById('paper')).fontFamily;`);
check('serif preview stack does not start with Georgia', !/^\s*Georgia/i.test(cssStack), cssStack);
for (const sel of ['#preview-body', '.paper-signature', '#preview-title']) {
  const fonts = await platformFonts(sel);
  check(`${sel} drawn without Georgia`, fonts.length > 0 && !fonts.some(f => /^Georgia/i.test(f)), fonts.join(', '));
}

const shoot = async (name, width, height) => {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await sleep(300);
  const rect = await evaluate(`const p = document.getElementById('paper'); p.scrollIntoView({ block: 'start' }); const r = p.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: Math.min(r.height, 520) };`);
  await sleep(200);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 1 } });
  const file = path.join(OUT, `${name}.png`);
  writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
  return file;
};
const shots = [await shoot('t012-after-1280', 1280, 900), await shoot('t012-after-390', 390, 844)];
const noHScroll = await evaluate(`return document.documentElement.scrollWidth <= innerWidth;`);
check('390px: no horizontal scroll', noHScroll);

// For comparison only: force the old Georgia stack to show the original bug.
await evaluate(`document.getElementById('paper').style.fontFamily = "Georgia,'Times New Roman',serif";`);
shots.push(await shoot('t012-before-georgia-1280', 1280, 900));
check('no JS errors or console errors', errors.length === 0, errors.join(' | '));

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  [${r.detail}]` : ''}`);
console.log(`Screenshots: ${shots.join(', ')}`);
const passed = results.filter(r => r.ok).length;
console.log(`${passed}/${results.length} passed`);
ws.close(); chrome.kill();
process.exit(passed === results.length ? 0 : 1);
