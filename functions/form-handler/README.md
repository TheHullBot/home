# Обработчик формы заявок

Яндекс Облако, Cloud Function на Node.js 20. Принимает JSON с формы сайта,
проверяет поля и отправляет письмо на `info@hullbot.group`.

Персональные данные принимаются и обрабатываются на инфраструктуре в РФ —
это требование ч. 5 ст. 18 152-ФЗ. Прежняя схема через Web3Forms (США)
ему не соответствовала.

## Переменные окружения

| переменная | значение |
| --- | --- |
| `SMTP_HOST` | хост SMTP (например `postbox.cloud.yandex.net`) |
| `SMTP_PORT` | `465` для SSL, `587` для STARTTLS |
| `SMTP_USER` | логин SMTP |
| `SMTP_PASS` | пароль SMTP — хранить в Lockbox, не в открытых переменных |
| `MAIL_TO` | `info@hullbot.group` |
| `MAIL_FROM` | адрес отправителя на подтверждённом домене |
| `ALLOWED_ORIGIN` | `https://hullbot.group` |

## Деплой

```
cd functions/form-handler
zip -r ../form-handler.zip .

yc serverless function create --name hullbot-form
yc serverless function version create \
  --function-name hullbot-form \
  --runtime nodejs20 \
  --entrypoint index.handler \
  --memory 128m \
  --execution-timeout 15s \
  --source-path ../form-handler.zip \
  --environment MAIL_TO=info@hullbot.group,ALLOWED_ORIGIN=https://hullbot.group

yc serverless function allow-unauthenticated-invoke hullbot-form
```

Полученный URL вида `https://functions.yandexcloud.net/<id>` кладётся
в переменную сборки сайта `PUBLIC_FORM_ENDPOINT`.

## Проверка

```
curl -X POST "$PUBLIC_FORM_ENDPOINT" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Проверка","phone":"+70000000000","consent":true,"type":"Судно"}'
```

Ответ `{"ok":true}` и письмо в ящике.
