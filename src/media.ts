// Видео раздаётся либо из public/, либо с внешнего хранилища —
// зависит от PUBLIC_MEDIA_BASE на момент сборки.
const base = (import.meta.env.PUBLIC_MEDIA_BASE ?? '').replace(/\/$/, '');
export const media = (file: string) => `${base}/${file}`;
