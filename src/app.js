import { encryptLetter, decryptLetter, MAX_LETTER_CHARS, MAX_SHARE_URL_CHARS } from './crypto.js';
import { loadDrafts, saveDraft, deleteDraft, clearDrafts, sanitizeDraftFields, DraftError, MAX_DRAFTS, DRAFTS_KEY, LEGACY_KEY } from './drafts.js';

const $ = id => document.getElementById(id);
const form = $('letter-form');
const read = id => $(id).value.normalize('NFC');
const getLetter = () => ({ recipient: read('recipient'), sender: read('sender'), title: read('title'), body: read('body'), theme: new FormData(form).get('theme') || 'rose', font: read('font') });
function setSafeText(id, value) { $(id).textContent = value; }
function render() {
  const l = getLetter();
  const paper = $('paper');
  paper.className = `paper theme-${l.theme} font-${l.font}`;
  setSafeText('preview-title', l.title || 'Một lời gửi đến bạn');
  setSafeText('preview-recipient', l.recipient || 'người đặc biệt');
  setSafeText('preview-body', l.body || 'Mọi câu chuyện đẹp đều bắt đầu bằng một lời muốn nói...\n\nHãy viết điều đang ở trong tim bạn, và nhìn nó hiện lên ngay tại đây.');
  setSafeText('preview-sender', l.sender || 'một người luôn nhớ bạn');
  setSafeText('count', `${l.body.length} / ${MAX_LETTER_CHARS}`);
  $('share-result').hidden = true;
}
const today = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
setSafeText('preview-date', today);
setSafeText('year', new Date().getFullYear());
form.addEventListener('input', render);
form.addEventListener('change', render);
form.addEventListener('submit', async e => {
  e.preventDefault();
  setSafeText('status', 'Đang mã hóa bức thư…');
  try {
    const fragment = await encryptLetter(getLetter());
    const shareUrl = `${location.origin}${location.pathname}${fragment}`;
    if (shareUrl.length > MAX_SHARE_URL_CHARS) throw new Error('Thư quá dài để chia sẻ bằng liên kết. Hãy rút ngắn nội dung.');
    $('share-url').value = shareUrl;
    $('share-result').hidden = false;
    setSafeText('status', 'Thư đã được mã hóa trên thiết bị. Bạn có thể sao chép liên kết.');
  } catch (error) { setSafeText('status', error.message || 'Không thể tạo liên kết.'); }
});
$('copy-link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('share-url').value); setSafeText('status', 'Đã sao chép liên kết.'); }
  catch { $('share-url').focus(); $('share-url').select(); setSafeText('status', 'Không thể sao chép tự động. Hãy sao chép liên kết từ ô bên trên.'); }
});
// ---- Draft library (T-011). Drafts are plaintext in this browser's localStorage only. ----
const storage = (() => { try { return window.localStorage; } catch { return null; } })();
let currentDraftId = null;
let savedSnapshot = '';
const snapshot = () => JSON.stringify(sanitizeDraftFields(getLetter()));
const isDirty = () => snapshot() !== savedSnapshot;
const confirmDiscard = () => !isDirty() || window.confirm('Thư đang viết có thay đổi chưa lưu. Bỏ các thay đổi này?');
const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function fillForm(fields) {
  const f = sanitizeDraftFields(fields);
  for (const id of ['recipient', 'sender', 'title', 'body']) $(id).value = f[id];
  // f.theme is restricted to the allowlist, so it is safe inside the selector.
  form.querySelector(`input[name="theme"][value="${f.theme}"]`).checked = true;
  $('font').value = f.font;
  render();
}

function draftItem(draft) {
  const li = document.createElement('li');
  li.className = 'draft-item';
  if (draft.id === currentDraftId) li.setAttribute('aria-current', 'true');
  const info = document.createElement('div');
  info.className = 'draft-info';
  const title = document.createElement('strong');
  title.textContent = draft.title.trim() || draft.body.trim().slice(0, 40) || '(Chưa có tiêu đề)';
  const meta = document.createElement('small');
  const to = draft.recipient.trim() ? `Gửi ${draft.recipient.trim()} · ` : '';
  meta.textContent = draft.legacy ? `${to}Bản nháp cũ — lưu lại để chuyển sang thư viện` : `${to}Lưu lúc ${dateFormat.format(new Date(draft.updatedAt))}`;
  info.append(title, meta);
  const label = title.textContent;
  const open = Object.assign(document.createElement('button'), { type: 'button', className: 'btn btn-quiet', textContent: 'Mở' });
  open.setAttribute('aria-label', `Mở bản nháp: ${label}`);
  open.addEventListener('click', () => openDraft(draft));
  const del = Object.assign(document.createElement('button'), { type: 'button', className: 'btn btn-quiet', textContent: 'Xóa' });
  del.setAttribute('aria-label', `Xóa bản nháp: ${label}`);
  del.addEventListener('click', () => removeDraft(draft, label));
  li.append(info, open, del);
  return li;
}

