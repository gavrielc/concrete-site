// One-time import of the homepage texts and images that were hard-coded in src/pages/index.astro
// and src/components/Testimonials.astro, into the "homepage" document.
// Run from the studio folder: npx sanity exec migration/import-homepage-sections.mjs --with-user-token
import {readFileSync, createReadStream} from 'node:fs';
import {resolve, dirname, basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2025-02-19'});
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const page = readFileSync(resolve(repoRoot, 'src/pages/index.astro'), 'utf8');
const testimonials = readFileSync(resolve(repoRoot, 'src/components/Testimonials.astro'), 'utf8');
const text = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const section = (id) => page.slice(page.indexOf(`id="${id}"`));

if (await client.fetch('defined(*[_id == "homepage"][0].heroText)')) {
    console.error('Homepage sections already imported; nothing to do.');
    process.exit(1);
}

const upload = async (publicPath) => {
    const file = resolve(repoRoot, 'public', publicPath.replace(/^\//, ''));
    const asset = await client.assets.upload('image', createReadStream(file), {filename: basename(file)});
    return {_type: 'image', asset: {_type: 'reference', _ref: asset._id}};
};

const clients = section('clients');
const coverage = section('results');
const joinUs = section('team');

await client
    .patch('homepage')
    .set({
        // "<br>" in the tagline becomes a line break
        heroText: page.match(/<h2>([\s\S]*?)<\/h2>/)[1].split(/\s*<br\s*\/?>\s*/).map(text).join('\n'),
        heroImage: await upload(page.match(/\.hero \{[\s\S]*?url\(([^)]+)\)/)[1]),
        clientsHeading: text(clients.match(/<h3>([\s\S]*?)<\/h3>/)[1]),
        clientsButtonLabel: text(clients.match(/<LinkButton[^>]*>([\s\S]*?)<\/LinkButton>/)[1]),
        coverageHeading: text(coverage.match(/<h3>([\s\S]*?)<\/h3>/)[1]),
        coverageText: text(coverage.match(/<p class="desc-text">([\s\S]*?)<\/p>/)[1]),
        coverageButtonLabel: text(coverage.match(/<LinkButton[^>]*>([\s\S]*?)<\/LinkButton>/)[1]),
        testimonialsHeading: text(testimonials.match(/<h3>([\s\S]*?)<\/h3>/)[1]),
        joinUsImage: await upload(joinUs.match(/<img src="([^"]+)"/)[1]),
        joinUsImageAlt: joinUs.match(/<img [^>]*alt="([^"]+)"/)[1],
        joinUsHeading: text(joinUs.match(/<h3>([\s\S]*?)<\/h3>/)[1]),
        joinUsText: text(joinUs.match(/<p class="desc-text">([\s\S]*?)<\/p>/)[1]),
        joinUsButtonLabel: text(joinUs.match(/<LinkButton[^>]*>([\s\S]*?)<\/LinkButton>/)[1]),
    })
    .commit({visibility: 'sync'});
console.log(JSON.stringify(await client.fetch('*[_id == "homepage"][0]{heroText, clientsHeading, coverageHeading, testimonialsHeading, joinUsHeading, joinUsButtonLabel}'), null, 1));
