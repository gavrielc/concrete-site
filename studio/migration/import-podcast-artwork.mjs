// Downloads podcast artwork that was linked from Apple's servers (artworkUrl), uploads it to
// Sanity as the item's "Show artwork" image, and removes the external link.
// Safe to re-run: only items that still have artworkUrl and no artwork are processed.
// Run from the studio folder: npx sanity exec migration/import-podcast-artwork.mjs --with-user-token
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2025-02-19'});
const items = await client.fetch(
    '*[_type == "coverage" && defined(artworkUrl) && !defined(artwork) && !(_id in path("drafts.**"))]{_id, title, artworkUrl}'
);
console.log(`${items.length} podcasts to process`);

const failed = [];
let done = 0;
const queue = [...items];
async function worker() {
    while (queue.length) {
        const item = queue.shift();
        try {
            const response = await fetch(item.artworkUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const buffer = Buffer.from(await response.arrayBuffer());
            const filename = new URL(item.artworkUrl).pathname.split('/').slice(-2).join('-');
            const asset = await client.assets.upload('image', buffer, {filename});
            await client
                .patch(item._id)
                .set({artwork: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}})
                .unset(['artworkUrl'])
                .commit();
            done++;
        } catch (error) {
            failed.push(`${item.title}: ${error.message}`);
        }
    }
}
await Promise.all(Array.from({length: 4}, worker));
console.log(`Uploaded ${done}. Failed ${failed.length}.`);
failed.forEach((f) => console.log(' - ' + f));
