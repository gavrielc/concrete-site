// Imports legacy-positions.json (see export-positions.mjs) into Sanity.
// Run from the studio folder: npx sanity exec migration/import-positions.mjs --with-user-token
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {getCliClient} from 'sanity/cli';
import {LexoRank} from 'lexorank';

const client = getCliClient({apiVersion: '2025-02-19'});
const here = dirname(fileURLToPath(import.meta.url));
const positions = JSON.parse(readFileSync(resolve(here, 'legacy-positions.json'), 'utf8'));

const existing = await client.fetch('count(*[_type == "jobPosition"])');
if (existing > 0) {
    console.error(`Dataset already has ${existing} open positions; nothing imported.`);
    process.exit(1);
}

const key = () => randomUUID().slice(0, 12);
let rank = LexoRank.min();
const tx = client.transaction();
for (const p of positions) {
    rank = rank.genNext().genNext();
    tx.create({
        _type: 'jobPosition',
        title: p.title,
        location: p.location,
        isOpen: true,
        overview: p.overview,
        sections: p.sections.map((s) => ({_type: 'section', _key: key(), heading: s.heading, points: s.points})),
        applyEmail: p.applyEmail,
        orderRank: rank.toString(),
    });
}
await tx.commit({visibility: 'sync'});
console.log(`Created ${positions.length} open positions.`);
