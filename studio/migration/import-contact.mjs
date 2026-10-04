// One-time import of the email and office details hard-coded in src/pages/contact.astro
// into the "page-contact" document.
// Run from the studio folder: npx sanity exec migration/import-contact.mjs --with-user-token
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2025-02-19'});
const here = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(resolve(here, '../../src/pages/contact.astro'), 'utf8');

if (await client.fetch('defined(*[_id == "page-contact"][0].offices)')) {
    console.error('Contact details already imported; nothing to do.');
    process.exit(1);
}

const offices = [...code.matchAll(/<div class="office-location">([\s\S]*?)<\/div>\s*<\/div>/g)].map(([, office]) => ({
    _type: 'office',
    _key: randomUUID().slice(0, 12),
    name: office.match(/<p class="name">([^<]*)<\/p>/)[1].trim(),
    address: office.match(/<p class="address">([^<]*)<\/p>/)[1].trim(),
    map: office.match(/<iframe src="([^"]+)"/)[1],
}));

await client
    .patch('page-contact')
    .set({email: code.match(/href="mailto:([^"]+)"/)[1], offices})
    .commit({visibility: 'sync'});
console.log(`Contact: ${code.match(/href="mailto:([^"]+)"/)[1]}; offices: ${offices.map((o) => o.name).join(', ')}`);
