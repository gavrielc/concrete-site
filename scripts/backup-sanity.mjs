// Backs up all published Sanity content (documents + images) into one folder:
//   <out>/documents.ndjson   every published document, one JSON per line
//   <out>/images/...         every uploaded image, named by its asset id
// Used by .github/workflows/sanity-backup.yml. The dataset is public, so no token is needed.
//   node scripts/backup-sanity.mjs <out-folder>
import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const PROJECT_ID = 'o458gxs0';
const DATASET = 'production';
const out = process.argv[2] || 'sanity-backup';

const response = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2025-02-19/data/export/${DATASET}`);
if (!response.ok) throw new Error(`Export failed: ${response.status}`);
const ndjson = await response.text();
const docs = ndjson.split('\n').filter(Boolean).map((line) => JSON.parse(line));

await mkdir(join(out, 'images'), {recursive: true});
await writeFile(join(out, 'documents.ndjson'), ndjson);

const assets = docs.filter((d) => d._type === 'sanity.imageAsset' || d._type === 'sanity.fileAsset');
const queue = [...assets];
let saved = 0;
const failed = [];
async function worker() {
    while (queue.length) {
        const asset = queue.shift();
        try {
            const file = await fetch(asset.url);
            if (!file.ok) throw new Error(`HTTP ${file.status}`);
            await writeFile(join(out, 'images', `${asset._id}.${asset.extension}`), Buffer.from(await file.arrayBuffer()));
            saved++;
        } catch (error) {
            failed.push(`${asset._id}: ${error.message}`);
        }
    }
}
await Promise.all(Array.from({length: 6}, worker));

const counts = docs.reduce((acc, d) => ((acc[d._type] = (acc[d._type] || 0) + 1), acc), {});
console.log(`Documents: ${docs.length}`, counts);
console.log(`Images saved: ${saved}/${assets.length}`);
if (failed.length) {
    console.error(`Failed:\n${failed.join('\n')}`);
    process.exit(1);
}
