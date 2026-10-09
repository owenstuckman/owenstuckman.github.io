import { decrypt } from '$lib/vault.js';

const KEY = 'blog-password';

/** Session-wide unlock state so the password is entered once per visit. */
export const blogAuth = $state({ password: '' });

export function savedPassword() {
	try {
		return sessionStorage.getItem(KEY) ?? '';
	} catch {
		return '';
	}
}

export async function unlock(payload, password) {
	const value = await decrypt(payload, password);
	blogAuth.password = password;
	try {
		sessionStorage.setItem(KEY, password);
	} catch {}
	return value;
}
