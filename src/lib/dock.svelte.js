/**
 * State for the AGV in the top bar. Pages can take it over: the factory
 * reports where the camera is along the hall and offers stops to jump to.
 * Without an owner, the AGV shows how far the page is scrolled.
 */
export const dock = $state({
	owner: null, // e.g. 'factory'
	progress: 0, // 0…1 along the tape
	label: '',
	stops: [] // { label, at, go() }
});
