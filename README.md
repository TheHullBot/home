# hullbot.group

Сайт ООО «Халл Бот Групп» — кавитационная очистка и инспекция подводной части
судов и гидросооружений.

## Стек

Astro + Tailwind, статическая сборка, хостинг GitHub Pages (`CNAME` → hullbot.group).
Шрифт Inter Variable подключён локально, внешних запросов у страницы нет.

## Разработка

```
npm install
npm run dev      # http://localhost:4321
npm run build    # сборка в dist/
```

## Структура

| путь | что там |
| --- | --- |
| `src/content/site.ts` | весь текст сайта одним файлом — правки контента только здесь |
| `src/components/` | секции страницы |
| `src/assets/` | картинки, которые оптимизирует Astro |
| `public/` | то, что копируется в корень как есть: `CNAME`, иконки, `robots.txt`, видео |
| `legacy/` | прежняя версия на Mobirise, включая `project.mobirise` — только как справка |

## Форма заявки

Отправляется через Web3Forms на `info@hullbot.group`. Ключ доступа публичный,
но вынесен в переменную окружения — см. `.env.example`:

```
PUBLIC_W3F_KEY=...
```

Ключ получают на web3forms.com по адресу почты. Без него форма отрисуется,
но отправка вернёт ошибку.

## Видео на первом экране

`public/hero.mp4` — первые 7 секунд исходного ролика, 1080×1908, H.264 CRF 32,
без звука, 1,5 МБ. Постер `public/hero-poster.jpg` снят с 4,2-й секунды.
Пережималось так:

```
ffmpeg -ss 0 -t 7 -i исходник.mp4 -an -vf "scale=1080:-2,fps=25" \
  -c:v libx264 -profile:v high -crf 32 -preset slow \
  -pix_fmt yuv420p -movflags +faststart public/hero.mp4
```
