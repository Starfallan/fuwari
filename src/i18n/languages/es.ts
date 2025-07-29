import Key from "../i18nKey";
import type { Translation } from "../translation";

export const es: Translation = {
	[Key.home]: "Inicio",
	[Key.about]: "Sobre mí",
	[Key.archive]: "Archivo",
	[Key.search]: "Buscar",

	[Key.tags]: "Etiquetas",
	[Key.categories]: "Categorías",
	[Key.recentPosts]: "Publicaciones recientes",

	[Key.comments]: "Comentarios",

	[Key.untitled]: "Sin título",
	[Key.uncategorized]: "Sin categoría",
	[Key.noTags]: "Sin etiquetas",

	[Key.wordCount]: "palabra",
	[Key.wordsCount]: "palabras",
	[Key.minuteCount]: "minuto",
	[Key.minutesCount]: "minutos",
	[Key.postCount]: "publicación",
	[Key.postsCount]: "publicaciones",

	[Key.themeColor]: "Color del tema",

	[Key.lightMode]: "Claro",
	[Key.darkMode]: "Oscuro",
	[Key.systemMode]: "Sistema",

	[Key.more]: "Más",

	[Key.author]: "Autor",
	[Key.publishedAt]: "Publicado el",
	[Key.license]: "Licencia",

	// Protección con contraseña
	[Key.passwordProtected]: "Esta publicación está protegida con contraseña",
	[Key.passwordPlaceholder]: "Ingrese la contraseña...",
	[Key.passwordHint]:
		"Por favor ingrese la contraseña para ver el contenido completo",
	[Key.unlockButton]: "Desbloquear",
	[Key.passwordIncorrect]: "Contraseña incorrecta, por favor intente de nuevo",
	[Key.passwordSuccess]: "✓ Éxito",
	[Key.passwordRetry]: "Reintentar",
};
