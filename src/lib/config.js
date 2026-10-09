/**
 * Site-wide values used in <meta> tags and the nav.
 **/

export const siteTitle = 'Owen Stuckman'
export const siteDescription = 'Owen Stuckman — CS at Virginia Tech. Automation, robotics, and the software that keeps things moving.'
export const siteURL = 'owenstuckman.lol'
export const siteLink = 'https://github.com/owenstuckman/owenstuckman.github.io'
export const siteAuthor = 'Owen Stuckman'

// Shown on the blog lock screen
export const blogLockMessage = 'The blog is password protected. Text me for the password.'

// Number of project cards rendered per infinite-scroll batch
export const projectsBatchSize = 6

export const navItems = [
	{ title: 'About', route: '/', code: '01' },
	{ title: 'Projects', route: '/projects', code: '02' },
	{ title: 'Blog', route: '/blog', code: '03' },
]
