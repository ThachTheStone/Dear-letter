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
  setSafeText('preview-title', l.title || 'A message for you');
  setSafeText('preview-recipient', l.recipient || 'someone special');
  setSafeText('preview-body', l.body || 'Every good story starts with something you want to say...\n\nWrite what is in your heart and watch it appear right here.');
  setSafeText('preview-sender', l.sender || 'someone who always remembers you');
  setSafeText('count', `${l.body.length} / ${MAX_LETTER_CHARS}`);
  $('share-result').hidden = true;
}
const today = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
setSafeText('preview-date', today);
setSafeText('year', new Date().getFullYear());
form.addEventListener('input', render);
form.addEventListener('change', render);
form.addEventListener('submit', async e => {
  e.preventDefault();
  setSafeText('status', 'Encrypting your letter…');
  try {
    const fragment = await encryptLetter(getLetter());
    const shareUrl = `${location.origin}${location.pathname}${fragment}`;
    if (shareUrl.length > MAX_SHARE_URL_CHARS) throw new Error('This letter is too long to share as a link. Please shorten it.');
    $('share-url').value = shareUrl;
    $('share-result').hidden = false;
    setSafeText('status', 'Your letter is encrypted on this device. You can copy the link now.');
  } catch (error) { setSafeText('status', error.message || 'Could not create the link.'); }
});
$('copy-link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('share-url').value); setSafeText('status', 'Link copied.'); }
  catch { $('share-url').focus(); $('share-url').select(); setSafeText('status', 'Could not copy automatically. Please copy the link from the field above.'); }
});
// ---- Draft library (T-011). Drafts are plaintext in this browser's localStorage only. ----
const storage = (() => { try { return window.localStorage; } catch { return null; } })();
let currentDraftId = null;
let savedSnapshot = '';
const snapshot = () => JSON.stringify(sanitizeDraftFields(getLetter()));
const isDirty = () => snapshot() !== savedSnapshot;
const confirmDiscard = () => !isDirty() || window.confirm('This letter has unsaved changes. Discard them?');
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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
  title.textContent = draft.title.trim() || draft.body.trim().slice(0, 40) || '(Untitled)';
  const meta = document.createElement('small');
  const to = draft.recipient.trim() ? `To ${draft.recipient.trim()} · ` : '';
  meta.textContent = draft.legacy ? `${to}Older draft — save it to add it to your library` : `${to}Saved ${dateFormat.format(new Date(draft.updatedAt))}`;
  info.append(title, meta);
  const label = title.textContent;
  const open = Object.assign(document.createElement('button'), { type: 'button', className: 'btn btn-quiet', textContent: 'Open' });
  open.setAttribute('aria-label', `Open draft: ${label}`);
  open.addEventListener('click', () => openDraft(draft));
  const del = Object.assign(document.createElement('button'), { type: 'button', className: 'btn btn-quiet', textContent: 'Delete' });
  del.setAttribute('aria-label', `Delete draft: ${label}`);
  del.addEventListener('click', () => removeDraft(draft, label));
  li.append(info, open, del);
  return li;
}

function renderDrafts() {
  const list = $('drafts-list');
  if (!storage) {
    list.replaceChildren();
    setSafeText('drafts-empty', 'This browser does not allow saving drafts (browser storage is blocked).');
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
    ? 'Saved draft data on this device is damaged and cannot be read. Use “Delete all” to start again.'
    : 'No saved drafts yet. Choose “Save draft on this device” to keep the letter you are writing.');
  $('clear-drafts').hidden = drafts.length === 0 && !corrupt;
}

function openDraft(draft) {
  if (draft.id !== currentDraftId && !confirmDiscard()) return;
  fillForm(draft);
  currentDraftId = draft.id;
  savedSnapshot = snapshot();
  renderDrafts();
  setSafeText('status', `Opened draft “${draft.title.trim() || 'Untitled'}”.`);
  $('title').focus();
}

function removeDraft(draft, label) {
  if (!window.confirm(`Permanently delete draft “${label}”? This cannot be undone.`)) return;
  try {
    deleteDraft(storage, draft.id);
    // Keep the editor contents, but treat them as unsaved so the next save creates a new draft.
    if (draft.id === currentDraftId) { currentDraftId = null; savedSnapshot = ''; }
    setSafeText('status', 'Draft deleted.');
  } catch (error) { setSafeText('status', error.message); }
  renderDrafts();
}

$('save-draft').addEventListener('click', () => {
  try {
    const { id, created } = saveDraft(storage, getLetter(), { id: currentDraftId });
    currentDraftId = id;
    savedSnapshot = snapshot();
    setSafeText('status', created ? 'New draft saved in this browser (not encrypted).' : 'Draft updated.');
  } catch (error) {
    setSafeText('status', error instanceof DraftError ? error.message : 'Could not save the draft in this browser.');
  }
  renderDrafts();
});
$('new-letter').addEventListener('click', () => {
  if (!confirmDiscard()) return;
  form.reset(); render();
  currentDraftId = null;
  savedSnapshot = snapshot();
  renderDrafts();
  setSafeText('status', 'Started a new letter.');
  $('recipient').focus();
});
$('clear-drafts').addEventListener('click', () => {
  if (!window.confirm('Delete all drafts saved in this browser? This cannot be undone. The letter you are writing stays in the editor.')) return;
  try { clearDrafts(storage); setSafeText('status', 'All drafts deleted.'); }
  catch { setSafeText('status', 'Could not delete the drafts.'); }
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
    setSafeText('read-title', letter.title || 'A message for you');
    setSafeText('read-recipient', letter.recipient || 'someone special');
    setSafeText('read-body', letter.body);
    setSafeText('read-sender', letter.sender || 'Someone who cares about you');
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
