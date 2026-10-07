// One-time import of the Join Us page sections (banner, "stand apart" cards, headings) that were
// hard-coded in src/pages/join-us.astro, into the "page-joinUs" document.
// Run from the studio folder: npx sanity exec migration/import-joinus-sections.mjs --with-user-token
import {readFileSync, createReadStream} from 'node:fs';
import {resolve, dirname, basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2025-02-19'});
const here = dirname(fileURLToPath(import.meta.url));
const file = resolve(here, '../../src/pages/join-us.astro');
const code = readFileSync(file, 'utf8');
const text = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

if (await client.fetch('defined(*[_id == "page-joinUs"][0].benefits)')) {
    console.error('Join Us sections already imported; nothing to do.');
    process.exit(1);
}

const imports = {};
for (const [, id, rel] of code.matchAll(/import\s+(\w+)\s+from\s+"([^"]+\.(?:svg|png|jpe?g|webp))"/g)) {
    imports[id] = resolve(dirname(file), rel);
}
const upload = async (path) => {
    const asset = await client.assets.upload('image', createReadStream(path), {filename: basename(path)});
    return {_type: 'image', asset: {_type: 'reference', _ref: asset._id}};
};

const cards = [...code.matchAll(/<div class="difference-card">\s*<img src=\{(\w+)\.src\}[^>]*\/>\s*<h4>([\s\S]*?)<\/h4>\s*<p>([\s\S]*?)<\/p>/g)];
const benefits = [];
for (const [, iconVar, title, body] of cards) {
    benefits.push({_type: 'benefit', _key: randomUUID().slice(0, 12), icon: await upload(imports[iconVar]), title: text(title), text: text(body)});
}

await client
    .patch('page-joinUs')
    .set({
        positionsHeading: text(code.match(/<section class="positions">\s*<h3>([\s\S]*?)<\/h3>/)[1]),
        bannerText: text(code.match(/<div class="hero">([\s\S]*?)<\/div>/)[1]),
        bannerImage: await upload(imports.teamPicture),
        benefitsHeading: text(code.match(/<section class="difference">\s*<h3>([\s\S]*?)<\/h3>/)[1]),
        benefits,
        benefitsButtonLabel: text(code.match(/<LinkButton href="\/team">([\s\S]*?)<\/LinkButton>/)[1]),
    })
    .commit({visibility: 'sync'});
console.log(`Join Us sections imported: ${benefits.map((b) => b.title).join(', ')}`);
