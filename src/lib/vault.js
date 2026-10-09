/**
 * AES-GCM encryption with a PBKDF2-derived key, via Web Crypto.
 * Runs in Node at build time (encrypt) and in the browser (decrypt).
 */
const ITERATIONS = 250_000;
const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64 = (buf) => {
	let bin = '';
	for (const byte of new Uint8Array(buf)) bin += String.fromCharCode(byte);
	return btoa(bin);
};
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(password, salt) {
	const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
		'deriveKey'
	]);
	return crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
		base,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

/** @returns {Promise<{ salt: string, iv: string, data: string }>} */
export async function encrypt(value, password) {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await deriveKey(password, salt);
	const data = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		enc.encode(JSON.stringify(value))
	);
	return { salt: toB64(salt), iv: toB64(iv), data: toB64(data) };
}

/** Throws if the password is wrong (GCM auth tag fails). */
export async function decrypt(payload, password) {
	const key = await deriveKey(password, fromB64(payload.salt));
	const data = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: fromB64(payload.iv) },
		key,
		fromB64(payload.data)
	);
	return JSON.parse(dec.decode(data));
}
