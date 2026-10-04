// One-time import of the testimonials hard-coded in src/components/Testimonials.astro (pre-Sanity version).
// Each testimonial references its client; the card's logo is uploaded as an override only when it
// differs from the logo the client already has.
// Run from the studio folder: npx sanity exec migration/import-testimonials.mjs --with-user-token
import {readFileSync, createReadStream} from 'node:fs';
import {resolve, dirname, basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getCliClient} from 'sanity/cli';
import {LexoRank} from 'lexorank';

const client = getCliClient({apiVersion: '2025-02-19'});
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const file = resolve(repoRoot, 'src/components/Testimonials.astro');
const code = readFileSync(file, 'utf8');

if ((await client.fetch('count(*[_type == "testimonial"])')) > 0) {
    console.error('Testimonials already imported; nothing to do.');
    process.exit(1);
}

// Evaluate the `const testimonials = [...]` literal with its logo imports bound to file paths.
const imports = {};
for (const [, id, rel] of code.matchAll(/import\s+(\w+)\s+from\s+'([^']+\.(?:png|jpe?g|webp|svg))'/g)) {
    imports[id] = {src: resolve(dirname(file), rel)};
}
const start = code.indexOf('[', code.indexOf('const testimonials = ['));
const literal = code.slice(start, code.indexOf('\n];', start) + 2);
const testimonials = new Function(...Object.keys(imports), `return ${literal};`)(...Object.values(imports));

// Match each logo file to the client that used the same company name when it was imported.
const legacy = JSON.parse(readFileSync(resolve(here, 'legacy-content.json'), 'utf8'));
const clients = await client.fetch('*[_type == "client"]{_id, name}');
const byLogoName = (logoPath) => {
    const company = basename(logoPath).replace(/\.\w+$/, '').toLowerCase();
    const legacyClient = legacy.clients.find((c) => c.name.toLowerCase() === company);
    if (!legacyClient) throw new Error(`No client found for logo ${logoPath}`);
    const doc = clients.find((c) => c.name === legacyClient.name);
    return {doc, sameLogo: basename(legacyClient.logo.src) === basename(logoPath)};
};

let rank = LexoRank.min();
const tx = client.transaction();
for (const t of testimonials) {
    const {doc, sameLogo} = byLogoName(t.logo.src);
    let logoOverride;
    if (!sameLogo) {
        const asset = await client.assets.upload('image', createReadStream(t.logo.src), {filename: basename(t.logo.src)});
        logoOverride = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}};
    }
    rank = rank.genNext().genNext();
    tx.create({
        _type: 'testimonial',
        quote: t.text,
        name: t.name,
        title: t.title,
        client: {_type: 'reference', _ref: doc._id},
        ...(logoOverride && {logoOverride}),
        isVisible: true,
        orderRank: rank.toString(),
    });
    console.log(`${t.name} -> ${doc.name}${logoOverride ? ' (own logo)' : ''}`);
}
await tx.commit({visibility: 'sync'});
console.log(`Created ${testimonials.length} testimonials.`);
