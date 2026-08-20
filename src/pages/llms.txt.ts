import type { APIRoute } from 'astro';
import { company, benefits, objects, process, robots, equipment, faq, vendorProof } from '../content/site';

// Краткая выжимка сайта для языковых моделей: llms.txt читают ассистенты,
// которым нужен смысл страницы без разбора вёрстки.
export const GET: APIRoute = () => {
  const body = `# ${company.legalName}, hullbot.group

> ${company.tagline}. Роботизированная очистка подводной части судов и гидротехнических
> сооружений кавитационной гидродинамической технологией: без докования, без водолазов
> и без повреждения лакокрасочного покрытия. Работаем из Санкт-Петербурга и Владивостока.

## Что делаем

${benefits.map((b) => `- ${b.label}: ${b.value}. ${b.note}`).join('\n')}

## Объекты

${objects.join(', ')}.

## Как устроена работа

${process.map((p) => `${Number(p.n)}. ${p.title}. ${p.text}`).join('\n')}

## Оборудование

${vendorProof.value} ${vendorProof.claim}. ${vendorProof.note}.

${robots
  .map(
    (r) =>
      `### ${r.model} (${r.kind})\n${r.summary}\n\n` +
      r.specs.map((s) => `- ${s.k}: ${s.v}`).join('\n') +
      `\n\n` +
      r.notes.map((n) => `- ${n}`).join('\n'),
  )
  .join('\n\n')}

### Вспомогательные системы
${equipment.map((e) => `- ${e}`).join('\n')}

## Частые вопросы

${faq.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}

## Контакты

- Телефон: ${company.phone}
- Почта: ${company.emails.join(', ')}
${company.offices.map((o) => `- Офис: ${o}`).join('\n')}

## Ссылки

- [Главная](https://hullbot.group/)
- [Политика обработки персональных данных](https://hullbot.group/privacy/)
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
