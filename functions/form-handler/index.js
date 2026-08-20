'use strict';

// Заявка уходит в два канала: Telegram и почта. Настроен хотя бы один — работает.
// Токены и пароли берутся только из переменных окружения, в коде их нет.
const {
  TG_BOT_TOKEN,
  TG_CHAT_ID,
  SMTP_HOST,
  SMTP_PORT = '465',
  SMTP_USER,
  SMTP_PASS,
  MAIL_TO,
  MAIL_FROM,
  ALLOWED_ORIGIN = 'https://hullbot.group',
} = process.env;

const FIELDS = [
  ['type', 'Тип объекта'],
  ['imo', 'Номер IMO'],
  ['size', 'Размер'],
  ['scope', 'Объём работ'],
  ['place', 'Порт или место стоянки'],
  ['when', 'Даты стоянки'],
  ['name', 'Имя'],
  ['phone', 'Телефон'],
  ['email', 'Почта'],
  ['note', 'Комментарий'],
];

const cors = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors },
  body: JSON.stringify(body),
});

const clean = (v) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 2000);

const escapeHtml = (v) =>
  clean(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const filled = (data) => FIELDS.filter(([k]) => clean(data[k]));

async function sendTelegram(data) {
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) return false;

  const rows = filled(data).map(([k, label]) => `<b>${label}:</b> ${escapeHtml(data[k])}`);
  const text = ['🚢 <b>Заявка с hullbot.group</b>', '', ...rows].join('\n');

  const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TG_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) throw new Error(`telegram ${res.status}: ${await res.text()}`);
  return true;
}

async function sendEmail(data) {
  if (!SMTP_HOST || !MAIL_TO) return false;

  const nodemailer = require('nodemailer');
  const rows = filled(data).map(
    ([k, label]) =>
      `<tr><td style="padding:6px 14px 6px 0;color:#6f8ba3;vertical-align:top">${label}</td>` +
      `<td style="padding:6px 0;color:#0b1b2b"><strong>${escapeHtml(data[k])}</strong></td></tr>`,
  );

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transport.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    replyTo: clean(data.email) || undefined,
    subject: `Заявка с сайта: ${clean(data.type) || 'объект'} — ${clean(data.name)}`,
    text: filled(data).map(([k, label]) => `${label}: ${clean(data[k])}`).join('\n'),
    html:
      '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px">' +
      '<p style="margin:0 0 14px;color:#0b1b2b">Новая заявка с hullbot.group</p>' +
      `<table style="border-collapse:collapse">${rows.join('')}</table>` +
      '<p style="margin:18px 0 0;font-size:12px;color:#6f8ba3">' +
      'Согласие на обработку персональных данных получено при отправке формы.</p></div>',
  });
  return true;
}

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return reply(405, { ok: false, error: 'method_not_allowed' });

  let data;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body || '';
    data = JSON.parse(raw);
  } catch {
    return reply(400, { ok: false, error: 'bad_json' });
  }

  // Ловушка для ботов: поле скрыто от людей, заполнить его может только скрипт.
  if (clean(data.company)) return reply(200, { ok: true });

  if (!clean(data.name) || !clean(data.phone)) {
    return reply(422, { ok: false, error: 'name_and_phone_required' });
  }
  if (data.consent !== true && data.consent !== 'on') {
    return reply(422, { ok: false, error: 'consent_required' });
  }

  // Отправляем в оба канала. Если сработал хотя бы один, заявка не потеряна.
  const results = await Promise.allSettled([sendTelegram(data), sendEmail(data)]);
  const delivered = results.some((r) => r.status === 'fulfilled' && r.value === true);

  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`${i === 0 ? 'telegram' : 'mail'} failed:`, r.reason?.message);
  });

  if (!delivered) return reply(502, { ok: false, error: 'delivery_failed' });
  return reply(200, { ok: true });
};
