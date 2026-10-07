// Moves the homepage coverage selection from the old "showOnHomepage" toggle (4 newest shown)
// to the ordered "coverageItems" list in the Homepage document, then removes the old toggle.
// Run from the studio folder: npx sanity exec migration/move-homepage-coverage.mjs --with-user-token
import {randomUUID} from 'node:crypto';
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2025-02-19'});
const shown = await client.fetch(
    '*[_type == "coverage" && showOnHomepage == true && !(_id in path("drafts.**"))] | order(date desc)[0...4]{_id, headline}'
);
const withToggle = await client.fetch('*[_type == "coverage" && defined(showOnHomepage)]._id', {}, {perspective: 'raw'});

const tx = client.transaction();
tx.patch('homepage', {
    set: {coverageItems: shown.map((c) => ({_type: 'reference', _key: randomUUID().slice(0, 12), _ref: c._id}))},
});
withToggle.forEach((id) => tx.patch(id, {unset: ['showOnHomepage']}));
await tx.commit({visibility: 'sync'});
console.log(`Homepage cards: ${shown.map((c) => c.headline.slice(0, 40)).join(' | ')}`);
console.log(`Removed the old toggle from ${withToggle.length} documents.`);
