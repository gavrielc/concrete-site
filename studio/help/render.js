// Turns the guide (help/guide.js) into HTML + CSS. Shared by the Studio Help tab and the PDF build,
// so both always show the same content.

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// **bold** -> <b>bold</b>
const rich = (text) => escape(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

export const guideCss = `
.cmg { --brand: #7022fb; --brand-soft: #f1eaff; --ink: #1a1a2e; --muted: #64748b; --line: #eceaf3;
  font-family: 'Inter', system-ui, sans-serif; color: var(--ink); line-height: 1.6; font-size: 15px; }
.cmg h1 { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 34px; line-height: 1.15; margin: 0 0 10px; }
.cmg h1 span { color: var(--brand); }
.cmg .lead { color: var(--muted); font-size: 16px; margin: 0 0 22px; max-width: 760px; }
.cmg .toc { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 30px; padding: 0; list-style: none; }
.cmg .toc a { display: inline-block; padding: 6px 12px; border-radius: 999px; background: #fff; color: var(--ink);
  text-decoration: none; font-size: 13px; font-weight: 500; box-shadow: 0 1px 2px rgba(16,24,40,.06); }
.cmg .toc a:hover { background: var(--brand-soft); color: var(--brand); }
.cmg section { background: #fff; border-radius: 20px; padding: 26px 28px; margin: 0 0 18px; box-shadow: 0 1px 2px rgba(16,24,40,.05); }
.cmg h2 { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 22px; margin: 0 0 12px; display: flex; align-items: center; gap: 10px; }
.cmg h2 .num { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: var(--brand); color: #fff; font-size: 14px; }
.cmg p { margin: 0 0 10px; }
.cmg ol, .cmg ul { margin: 0 0 12px; padding-left: 22px; }
.cmg li { margin: 0 0 6px; }
.cmg ol li::marker { color: var(--brand); font-weight: 700; }
.cmg b { font-weight: 600; color: #111; }
.cmg .tips { background: var(--brand-soft); border-radius: 12px; padding: 12px 16px; margin: 6px 0 12px; font-size: 14px; }
.cmg .tips p { margin: 0 0 4px; }
.cmg figure { margin: 16px 0 0; }
.cmg .shot { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--line); max-width: 760px; }
.cmg .shot img { display: block; width: 100%; height: auto; }
.cmg .mark { position: absolute; border: 3px solid var(--brand); border-radius: 10px; box-shadow: 0 0 0 4px rgba(112,34,251,.18); }
.cmg dl { margin: 0; }
.cmg dt { font-weight: 600; margin: 12px 0 2px; }
.cmg dd { margin: 0; color: #334155; }
@media print {
  .cmg .toc { display: none; }
  .cmg section { box-shadow: none; border: 1px solid var(--line); break-inside: avoid; }
}
`;

// imageSrc(name) returns the URL (or data: URI) for an image in static/help/.
export function renderGuideHtml(guide, imageSrc) {
    const [first, ...rest] = guide.title.split(':');
    const title = rest.length ? `${escape(first)}:<span>${escape(rest.join(':'))}</span>` : escape(guide.title);
    const toc = guide.sections.map((s, i) => `<li><a href="#cmg-${s.id}">${i + 1}. ${escape(s.title)}</a></li>`).join('');

    const sections = guide.sections
        .map((s, i) => {
            const parts = [`<h2><span class="num">${i + 1}</span>${escape(s.title)}</h2>`];
            (s.paragraphs || []).forEach((p) => parts.push(`<p>${rich(p)}</p>`));
            if (s.steps) parts.push(`<ol>${s.steps.map((step) => `<li>${rich(step)}</li>`).join('')}</ol>`);
            if (s.bullets) parts.push(`<ul>${s.bullets.map((b) => `<li>${rich(b)}</li>`).join('')}</ul>`);
            if (s.tips) parts.push(`<div class="tips">${s.tips.map((t) => `<p>💡 ${rich(t)}</p>`).join('')}</div>`);
            if (s.faq) parts.push(`<dl>${s.faq.map(([q, a]) => `<dt>${rich(q)}</dt><dd>${rich(a)}</dd>`).join('')}</dl>`);
            if (s.image) {
                const marks = (s.highlights || [])
                    .map((h) => `<span class="mark" style="left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%"></span>`)
                    .join('');
                parts.push(`<figure><div class="shot"><img src="${imageSrc(s.image)}" alt="${escape(s.title)}">${marks}</div></figure>`);
            }
            return `<section id="cmg-${s.id}">${parts.join('')}</section>`;
        })
        .join('');

    return `<div class="cmg"><h1>${title}</h1><p class="lead">${rich(guide.intro)}</p><ul class="toc">${toc}</ul>${sections}</div>`;
}
