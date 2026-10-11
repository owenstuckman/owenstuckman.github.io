import data from '../jsons/experience.json';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2024-06" → 2024.417 (fractional year) */
export const toYear = (ym) => {
	const [y, m = 1] = ym.split('-').map(Number);
	return y + (m - 1) / 12;
};

export const formatMonth = (ym) => {
	if (!ym) return '?';
	if (ym === 'present') return 'Present';
	const [y, m] = ym.split('-').map(Number);
	return m ? `${MONTHS[m - 1]} ${y}` : `${y}`;
};

export const draft = !!data.draft;

/** Work history, oldest first, with codes (E-01 …) and display dates. */
export const experience = [...data.experience]
	.sort((a, b) => toYear(a.start) - toYear(b.start))
	.map((e, i) => ({
		...e,
		index: i,
		code: `E-${String(i + 1).padStart(2, '0')}`,
		dates: `${formatMonth(e.start)} – ${formatMonth(e.end)}`,
		startYear: toYear(e.start),
		// unknown end: draw it a little past the start; present: draw to today
		endYear:
			e.end === 'present'
				? new Date().getFullYear() + new Date().getMonth() / 12
				: e.end
					? toYear(e.end) + 1 / 12
					: toYear(e.start) + 0.75
	}));
