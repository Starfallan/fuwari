import type {
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
<<<<<<< HEAD
	title: "Elysiam",
	subtitle: "May you, the beauty of this world, always shine",
	lang: "zh_CN", // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
=======
	title: "Fuwari",
	subtitle: "Demo Site",
	lang: "en", // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
>>>>>>> cb6f97fc49b5b9e8627e3c1507ecd1d5e595b3dd
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
<<<<<<< HEAD
		enable: true,
		src: "assets/images/custom1.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: true, // Display the credit text of the banner image
			text: "Honkai 3rd", // Credit text to be displayed
=======
		enable: false,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
>>>>>>> cb6f97fc49b5b9e8627e3c1507ecd1d5e595b3dd
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
<<<<<<< HEAD
		depth: 3, // Maximum heading depth to show in the table, from 1 to 3
=======
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
>>>>>>> cb6f97fc49b5b9e8627e3c1507ecd1d5e595b3dd
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
<<<<<<< HEAD
			url: "https://github.com/Starfallan", // Internal links should not include the base path, as it is automatically added
=======
			url: "https://github.com/saicaca/fuwari", // Internal links should not include the base path, as it is automatically added
>>>>>>> cb6f97fc49b5b9e8627e3c1507ecd1d5e595b3dd
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
<<<<<<< HEAD
	avatar: "assets/images/demo-avatar.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Starfallen",
	bio: "May you, the beauty of this world, always shine",
	links: [
		{
			name: 'NetEaseMusic',
			icon: 'tabler:brand-netease-music',
			url: 'https://music.163.com/#/user/home?id=331341358',
		},
		// 添加Email
		{
			name: "Email",
			icon: "tabler:mail",
			url: "mailto:solihuan@foxmail.com",
=======
	avatar: "assets/images/demo-avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Lorem Ipsum",
	bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
	links: [
		{
			name: "Twitter",
			icon: "fa6-brands:twitter", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://twitter.com",
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://store.steampowered.com",
>>>>>>> cb6f97fc49b5b9e8627e3c1507ecd1d5e595b3dd
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
<<<<<<< HEAD
			url: "https://github.com/Starfallan", // Updated GitHub URL
=======
			url: "https://github.com/saicaca/fuwari",
>>>>>>> cb6f97fc49b5b9e8627e3c1507ecd1d5e595b3dd
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};
