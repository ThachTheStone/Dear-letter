// Decryption key and ciphertext are carried in the URL fragment, which is not sent in HTTP requests.
// This is an MVP for small text letters, not a server-backed delivery platform.
export const MAX_LETTER_CHARS = 3000;
export const MAX_SHARE_URL_CHARS = 12000;
export const styles = Object.freeze(['rose', 'cream', 'sage', 'night']);
export const fonts = Object.freeze(['serif', 'handwritten', 'modern']);
export function normalizeLetter(value) {
  if (!value || typeof value !== 'object') throw new Error('Dữ liệu thư không hợp lệ.');
  const clean = (v, n) => String(v ?? '').trim().slice(0, n);
  const body = clean(value.body, MAX_LETTER_CHARS);
  if (!body) throw new Error('Hãy viết nội dung bức thư trước khi chia sẻ.');
  return {
    recipient: clean(value.recipient, 80), sender: clean(value.sender, 80),
    title: clean(value.title, 100), body,
    theme: styles.includes(value.theme) ? value.theme : 'rose',
    font: fonts.includes(value.font) ? value.font : 'serif',
    date: new Date().toISOString().slice(0, 10)
  };
}
export function toBase64Url(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  // Chunking protects against argument limits for Uint8Array-to-string conversion.
  let binary = '';
  for (let i = 0; i < bytes.length; i += 4096) binary += String.fromCharCode(...bytes.subarray(i, i + 4096));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function fromBase64Url(str) {
  if (!/^[A-Za-z0-9_-]+$/.test(str)) throw new Error('Liên kết thư không hợp lệ.');
  const binary = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
export async function encryptLetter(value) {
  const letter = normalizeLetter(value);
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(letter));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
  const rawKey = await crypto.subtle.exportKey('raw', key);
  return `#letter=v1.${toBase64Url(iv)}.${toBase64Url(ciphertext)}.${toBase64Url(rawKey)}`;
}
export async function decryptLetter(fragment) {
  if (typeof fragment !== 'string' || fragment.length > MAX_SHARE_URL_CHARS) throw new Error('Liên kết quá dài hoặc không hợp lệ.');
  const match = fragment.match(/^#letter=v1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/);
  if (!match) throw new Error('Không tìm thấy dữ liệu thư hợp lệ.');
  const iv = fromBase64Url(match[1]);
  const data = fromBase64Url(match[2]);
  const rawKey = fromBase64Url(match[3]);
  if (iv.length !== 12 || rawKey.length !== 32 || data.length > 20000) throw new Error('Dữ liệu thư không hợp lệ.');
  try {
    const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    const parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(decrypted));
    const normalized = normalizeLetter(parsed);
    return { ...normalized, date: /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : normalized.date };
  } catch { throw new Error('Không thể mở thư. Liên kết có thể đã bị thay đổi.'); }
}
