/**
 * Marks an <img> as loaded (or failed) so CSS can fade it in over a skeleton.
 * Handles images that finished loading before hydration.
 */
export function lazyImage(img) {
	const done = () => img.classList.add('loaded');
	const fail = () => img.classList.add('failed');

	if (img.complete) {
		img.naturalWidth > 0 ? done() : fail();
		return;
	}
	img.addEventListener('load', done, { once: true });
	img.addEventListener('error', fail, { once: true });

	return {
		destroy() {
			img.removeEventListener('load', done);
			img.removeEventListener('error', fail);
		}
	};
}
