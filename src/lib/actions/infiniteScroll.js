/**
 * Calls `onReach` whenever the node scrolls within `margin` of the viewport.
 * Re-observes after each call so a sentinel that stays visible keeps loading.
 */
export function infiniteScroll(node, { onReach, margin = '800px' }) {
	let callback = onReach;
	const observer = new IntersectionObserver(
		(entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				callback();
				// re-trigger if the sentinel is still on screen after new items render
				requestAnimationFrame(() => {
					observer.unobserve(node);
					observer.observe(node);
				});
			}
		},
		{ rootMargin: margin }
	);
	observer.observe(node);

	return {
		update(params) {
			callback = params.onReach;
		},
		destroy() {
			observer.disconnect();
		}
	};
}
