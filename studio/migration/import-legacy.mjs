// Imports legacy-content.json (see export-legacy.mjs) into the Sanity dataset.
// Run from the studio folder: npx sanity exec migration/import-legacy.mjs --with-user-token
// Pass `-- --replace` to delete previously imported content first.
import {readFileSync, createReadStream} from 'node:fs';
import {resolve, dirname, basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getCliClient} from 'sanity/cli';
import {LexoRank} from 'lexorank';

const client = getCliClient({apiVersion: '2025-02-19'});
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const legacy = JSON.parse(readFileSync(resolve(here, 'legacy-content.json'), 'utf8'));
const TYPES = ['coverage', 'publication', 'client', 'teamMember'];

const existing = await client.fetch('count(*[_type in $types])', {types: TYPES});
if (existing > 0) {
    if (!process.argv.includes('--replace')) {
        console.error(`Dataset already has ${existing} imported documents. Re-run with "-- --replace" to start over.`);
        process.exit(1);
    }
    // Coverage references publications, so it must go first.
    for (const type of TYPES) {
        await client.delete({query: '*[_type == $type]', params: {type}});
    }
    console.log(`Deleted ${existing} previously imported documents.`);
}

// Upload each image file once.
const assetIds = new Map();
async function uploadAll(paths) {
    const queue = [...new Set(paths)].filter((p) => p && !assetIds.has(p));
    const worker = async () => {
        while (queue.length) {
            const path = queue.shift();
            const asset = await client.assets.upload('image', createReadStream(resolve(repoRoot, path)), {
                filename: basename(path),
            });
            assetIds.set(path, asset._id);
        }
    };
    await Promise.all(Array.from({length: 4}, worker));
}
const image = (path) => (path ? {_type: 'image', asset: {_type: 'reference', _ref: assetIds.get(path)}} : undefined);

// "May 15, 2026" -> "2026-05-15"
function isoDate(value) {
    if (!value) return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return undefined;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function createAll(docs) {
    for (let i = 0; i < docs.length; i += 50) {
        const tx = client.transaction();
        docs.slice(i, i + 50).forEach((doc) => tx.create(doc));
        await tx.commit({visibility: 'sync'});
    }
}

function ranks(count) {
    const out = [];
    let rank = LexoRank.min();
    for (let i = 0; i < count; i++) {
        rank = rank.genNext().genNext();
        out.push(rank.toString());
    }
    return out;
}

const strip = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''));

const {results, clients, team, homepage} = legacy;
const homepageUrls = new Set(homepage.map((h) => h.url));
const isPodcastCard = (r) => r.tags.includes('podcasts') && r.embed !== false;

// Publications: one per name, using the logo file that name uses most often.
const logoCounts = new Map();
for (const r of results.filter((r) => !isPodcastCard(r))) {
    const counts = logoCounts.get(r.publication) || new Map();
    counts.set(r.logo.src, (counts.get(r.logo.src) || 0) + 1);
    logoCounts.set(r.publication, counts);
}
const publicationLogos = [...logoCounts].map(([name, counts]) => [name, [...counts].sort((a, b) => b[1] - a[1])[0][0]]);

console.log('Uploading images...');
await uploadAll([
    ...publicationLogos.map(([, logo]) => logo),
    ...clients.map((c) => c.logo.src),
    ...team.map((t) => t.image.src),
]);
console.log(`Uploaded ${assetIds.size} images.`);

await createAll(publicationLogos.map(([name, logo]) => ({_type: 'publication', name, logo: image(logo)})));
// Look the new documents up by name; transaction results are not guaranteed to be in creation order.
const createdPublications = await client.fetch('*[_type == "publication"]{_id, name}', {}, {perspective: 'raw'});
const publicationByName = new Map(createdPublications.map((p) => [p.name, p._id]));
if (publicationByName.size !== publicationLogos.length) {
    throw new Error(`Expected ${publicationLogos.length} publications, found ${publicationByName.size}`);
}
console.log(`Created ${publicationByName.size} publications.`);

const clientRanks = ranks(clients.length);
await createAll(
    clients.map((c, i) =>
        strip({
            _type: 'client',
            name: c.name,
            logo: image(c.logo.src),
            website: c.site,
            categories: c.tags,
            logoStyle: c.logoClass,
            orderRank: clientRanks[i],
        })
    )
);
console.log(`Created ${clients.length} clients.`);

const teamRanks = ranks(team.length);
await createAll(
    team.map((t, i) =>
        strip({
            _type: 'teamMember',
            name: t.name,
            title: t.title,
            bio: t.bio,
            photo: image(t.image.src),
            linkedin: t.linkedin,
            twitter: t.twitter,
            orderRank: teamRanks[i],
        })
    )
);
console.log(`Created ${team.length} team members.`);

const coverage = results.map((r, legacyOrder) =>
    isPodcastCard(r)
        ? strip({
              _type: 'coverage',
              kind: 'podcast',
              url: r.podcastHref || r.url,
              date: isoDate(r.podcastDate || r.date),
              title: r.podcastTitle,
              show: r.podcastShow,
              duration: r.podcastDuration,
              artworkUrl: r.podcastArtwork,
              categories: r.tags,
              legacyOrder,
          })
        : strip({
              _type: 'coverage',
              kind: 'article',
              url: r.url,
              date: isoDate(r.date),
              headline: r.headline,
              publication: {_type: 'reference', _ref: publicationByName.get(r.publication)},
              categories: r.tags,
              showOnHomepage: homepageUrls.has(r.url),
              legacyOrder,
          })
);
await createAll(coverage);
console.log(`Created ${coverage.length} coverage items.`);
