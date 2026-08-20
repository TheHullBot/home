import type { APIRoute } from 'astro';
import {
  company, requisites, benefits, objects, process, robots, equipment, faq,
  vendorProof, comparisonCols, comparisonRows, foulingLevels, fuels,
  cleaningRate, contentUpdated, foundedYear,
} from '../content/site';

// Развёрнутая версия llms.txt: то же, что на странице, но целиком и без вёрстки.
// Нужна ассистентам, которым мало короткой выжимки.
export const GET: APIRoute = () => {
  const table = [
    `| Параметр | ${comparisonCols.join(' | ')} |`,
    `| --- | ${comparisonCols.map(() => '---').join(' | ')} |`,
    ...comparisonRows.map((r) => `| ${r.k} | ${r.v.join(' | ')} |`),
  ].join('\n');

  const body = `# ${company.legalName}, hullbot.group

> ${company.tagline}. Роботизированная очистка подводной части судов и гидротехнических
> сооружений кавитационной гидродинамической технологией без докования, без водолазов
> и без повреждения лакокрасочного покрытия.

Обновлено: ${contentUpdated}
Компания зарегистрирована в ${foundedYear} году.

## Юридические сведения

- Наименование: ${company.legalName}
- ОГРН: ${requisites.ogrn}
- ИНН: ${requisites.inn}
- КПП: ${requisites.kpp}
- Юридический адрес: ${requisites.legalAddress}

## Что делает компания

${company.services.map((s) => `- ${s}`).join('\n')}

География: работаем в портах России, базы в Санкт-Петербурге и Владивостоке.
Если судно уже в доке, работаем и в доке.

## Результат очистки

${benefits.map((b) => `- ${b.label}: ${b.value}. ${b.note}`).join('\n')}

## Объекты обслуживания

${objects.join(', ')}.

## Сравнение с альтернативными способами

${table}

## Как устроена работа

${process.map((p) => `${Number(p.n)}. ${p.title}. ${p.text}`).join('\n')}

## Оборудование

${vendorProof.value} ${vendorProof.claim}. ${vendorProof.note}.

${robots
  .map(
    (r) =>
      `### ${r.model} (${r.kind})\n${r.summary}\n\n` +
      r.specs.map((s) => `- ${s.k}: ${s.v}`).join('\n') +
      '\n\n' +
      r.notes.map((n) => `- ${n}`).join('\n'),
  )
  .join('\n\n')}

### Вспомогательные системы
${equipment.map((e) => `- ${e}`).join('\n')}

## Как считается потеря топлива от обрастания

Перерасход мощности берётся по Schultz M.P. (2007), Effects of coating roughness and
biofouling on ship resistance and powering, Biofouling 23(5), относительно свежего покрытия:

${foulingLevels.map((l) => `- ${l.label}: +${Math.round(l.penalty * 100)}% требуемой мощности`).join('\n')}

Если известен текущий расход топлива (он уже включает обрастание), лишняя доля
считается как p / (1 + p), а не как p. При обрастании +33% это 25% от текущего расхода.

Выбросы CO2 считаются по углеродным коэффициентам ИМО, резолюция MEPC.364(79):
${fuels.map((f) => `- ${f.label}: ${f.cf} т CO2 на тонну топлива`).join('\n')}

Рейтинг CII считается как выбросы CO2 на транспортную работу (дедвейт, умноженный
на пройденные мили). Знаменатель от очистки не меняется, поэтому рейтинг улучшается
ровно на ту же долю, на которую падает расход топлива.

Время очистки оценивается по заявленной производительности ${cleaningRate} м²/ч.

## Частые вопросы

${faq.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}

## Контакты

- Телефон: ${company.phone}
- Почта: ${company.emails.join(', ')}
${company.offices.map((o) => `- Офис: ${o}`).join('\n')}

## Страницы

- https://hullbot.group/
- https://hullbot.group/privacy/
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
