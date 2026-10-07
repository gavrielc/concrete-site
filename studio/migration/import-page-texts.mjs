// One-time import of the page headings, intro texts and SEO titles/descriptions that were
// hard-coded in the Astro pages. Creates fixed documents "page-<key>".
// Run from the studio folder: npx sanity exec migration/import-page-texts.mjs --with-user-token
import {randomUUID} from 'node:crypto';
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2025-02-19'});
const key = () => randomUUID().slice(0, 12);

// "Some <b>bold</b> text<br><br>Next paragraph" -> Portable Text blocks
function toBlocks(html) {
    return html.split(/<br\s*\/?>\s*<br\s*\/?>/).map((paragraph) => ({
        _type: 'block',
        _key: key(),
        style: 'normal',
        markDefs: [],
        children: paragraph
            .trim()
            .split(/(<b>.*?<\/b>)/)
            .filter(Boolean)
            .map((part) => {
                const bold = part.match(/^<b>(.*)<\/b>$/);
                return {_type: 'span', _key: key(), text: bold ? bold[1] : part, marks: bold ? ['strong'] : []};
            }),
    }));
}
const plain = (html) => html.replace(/<br\s*\/?>\s*<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const coverageIntro =
    "We identify the publications that will bring the greatest value to your company, and leverage our expertise and contacts to ensure you feature in them regularly. <br><br>These are some of the <b>recent</b> and <b>impactful</b> media items we've arranged in top business, tech, mainstream and industry publications.";
const clientsIntro =
    "Our clients represent the dynamic companies you know and respect across industries. Whether we're working as an extension of the team from seed to IPO or taking on a short-term launch project, we are proud to be partners in their success.";
const teamIntro =
    "Concrete Media is fluent in technology and media. We get what you're doing and know how to communicate it to reporters. We become an extension of your team, absorbing every development in your company and the industry to proactively craft stories that will get you in the news.";
const joinUsIntro =
    "We deliver top-tier Public Relations services to the brightest and most innovative tech startups. By joining us, you have the opportunity to impact the narrative and success of some of the world's most dynamic tech companies.";

const pages = [
    {
        _id: 'page-home',
        label: 'Homepage',
        seoTitle: 'Public Relations for tech companies | Concrete Media',
        seoDescription: 'Concrete Media is a PR agency that secures high-level media coverage for some of the most dynamic tech companies.',
    },
    {
        _id: 'page-coverage',
        label: 'Coverage',
        heading: 'Media Results',
        intro: toBlocks(coverageIntro),
        seoTitle: 'Media results | Public Relations for serious tech companies | Concrete Media',
        seoDescription: plain(coverageIntro),
    },
    {
        _id: 'page-clients',
        label: 'Clients',
        heading: 'Client Experience',
        intro: toBlocks(clientsIntro),
        seoTitle: 'Our clients | Public Relations for serious tech companies | concrete.media',
        seoDescription: clientsIntro,
    },
    {
        _id: 'page-team',
        label: 'Team',
        heading:
            'There are six PR professionals for every reporter, so your PR firm has to be elite to get the earned media results you need to rise above the noise.',
        intro: toBlocks(teamIntro),
        seoTitle: 'Our team | Public Relations for serious tech companies | concrete.media',
        seoDescription: teamIntro,
    },
    {
        _id: 'page-joinUs',
        label: 'Join Us',
        heading: 'Do PR at the highest level with top tech startups.',
        intro: toBlocks(joinUsIntro),
        seoTitle: 'Join us | Public Relations for serious tech companies | concrete.media',
        seoDescription: joinUsIntro,
    },
    {
        _id: 'page-contact',
        label: 'Contact',
        heading: "Let's connect to discuss your PR needs",
        seoTitle: 'Contact | Public Relations for serious tech companies | Concrete Media',
        // The page had no description before; this is a starting point for the team to edit.
        seoDescription: 'Get in touch with Concrete Media, the PR agency that secures high-level media coverage for dynamic tech companies.',
    },
];

const tx = client.transaction();
pages.forEach((page) => tx.createIfNotExists({_type: 'page', ...page}));
await tx.commit({visibility: 'sync'});
console.log(`Page texts ready: ${pages.map((p) => p.label).join(', ')}`);
