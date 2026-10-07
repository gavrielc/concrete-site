// One-time export of the open positions hard-coded in src/pages/join-us.astro (pre-Sanity version).
// Run from the studio folder: node migration/export-positions.mjs
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(resolve(here, '../../src/pages/join-us.astro'), 'utf8');
const text = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const positions = [...page.matchAll(/<div class="card">([\s\S]*?)<\/LinkButton>/g)].map(([, card]) => {
    const description = card.match(/<div class="job-description">([\s\S]*?)<\/div>/)[1];
    const sections = [...description.matchAll(/<h5>([^<]*)<\/h5>\s*<ul>([\s\S]*?)<\/ul>/g)].map(([, heading, list]) => ({
        heading: text(heading),
        points: [...list.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(([, li]) => text(li)),
    }));
    return {
        title: text(card.match(/<div class="job-title">([\s\S]*?)<\/div>/)[1]),
        location: text(card.match(/<div class="location txt">([\s\S]*?)<\/div>/)[1]),
        overview: text(description.match(/<p>([\s\S]*?)<\/p>/)[1]),
        sections,
        applyEmail: card.match(/mailto:([^?"]+)/)[1],
    };
});

writeFileSync(resolve(here, 'legacy-positions.json'), JSON.stringify(positions, null, 2));
console.log(positions.map((p) => `${p.title}: ${p.sections.map((s) => `${s.heading} (${s.points.length})`).join(', ')}`).join('\n'));
