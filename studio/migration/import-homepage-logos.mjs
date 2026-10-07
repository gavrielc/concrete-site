// Creates the "homepage" singleton with the client logos that were hard-coded in src/pages/index.astro.
// Run from the studio folder: npx sanity exec migration/import-homepage-logos.mjs --with-user-token
import {randomUUID} from 'node:crypto';
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2025-02-19'});

// Order and websites as they appeared on the homepage before the CMS.
const websites = [
    'https://buildots.com/',
    'https://www.band.ai/',
    'https://scaleops.com/',
    'https://www.datarails.com/',
    'https://kumo.ai/',
    'https://www.getport.io/',
];

if (await client.fetch('defined(*[_id == "homepage"][0])')) {
    console.error('The homepage document already exists; nothing to do.');
    process.exit(1);
}

const clients = await client.fetch('*[_type == "client" && website in $websites]{_id, name, website}', {websites});
const clientLogos = websites.map((website) => {
    const match = clients.find((c) => c.website === website);
    if (!match) throw new Error(`No client with website ${website}`);
    return {_type: 'reference', _key: randomUUID().slice(0, 12), _ref: match._id};
});

await client.create({_id: 'homepage', _type: 'homepage', clientLogos});
console.log(`Homepage logos: ${websites.map((w) => clients.find((c) => c.website === w).name).join(', ')}`);
