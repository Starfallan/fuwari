---
title: 在Vercel上部署Fuwari博客
published: 2025-05-04
description: '在Vercel上部署Fuwari博客的详细步骤和经验分享'
image: ''
tags: [Vercel, Blog, Astro, 前端]
category: 'Linux'
draft: false 
lang: ''
---
# 1. 博客历程回忆
## 1.1早期的 Hexo
其实大概五六年前就开始瞎琢磨博客，当时觉得互联网上拥有博客的人很帅，有一个能够展示自己的地方，就开始琢磨着写第一个博客。没钱吗，就得琢磨着白嫖。最早好像是用的 Hexo 和 Github Pages 搭建的第一个博客。主要是没钱和没域名，就是瞎折腾。现在都忘不了在那配置 Hexo 的 Next 主题的样子。
当初比较流行给博客加一个 Live2D 小人在前面萌娘用，当初折腾了半天样式优化和二次元萌娘，啥代码都看不懂，就是照搬着尝试去做，属于早期的探索。啥也不懂，就会折腾。
感谢遇见西门大佬的 ([最全Hexo博客搭建+主题优化+插件配置+常用操作+错误分析 | 遇见西门](https://www.simon96.online/2018/10/12/hexo-tutorial/)), 一个非常详细的攻略，让一位啥具体技术也不懂的萌新，学会了搭建了人生的第一个博客。
## 1.2遇见 Typecho
因为说过我是一个很喜欢折腾的人，Hexo 搭建后，因为现实生活比较忙，就暂时没有动博客一年多。但是后续有空折腾的时候，又开始看 Hexo 不爽了。当初又接触到了虚拟面板（就那种没有 cli，就一个提供给界面给你上下传文件之类的），又是因为穷，而这种面板属于一个月几块钱，刚好是可以接受的程度。于是又开始折腾打算做新的博客。当初在 WordPress 和 Typecho 中纠结。最后选择了 Typecho（我觉得这玩意儿更新鲜），并选择了 handsome 主题。属于是年轻人的第一个动态博客了。
于是又是一番折腾，什么 css 美化，添加什么网页名称变换，添加博客音乐播放器之类的。
## 1.3归于 Astro
### 1.3.1原因
其实主要的原因是，又开始心血来潮想部署博客，看到很多人在推荐 Astro，于是便选择了 Astro，我这个人还是比较喜欢花里胡哨的东西，不是很喜欢极简的的类似 Paper 一样的主题，于是最终挑选之下选择了 Fuwari。
[![Preview Image](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)
# 2.安装 Fuwari
## 2.1 Fuwari功能特性
- [x]  基于 Astro 和 Tailwind CSS 开发
- [x]  流畅的动画和页面过渡
- [x]  亮色 / 暗色模式
- [x]  自定义主题色和横幅图片
- [x]  响应式设计
- [x]  评论（作者没实现，自行选择了 Giscus）
- [x]  搜索
- [x]  文内目录（已经实现）

## 2.2 安装方法

1. 使用此模板[生成新仓库](https://github.com/saicaca/fuwari/generate)或 Fork 此仓库
> [!TIP]
> Vercel 支持私有仓库，所以为了隐私，建议使用私有仓库。 
2. 进行本地开发，Clone 新的仓库，执行 `pnpm install` 和 `pnpm add sharp` 以安装依赖
    - 若未安装 [pnpm](https://pnpm.io/)，执行 `npm install -g pnpm`
3. 通过配置文件 `src/config.ts` 自定义博客
4. 执行 `pnpm new-post <filename>` 创建新文章，并在 `src/content/posts/` 目录中编辑
5. 参考[官方指南](https://docs.astro.build/zh-cn/guides/deploy/)将博客部署至 Vercel, Netlify, GitHub Pages 等。就打开 Vercel 导入即可
# 3.博客初始化
在本地 Clone 下载后，本地搭建后环境后，便可以开始配置自定义设置了。
## 3.1配置 src/config.ts
```typescript title="src/config.ts"
export const siteConfig: SiteConfig = {
	title: "Elysiam", //修改网站主标题
	subtitle: "May you, the beauty of this world, always shine",//修改网站副标题
	lang: "zh_CN", // 选择语言'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,// 启用banner
		src: "assets/images/custom1.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: true, // Display the credit text of the banner image
			text: "Honkai 3rd", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		//启用目录（需要后续优化，见后面章节）
		enable: true, // Display the table of contents on the right side of the post
		depth: 3, // Maximum heading depth to show in the table, from 1 to 3
	},

```
接下来是修改个人信息，默认的类似 Twitter 和 Steam 我都删掉了，然后添加了网易云音乐和邮箱，使用了 tabler 图标库，无法加载出图标的可以使用下面的命令。
`pnpm add -D @iconify-json/tabler`

```typescript title="src/config.ts" text {2-4}
export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.jpg", // 修改头像 Relative to the /src directory. Relative to the /public directory if it starts with '/'  
	name: "Starfallen", // 修改名称
	bio: "May you, the beauty of this world, always shine", // 修改个性签名
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
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Starfallan", // Updated GitHub URL
		},
	],
};

```
## 3.2修改关于界面
这我觉得没啥好说的，就是修改 `src\content\spec\about.md`，写上自己想要的关于界面就行
# 4.博客优化配置
## 4.1优化目录显示
打开目录后，在我的设备上，目录是无法正常显示的。一开始是以为目录配置出错，查询了代码后，才发现目录会在小屏幕上默认隐藏，但是在我的 16:9 的 1920 x 1080 的笔记本屏幕上，目录仍然是无法正常显示。尝试修改显示代码，进行优化。方法来自于 [Disappear TOC · Issue #311 · saicaca/fuwari](https://github.com/saicaca/fuwari/issues/311)
```astro title="src\layouts\MainGridLayout.astro" ins={3,7} del={2,6}
<!-- 将原有的2xl:block改为xl:block，即修改触发宽度 -->
<div class="absolute w-full z-0 hidden 2xl:block">
<div class="absolute w-full z-0 hidden xl:block"> 
    <div class="relative max-w-[var(--page-width)] mx-auto">
        <!-- TOC component -->
        {siteConfig.toc.enable && <div id="toc-wrapper" class:list={["hidden lg:block transition absolute top-0 -right-[var(--toc-width)] w-[var(--toc-width)] flex items-center",
        {siteConfig.toc.enable && <div id="toc-wrapper" class:list={["block lg:block transition absolute top-0 right-0 lg:-right-[var(--toc-width)] w-[var(--toc-width)] flex items-center",
            {"toc-hide": siteConfig.banner.enable}]}
        > 

```

> [!NOTE]
> 由于改成了 xl: block 显示效果不是很好，有大神可以指教下怎么后续优化

效果如图所示：![](https://picr.zz.ac/UM1qPgD2bEd4B2jCVRmzATT9qyM-_5gBgwSYkKDJOpQ=)
## 4.2 添加评论系统
由于 Fuwari主题尚未实现自有的评论系统，我选择了 Giscus 作为自己博客的评论系统。
### 4.2.1 创建 Gicus 用仓库
因为 Giscus 是利用仓库的 discussions 构建的，所以你需要在你的 Github 中创建一个新的用以存储的仓库。仓库需要保证：
1. **该仓库是[公开的](https://docs.github.com/en/github/administering-a-repository/managing-repository-settings/setting-repository-visibility#making-a-repository-public)**，否则访客将无法查看 discussion。
2. **[giscus](https://github.com/apps/giscus) app 已安装**，否则访客将无法评论和回应。
3. **Discussions** 功能已[在你的仓库中启用](https://docs.github.com/en/github/administering-a-repository/managing-repository-settings/enabling-or-disabling-github-discussions-for-a-repository)。
### 4.2.2 配置 Giscus
打开giscus官方网站[https://giscus.app/](https://giscus.app/zh-CN)，进行配置：

- 语言：选择你的使用的语言
- 仓库：填写你刚刚创建的仓库
-  映射关系：保持默认即可，即第一项
- Discussion 分类：保持默认即可
- 特性：保持默认即可
- 主题：保持默认，即用户偏好的色彩方案

按照顺序配置好之后，下方会自动生成对应代码，暂时不用复制，我们需要进行一定的修改以适应暗色模式。
这里暗色模式的配置来自于[在Fuwari中添加评论功能(带黑暗模式) - 伊卡的记事本](https://ikamusume7.org/posts/frontend/comments_with_darkmode/)，感谢大佬的思路。
1. 在 `src\components\widget` 目录下新建 `Comments.svelte` 文件，将上面 Giscus生成的代码替换掉data-themen 对应行就行。
```svelte title="src\components\widget\Comments.svelte"
<section>
    <script src="https://giscus.app/client.js"
        data-repo="[在此输入仓库]"
        data-repo-id="[在此输入仓库 ID]"
        data-category="[在此输入分类名]"
        data-category-id="[在此输入分类 ID]"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme={$mode === DARK_MODE ? 'dark' : 'light'}
         //其实就改了这一行，复制giscus网站上的，然后替换这一行即可
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
    </script>
</section>

<script>
import { AUTO_MODE, DARK_MODE } from '@constants/constants.ts'
import { onMount } from 'svelte'
import { writable } from 'svelte/store';
import { getStoredTheme } from '@utils/setting-utils.ts'
const mode = writable(AUTO_MODE)
onMount(() => {
  mode.set(getStoredTheme())
})

function updateGiscusTheme() {
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  const iframe = document.querySelector('iframe.giscus-frame')
  if (!iframe) return
  iframe.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app')
}

const observer = new MutationObserver(updateGiscusTheme)
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

window.onload = () => {
  updateGiscusTheme()
}
</script>

```

2. 修改文件 `src\pages\posts\[...slug].astro` 中的代码
首先引入 `Comments` 组件
```diff astro title="src\pages\posts\[...slug].astro"
import MainGridLayout from '../layouts/MainGridLayout.astro'

import { getEntry } from 'astro:content'
import { i18n } from '../i18n/translation'
import I18nKey from '../i18n/i18nKey'
import Markdown from '@components/misc/Markdown.astro'
+ import Comments from '@components/widget/Comments.svelte'

const friendsPost = await getEntry('spec', 'friends')
```

之后用组件代码代替原先的代码
将末尾的原 Giscus 代码换成对应组件
```astro title="src\pages\posts\[...slug].astro" ins={16} del={1-15}
<script src="https://giscus.app/client.js"
        data-repo="[在此输入仓库]"
        data-repo-id="[在此输入仓库 ID]"
        data-category="[在此输入分类名]"
        data-category-id="[在此输入分类 ID]"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
<Comments client:only="svelte"></Comments>

</MainGridLayout>
```
## 4.3 使用自定义字体
这里修改自定义字体的部分参考于这篇文章[在Fuwari使用自定义字体 - AULyPc](https://blog.aulypc0x0.online/posts/use_custom_fonts_in_fuwari/)，感谢大佬

1. 添加你的字体文件到 `public/fonts/` 目录，或者使用在线 cdn 字体，见下 css 文件
2. 在 `src\styles` 文件夹下新建 `global.css`
这里引用了两个字体，Maple Mono 用于代码块，霞鹜文楷作为网站主字体。
> [!NOTE]
> LXGW WenKai Screen 是屏幕优化版，整体加粗了一点，但是我觉得在 Fuwari 太粗了，所以使用了 GBLite 版
```css title="src\styles\global.css"
@font-face {
    font-family: "Maple Mono";
    src: url("https://fontsapi.zeoseven.com/443/main.woff2") format('woff2'),
        url("https://fontsapi-storage.zeoseven.com/443/main.woff2") format('woff2');
    font-display: swap;
}

@font-face{
    font-family: 'LXGW WenKai Screen';
    src: url("/fonts/LXGWWenKaiMonoGBScreen.woff2") format('woff2');
    font-display: swap;
}

@font-face{
    font-family: 'LXGW GB Lite';
    src: url("/fonts/LXGWWenKaiMonoGBLite.woff2") format('woff2');
    font-display: swap;
    font-weight: normal;
} 
```
3. 随后修改 `tailwind.config.cjs`，应用页面主字体, 将 Roboto 改为你的字体：
```js title="tailwind.config.cjs" text {9}
/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme")
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}"],
  darkMode: "class", // allows toggling dark mode manually
  theme: {
    extend: {
      fontFamily: {
        sans: ["LXGW GB Lite", "sans-serif", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}

```
4. 修改代码块字体
如果你没有使用Expressive Code 替换掉原有的代码块显示，就是在 `src\styles\markdown.css` 修改对应 code 的样式文件，更改 font-family 即可
```css title="src\styles\markdown.css"
.....省略前面内容
code {
    @apply bg-[var(--inline-code-bg)] text-[var(--inline-code-color)] px-1 py-0.5 rounded-md overflow-hidden;
    font-family: 'Maple Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
    &:before {
        content:none;
    }
    &:after {
        content:none;
    }
```
但是如果你和我一样使用了 `Expressive Code` 替换了原有的代码块显示见[4.4 增强代码块](## 4.4增强代码块)，则需要修改对应配置文件，参考了官方文档 [Style Overrides | Expressive Code](https://expressive-code.com/reference/style-overrides/)
```astro title="astro.config.mjs" showLineNumbers ins={18-20}
.....省略前面内容
      include: {
          "preprocess: vitePreprocess(),": ["*"],
          "fa6-brands": ["*"],
          "fa6-regular": ["*"],
          "fa6-solid": ["*"],
      },
}), svelte(), sitemap(), expressiveCode({
          themes: ["one-dark-pro", "light-plus"],
          plugins: [
              pluginLineNumbers(),
            ],
          defaultProps: {
          // Disable line numbers by default
          wrap: true,
          showLineNumbers: true,
          },
          styleOverrides:{
              codeFontFamily:"Maple Mono"
          }
      }
      )],
```
## 4.4 增强代码块
偷懒，不想写了，具体请继续参考伊卡大佬的[增强Fuwari的代码块功能 - 伊卡的记事本](https://ikamusume7.org/posts/frontend/code_block_ex/)，记得自己选个喜欢的主题就行。
> [!TIP]
> 补充一下最后的显示行号的问题，官方文档推荐修改 `ec.config.js`，我懒得新建，直接在原 `astro.config.mjs` 上添加了，具体看上面 4.3 的完整配置