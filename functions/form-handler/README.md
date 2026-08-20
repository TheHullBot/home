# Обработчик формы заявок

Яндекс Облако, Cloud Function на Node.js 20. Принимает JSON с формы сайта,
проверяет поля и отправляет заявку в Telegram и на почту.

Персональные данные принимаются и обрабатываются на инфраструктуре в РФ —
это требование ч. 5 ст. 18 152-ФЗ.

## Каналы доставки

Работает любой из двух, можно оба сразу. Заявка считается доставленной,
если сработал хотя бы один: если Telegram упал, письмо всё равно уйдёт.

### Telegram — минимальная рабочая настройка

Ничего, кроме бота, не нужно. Почтовый сервер не требуется.

1. Создать бота у `@BotFather`, получить токен.
2. Создать группу для заявок, добавить туда бота.
3. Узнать `chat_id` группы: временно добавить в неё `@RawDataBot`,
   он покажет id (у групп он отрицательный, например `-1001234567890`),
   после чего бота удалить.

| переменная | значение |
| --- | --- |
| `TG_BOT_TOKEN` | токен от BotFather |
| `TG_CHAT_ID` | id группы |

Токен хранить **в Lockbox**, а не в открытых переменных функции.

### Почта

| переменная | значение |
| --- | --- |
| `SMTP_HOST` | хост SMTP, например `postbox.cloud.yandex.net` |
| `SMTP_PORT` | `465` для SSL, `587` для STARTTLS |
| `SMTP_USER` | логин SMTP |
| `SMTP_PASS` | пароль SMTP, тоже в Lockbox |
| `MAIL_TO` | `info@hullbot.group` |
| `MAIL_FROM` | адрес отправителя на подтверждённом домене |

Если переменные почты не заданы, функция работает только на Telegram.

### Общее

| переменная | значение |
| --- | --- |
| `ALLOWED_ORIGIN` | `https://hullbot.group` |

## Деплой

```
cd functions/form-handler
npm install
zip -r ../form-handler.zip .

yc serverless function create --name hullbot-form
yc serverless function version create \
  --function-name hullbot-form \
  --runtime nodejs20 \
  --entrypoint index.handler \
  --memory 128m \
  --execution-timeout 15s \
  --source-path ../form-handler.zip \
  --environment ALLOWED_ORIGIN=https://hullbot.group,TG_CHAT_ID=...

yc serverless function allow-unauthenticated-invoke hullbot-form
```

Секреты подключаются через Lockbox:

```
yc serverless function version create ... \
  --secret name=hullbot-secrets,key=tg-token,environment-variable=TG_BOT_TOKEN
```

Полученный URL вида `https://functions.yandexcloud.net/<id>` кладётся
в секрет репозитория `PUBLIC_FORM_ENDPOINT`.

## Проверка

```
curl -X POST "$PUBLIC_FORM_ENDPOINT" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Проверка","phone":"+70000000000","consent":true,"type":"Судно"}'
```

Ответ `{"ok":true}` и сообщение в группе.
