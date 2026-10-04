// Merges publications whose names differ only in spacing/case/punctuation (e.g. "SiliconAngle" / "Silicon Angle").
// The most-used spelling is kept; coverage items are re-pointed to it and the duplicates are deleted.
// Run from the studio folder: npx sanity exec migration/merge-duplicate-publications.mjs --with-user-token
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2025-02-19'});
const key = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^the/, '');

const publications = await client.fetch(
    `*[_type == "publication" && !(_id in path("drafts.**"))]{_id, name, "uses": count(*[_type == "coverage" && references(^._id)])}`
);
const groups = new Map();
for (const p of publications) groups.set(key(p.name), [...(groups.get(key(p.name)) || []), p]);

let merged = 0;
for (const group of groups.values()) {
    if (group.length < 2) continue;
    const [keep, ...duplicates] = group.sort((a, b) => b.uses - a.uses);
    const tx = client.transaction();
    for (const dup of duplicates) {
        const items = await client.fetch(`*[_type == "coverage" && references($id)]._id`, {id: dup._id});
        items.forEach((id) => tx.patch(id, {set: {publication: {_type: 'reference', _ref: keep._id}}}));
    }
    await tx.commit({visibility: 'sync'});
    const del = client.transaction();
    duplicates.forEach((dup) => del.delete(dup._id));
    await del.commit({visibility: 'sync'});
    merged += duplicates.length;
    console.log(`${keep.name} <- ${duplicates.map((d) => d.name).join(', ')}`);
}
console.log(`Merged ${merged} duplicate publications.`);
