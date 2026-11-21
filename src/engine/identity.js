// The player's identity: an Ed25519 key pair, kept with the profile like a wallet key.
// Proofs of play are signed with it, so a verified run can be credited to whoever played it.
// Browsers without Ed25519 in WebCrypto still record and verify runs; their proofs are just unsigned.
import { b64, unb64 } from './run.js';

const ALG = { name: 'Ed25519' };
export async function ensureKey(profile) {
  const d = profile.data;
  if (d.key && d.key.pub && d.key.priv) return d.key;
  try {
    const kp = await crypto.subtle.generateKey(ALG, true, ['sign', 'verify']);
    d.key = { pub: b64(new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey))), priv: await crypto.subtle.exportKey('jwk', kp.privateKey) };
    profile.save();
    return d.key;
  } catch (e) { return null; }
}
export async function signText(key, text) {
  const k = await crypto.subtle.importKey('jwk', key.priv, ALG, false, ['sign']);
  return b64(new Uint8Array(await crypto.subtle.sign(ALG, k, new TextEncoder().encode(text))));
}
// true / false, or null when this environment cannot check Ed25519 signatures
export async function verifyText(pub, text, sig) {
  let k;
  try { k = await crypto.subtle.importKey('raw', unb64(pub), ALG, false, ['verify']); } catch (e) { return null; }
  try { return await crypto.subtle.verify(ALG, k, unb64(sig), new TextEncoder().encode(text)); } catch (e) { return false; }
}
