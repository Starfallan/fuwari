import Key from "../i18nKey";
import type { Translation } from "../translation";

export const ja: Translation = {
	[Key.home]: "Home",
	[Key.about]: "About",
	[Key.archive]: "Archive",
	[Key.search]: "検索",

	[Key.tags]: "タグ",
	[Key.categories]: "カテゴリ",
	[Key.recentPosts]: "最近の投稿",

	[Key.comments]: "コメント",

	[Key.untitled]: "タイトルなし",
	[Key.uncategorized]: "カテゴリなし",
	[Key.noTags]: "タグなし",

	[Key.wordCount]: "文字",
	[Key.wordsCount]: "文字",
	[Key.minuteCount]: "分",
	[Key.minutesCount]: "分",
	[Key.postCount]: "件の投稿",
	[Key.postsCount]: "件の投稿",

	[Key.themeColor]: "テーマカラー",

	[Key.lightMode]: "ライト",
	[Key.darkMode]: "ダーク",
	[Key.systemMode]: "システム",

	[Key.more]: "もっと",

	[Key.author]: "作者",
	[Key.publishedAt]: "公開日",
	[Key.license]: "ライセンス",

	// パスワード保護関連
	[Key.passwordProtected]: "この記事はパスワードで保護されています",
	[Key.passwordPlaceholder]: "パスワードを入力...",
	[Key.passwordHint]:
		"完全なコンテンツを表示するにはパスワードを入力してください",
	[Key.unlockButton]: "ロック解除",
	[Key.passwordIncorrect]: "パスワードが正しくありません。再試行してください",
	[Key.passwordSuccess]: "✓ 成功",
	[Key.passwordRetry]: "再試行",
};
