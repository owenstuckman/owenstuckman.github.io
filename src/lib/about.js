// About content — drawn onto the factory wall and rendered as the text version.
// `headline` comes from LinkedIn via `npm run import:linkedin` (src/jsons/profile.json).
import profile from '../jsons/profile.json';

export const about = {
	headline: profile.headline ?? '',
	name: 'Owen Stuckman',
	lede: "I'm an undergraduate studying computer science with a minor in cybersecurity at Virginia Tech.",
	paragraphs: [
		"My professional interest is currently focused on automation, whether that's cloud-based or desktop robotic process automation. I enjoy creating and improving systems so people can spend time on things that matter rather than on inefficiencies or manual analog processes.",
		"I've worked across multiple industries including moving and storage, consumer packaged goods, small business food, hospitality, and more.",
		'In my free time I like to run, play spikeball and pickleball, work on my personal projects and businesses, and backpack.'
	],
	tooling: [
		{ name: 'Flutter + Dart', note: 'mobile apps' },
		{ name: 'Supabase', note: 'Postgres, auth, storage, edge functions' },
		{ name: 'Svelte', note: 'and React, for web apps' },
		{ name: 'TypeScript', note: 'most things on the web' },
		{ name: 'Python', note: 'automation, ML, CV' },
		{ name: 'Java, C++, C#', note: 'across a wide range of projects' },
		{ name: 'Power Platform', note: 'Microsoft RPA' },
		{ name: 'OpenCV', note: 'computer vision' },
		{ name: 'Whatever the job needs', note: "I'll learn it" }
	],
	github: 'https://github.com/owenstuckman'
};
