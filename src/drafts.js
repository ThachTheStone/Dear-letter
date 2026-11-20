// Browser-local draft library (T-011 / FR-005).
// Drafts are stored as PLAINTEXT in localStorage on this device only. They are never sent anywhere.
// All functions take a Storage-like object ({ getItem, setItem, removeItem }) so they can be tested in Node.
import { MAX_LETTER_CHARS, styles, fonts } from './crypto.js';

export const DRAFTS_KEY = 'dear-letter:drafts:v2';
export const LEGACY_KEY = 'dear-letter:draft:v1';
export const LEGACY_ID = 'legacy-v1';
export const MAX_DRAFTS = 12;
// Generous upper bound for 12 full drafts; anything larger is treated as corrupt rather than parsed.
export const MAX_STORED_CHARS = 200_000;
const ID_PATTERN = /^[a-f0-9]{32}$/;

export class DraftError extends Error {
  constructor(code, message) { super(message); this.name = 'DraftError'; this.code = code; }
}

const clip = (value, max) => String(value ?? '').slice(0, max);

/** Keep only known fields, cap their lengths and restrict theme/font to the allowlists. */
export function sanitizeDraftFields(value) {
  const v = value && typeof value === 'object' ? value : {};
  return {
    recipient: clip(v.recipient, 80),
    sender: clip(v.sender, 80),
    title: clip(v.title, 100),
    body: clip(v.body, MAX_LETTER_CHARS),
    theme: styles.includes(v.theme) ? v.theme : 'rose',
    font: fonts.includes(v.font) ? v.font : 'serif'
  };
}

export function isEmptyDraft(fields) {
  return !['recipient', 'sender', 'title', 'body'].some(k => fields[k].trim());
}

export function newDraftId(cryptoImpl = globalThis.crypto) {
  // getRandomValues also works on plain-HTTP origins, unlike crypto.randomUUID.
  const bytes = cryptoImpl.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function parseEntry(entry) {
  if (!entry || typeof entry !== 'object' || !ID_PATTERN.test(entry.id)) return null;
  const updatedAt = Number(entry.updatedAt);
  if (!Number.isFinite(updatedAt) || updatedAt < 0) return null;
  return { id: entry.id, updatedAt, ...sanitizeDraftFields(entry) };
}

function readStored(storage) {
  const raw = storage.getItem(DRAFTS_KEY);
  if (raw === null) return { drafts: [], corrupt: false };
  if (raw.length > MAX_STORED_CHARS) return { drafts: [], corrupt: true };
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { drafts: [], corrupt: true }; }
  if (!parsed || parsed.version !== 2 || !Array.isArray(parsed.drafts)) return { drafts: [], corrupt: true };
  const seen = new Set();
  const drafts = [];
  for (const entry of parsed.drafts.slice(0, MAX_DRAFTS)) {
    const draft = parseEntry(entry);
    if (draft && !seen.has(draft.id)) { seen.add(draft.id); drafts.push(draft); }
  }
  return { drafts, corrupt: false };
}

function readLegacy(storage) {
  const raw = storage.getItem(LEGACY_KEY);
  if (raw === null || raw.length > MAX_STORED_CHARS / MAX_DRAFTS) return null;
  try {
    const fields = sanitizeDraftFields(JSON.parse(raw));
    return isEmptyDraft(fields) ? null : { id: LEGACY_ID, updatedAt: 0, legacy: true, ...fields };
  } catch { return null; }
}

/**
 * Read all drafts, newest first. Never writes to storage.
 * A v0.1 single draft is listed with `legacy: true` until the author saves it explicitly.
 */
export function loadDrafts(storage) {
  const { drafts, corrupt } = readStored(storage);
  drafts.sort((a, b) => b.updatedAt - a.updatedAt);
  const legacy = readLegacy(storage);
  return { drafts: legacy ? [...drafts, legacy] : drafts, corrupt };
}

function writeStored(storage, drafts) {
  try {
    storage.setItem(DRAFTS_KEY, JSON.stringify({ version: 2, drafts: drafts.map(({ legacy, ...d }) => d) }));
  } catch {
    throw new DraftError('storage', 'Không lưu được nháp: bộ nhớ trình duyệt đầy hoặc bị chặn.');
  }
}

/**
 * Save the editor contents. Updates `id` if it exists, otherwise creates a new draft.
 * Saving the legacy v0.1 draft converts it into a v2 draft and only then removes the old key.
 * @returns {{ id: string, created: boolean }}
 */
export function saveDraft(storage, value, { id = null, now = Date.now(), makeId = newDraftId } = {}) {
  const fields = sanitizeDraftFields(value);
  if (isEmptyDraft(fields)) throw new DraftError('empty', 'Bản nháp đang trống, chưa có gì để lưu.');
  const { drafts, corrupt } = readStored(storage);
  if (corrupt) throw new DraftError('corrupt', 'Dữ liệu nháp trên thiết bị bị hỏng. Hãy dùng “Xóa tất cả” rồi lưu lại.');
  const index = id && id !== LEGACY_ID ? drafts.findIndex(d => d.id === id) : -1;
  if (index >= 0) {
    drafts[index] = { ...drafts[index], ...fields, updatedAt: now };
    writeStored(storage, drafts);
    return { id, created: false };
  }
  if (drafts.length >= MAX_DRAFTS) {
    throw new DraftError('limit', `Đã đủ ${MAX_DRAFTS} bản nháp. Hãy xóa bớt một bản trước khi lưu thư mới.`);
  }
  const newId = makeId();
  writeStored(storage, [...drafts, { id: newId, updatedAt: now, ...fields }]);
  if (id === LEGACY_ID) storage.removeItem(LEGACY_KEY);
  return { id: newId, created: true };
}

export function deleteDraft(storage, id) {
  if (id === LEGACY_ID) { storage.removeItem(LEGACY_KEY); return; }
  const { drafts, corrupt } = readStored(storage);
  if (corrupt) throw new DraftError('corrupt', 'Dữ liệu nháp bị hỏng. Hãy dùng “Xóa tất cả”.');
  const remaining = drafts.filter(d => d.id !== id);
  if (remaining.length !== drafts.length) writeStored(storage, remaining);
}

export function clearDrafts(storage) {
  storage.removeItem(DRAFTS_KEY);
  storage.removeItem(LEGACY_KEY);
}
