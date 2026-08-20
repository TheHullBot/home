// Видео раздаётся либо из public/, либо с внешнего хранилища —
// зависит от PUBLIC_MEDIA_BASE на момент сборки.
//
// Значение чистим намеренно: в поле переменной легко скопировать лишнее
// (имя переменной, кавычки, слэш на конце), и тогда сайт молча остаётся
// без видео. Берём из строки первый http-адрес, если он там есть.
const raw = String(import.meta.env.PUBLIC_MEDIA_BASE ?? '').trim();
const match = raw.match(/https?:\/\/[^\s"'<>]+/);
const base = (match ? match[0] : '').replace(/\/+$/, '');

export const media = (file: string) => `${base}/${file}`;
