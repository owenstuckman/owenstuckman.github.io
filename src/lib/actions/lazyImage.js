/**
 * Marks an <img> as loaded (or failed) so CSS can fade it in over a skeleton.
 * Handles images that finished loading before hydration. A lazy image that
 * hasn't started downloading can report `complete` with no pixels yet, so
 * only a real `error` event marks it failed.
 */
export function lazyImage(img) {
	const done = () => {
		img.classList.remove('failed');
		img.classList.add('loaded');
	};
	const fail = () => img.classList.add('failed');

	if (img.complete && img.naturalWidth > 0) done();
	img.addEventListener('load', done);
	img.addEventListener('error', fail);

	return {
		destroy() {
			img.removeEventListener('load', done);
			img.removeEventListener('error', fail);
		}
	};
}
