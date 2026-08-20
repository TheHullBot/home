import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Видео раздаётся либо из public/, либо с внешнего хранилища —
// зависит от PUBLIC_MEDIA_BASE на момент сборки.
//
// Значение чистим намеренно: в поле переменной легко скопировать лишнее
// (имя переменной, кавычки, слэш на конце), и тогда сайт молча остаётся
// без видео. Берём из строки первый http-адрес, если он там есть.
const raw = String(import.meta.env.PUBLIC_MEDIA_BASE ?? '').trim();
const match = raw.match(/https?:\/\/[^\s"'<>]+/);
const base = (match ? match[0] : '').replace(/\/+$/, '');

// К адресу дописываем отпечаток содержимого файла. ImageKit кеширует
// на год, и после замены видео по прежнему адресу ещё долго приезжает
// старая версия. Отпечаток меняется вместе с файлом, и вопрос снимается.
// В версию входит и размер файла: если по адресу с прежним отпечатком
// успели закешировать не тот файл, достаточно сменить формат версии,
// и адрес станет новым.
const stamp = (file: string) => {
  try {
    const data = readFileSync(`public/${file}`);
    const hash = createHash('sha1').update(data).digest('hex').slice(0, 8);
    return `${data.length}-${hash}`;
  } catch {
    return '';
  }
};

export const media = (file: string) => {
  const v = stamp(file);
  return `${base}/${file}${v ? `?v=${v}` : ''}`;
};
