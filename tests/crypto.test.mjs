import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encryptLetter, decryptLetter, normalizeLetter, toBase64Url, fromBase64Url } from '../src/crypto.js';
test('validates missing body', () => assert.throws(() => normalizeLetter({body:'  '}), /viết nội dung/));
test('truncates untrusted long text and restricts theme and font', () => {
 const l=normalizeLetter({body:'X'.repeat(4000),theme:'evil',font:'unsafe',recipient:'a'.repeat(100)});
 assert.equal(l.body.length, 3000); assert.equal(l.theme,'rose'); assert.equal(l.font,'serif'); assert.equal(l.recipient.length,80);
});
test('base64url roundtrip',()=>{const sample=Uint8Array.from([0,1,2,127,128,255]);assert.deepEqual(fromBase64Url(toBase64Url(sample)),sample);});
test('AES GCM encrypt/decrypt roundtrip with unicode',async()=>{
 const fragment=await encryptLetter({title:'Thư ✨',body:'Xin chào ❤️\nHẹn gặp!',sender:'An',recipient:'Bình',theme:'sage',font:'modern'});
 assert.match(fragment,/^#letter=v1\./);
 const l=await decryptLetter(fragment);
 assert.equal(l.body,'Xin chào ❤️\nHẹn gặp!');assert.equal(l.theme,'sage');assert.equal(l.recipient,'Bình');
});
test('tampered ciphertext is rejected',async()=>{
 const fragment=await encryptLetter({body:'secret'});
 const parts=fragment.split('.'); const data=parts[2];parts[2]=(data[0]==='A'?'B':'A')+data.slice(1);
 await assert.rejects(decryptLetter(parts.join('.')),/Không thể mở thư/);
});
test('wrong fragment format rejected',async()=>{await assert.rejects(decryptLetter('#letter=v3.abc'),/hợp lệ/);});
