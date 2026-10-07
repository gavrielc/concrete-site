// Moves the homepage SEO title/description from the old "page-home" document into the
// "homepage" document (SEO tab), then deletes "page-home".
// Run from the studio folder: npx sanity exec migration/move-homepage-seo.mjs --with-user-token
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2025-02-19'});
const old = await client.fetch('*[_id == "page-home"][0]{seoTitle, seoDescription}');
if (!old) {
    console.log('Nothing to move.');
    process.exit(0);
}
await client.patch('homepage').set({seoTitle: old.seoTitle, seoDescription: old.seoDescription}).commit({visibility: 'sync'});
await client.transaction().delete('page-home').delete('drafts.page-home').commit({visibility: 'sync'});
console.log('Moved:', JSON.stringify(await client.fetch('*[_id == "homepage"][0]{seoTitle, seoDescription}')));
