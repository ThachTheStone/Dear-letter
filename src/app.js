import { encryptLetter, decryptLetter, MAX_LETTER_CHARS, MAX_SHARE_URL_CHARS } from './crypto.js';

const $ = id => document.getElementById(id);
const form = $('letter-form');
const draftKey = 'dear-letter:draft:v1';
const read = id => $(id).value;
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
$('save-draft').addEventListener('click', () => {
  try { localStorage.setItem(draftKey, JSON.stringify(getLetter())); setSafeText('status', 'Đã lưu nháp trên trình duyệt này (không mã hóa).'); }
  catch { setSafeText('status', 'Không lưu được nháp trên trình duyệt này.'); }
});
$('clear-draft').addEventListener('click', () => {
  localStorage.removeItem(draftKey);
  form.reset(); $('body').value = ''; render();
  setSafeText('status', 'Đã xóa bản nháp được lưu trên thiết bị và làm mới biểu mẫu.');
});
try {
  const raw = localStorage.getItem(draftKey);
  if (raw) {
    const l = JSON.parse(raw);
    for (const id of ['recipient', 'sender', 'title', 'body']) $(id).value = String(l[id] ?? '').slice(0, id === 'body' ? 3000 : 100);
    if (['rose','cream','sage','night'].includes(l.theme)) form.querySelector(`input[name="theme"][value="${l.theme}"]`).checked = true;
    if (['serif','handwritten','modern'].includes(l.font)) $('font').value = l.font;
    setSafeText('status', 'Đã khôi phục bản nháp đã lưu trên thiết bị này.');
  }
} catch { setSafeText('status', 'Không thể khôi phục bản nháp.'); }
render();

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
