/**
 * All of these values are used throughout the site – for example, 
 * in the <meta> tags, in the footer, and in the RSS feed.
 * 
 * PLEASE BE SURE TO UPDATE THEM ALL! Thank you!
 **/ 

export const siteTitle = 'Owen Stuckman'
export const siteDescription = 'SvelteKit + mdsvex'
export const siteURL = 'owenstuckman.co'
export const siteLink = 'https://github.com/owenstuckman/owenstuckman.github.io'
export const siteAuthor = 'Owen Stuckman'

// Controls how many posts are shown per page on the main blog index pages
export const postsPerPage = 10

// Edit this to alter the main nav menu. (Also used by the footer and mobile nav.)
export const navItems = [
	{
		title: 'About',
		route: '/about'
	}, 
	{
		title: 'Projects',
		route: '/projects'	
	},
	{
		title: 'Contact',
		route: '/contact' 
	},
	/*
	{
		title: 'Blog',
		route: '/blog'
	}, 
	*/
]