function renderDrafts() {
  const list = $('drafts-list');
  if (!storage) {
    list.replaceChildren();
    setSafeText('drafts-empty', 'Trình duyệt này không cho phép lưu nháp (bộ nhớ bị chặn).');
    $('save-draft').disabled = true;
    return;
  }
  let result;
  try { result = loadDrafts(storage); } catch { result = { drafts: [], corrupt: true }; }
  const { drafts, corrupt } = result;
  list.replaceChildren(...drafts.map(draftItem));
  setSafeText('drafts-count', `(${drafts.filter(d => !d.legacy).length}/${MAX_DRAFTS})`);
  $('drafts-empty').hidden = drafts.length > 0 && !corrupt;
  setSafeText('drafts-empty', corrupt
    ? 'Dữ liệu nháp trên thiết bị bị hỏng và không đọc được. Hãy dùng “Xóa tất cả” để bắt đầu lại.'
    : 'Chưa có bản nháp nào. Nhấn “Lưu nháp trên thiết bị” để giữ lại thư đang viết.');
  $('clear-drafts').hidden = drafts.length === 0 && !corrupt;
}

function openDraft(draft) {
  if (draft.id !== currentDraftId && !confirmDiscard()) return;
  fillForm(draft);
  currentDraftId = draft.id;
  savedSnapshot = snapshot();
  renderDrafts();
  setSafeText('status', `Đã mở bản nháp “${draft.title.trim() || 'Chưa có tiêu đề'}”.`);
  $('title').focus();
}

function removeDraft(draft, label) {
  if (!window.confirm(`Xóa vĩnh viễn bản nháp “${label}”? Không thể hoàn tác.`)) return;
  try {
    deleteDraft(storage, draft.id);
    // Keep the editor contents, but treat them as unsaved so the next save creates a new draft.
    if (draft.id === currentDraftId) { currentDraftId = null; savedSnapshot = ''; }
    setSafeText('status', 'Đã xóa bản nháp.');
  } catch (error) { setSafeText('status', error.message); }
  renderDrafts();
}

$('save-draft').addEventListener('click', () => {
  try {
    const { id, created } = saveDraft(storage, getLetter(), { id: currentDraftId });
    currentDraftId = id;
    savedSnapshot = snapshot();
    setSafeText('status', created ? 'Đã lưu bản nháp mới trên trình duyệt này (không mã hóa).' : 'Đã cập nhật bản nháp.');
  } catch (error) {
    setSafeText('status', error instanceof DraftError ? error.message : 'Không lưu được nháp trên trình duyệt này.');
  }
  renderDrafts();
});
$('new-letter').addEventListener('click', () => {
  if (!confirmDiscard()) return;
  form.reset(); render();
  currentDraftId = null;
  savedSnapshot = snapshot();
  renderDrafts();
  setSafeText('status', 'Đã mở một lá thư mới.');
  $('recipient').focus();
});
$('clear-drafts').addEventListener('click', () => {
  if (!window.confirm('Xóa tất cả bản nháp đã lưu trên trình duyệt này? Không thể hoàn tác. Thư đang viết vẫn được giữ.')) return;
  try { clearDrafts(storage); setSafeText('status', 'Đã xóa tất cả bản nháp.'); }
  catch { setSafeText('status', 'Không xóa được bản nháp.'); }
  currentDraftId = null; savedSnapshot = '';
  renderDrafts();
});
// Keep the list in sync when drafts change in another tab.
window.addEventListener('storage', event => { if (event.key === null || event.key === DRAFTS_KEY || event.key === LEGACY_KEY) renderDrafts(); });

render();
savedSnapshot = snapshot();
renderDrafts();

async function showLetterFromHash() {
  if (!location.hash.startsWith('#letter=')) return;
  const dialog = $('read-dialog');
  try {
    const letter = await decryptLetter(location.hash);
    const paper = $('read-paper');
    paper.className = `paper read-paper theme-${letter.theme} font-${letter.font}`;
    setSafeText('read-title', letter.title || 'Một lời gửi đến bạn');
    setSafeText('read-recipient', letter.recipient || 'người đặc biệt');
    setSafeText('read-body', letter.body);
    setSafeText('read-sender', letter.sender || 'Một người thương bạn');
    setSafeText('read-date', letter.date);
    $('read-envelope').hidden = false; paper.hidden = true;
    dialog.showModal();
    // Do not strip the hash here: a recipient may copy this address to reopen the letter.
  } catch (error) { setSafeText('status', error.message); location.hash = ''; }
}
$('open-letter').addEventListener('click', () => { $('read-envelope').hidden = true; $('read-paper').hidden = false; });
$('close-read').addEventListener('click', () => $('read-dialog').close());
$('read-dialog').addEventListener('click', event => { if (event.target === $('read-dialog')) $('read-dialog').close(); });
window.addEventListener('hashchange', showLetterFromHash);
showLetterFromHash();
