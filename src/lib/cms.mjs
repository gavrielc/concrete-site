// Content managed in Sanity (see /studio). Fetched once per build and exposed to the site as
// virtual modules, so components import it the same way they used to import the local data files:
//   import results from 'virtual:cms/results';
const PROJECT_ID = 'o458gxs0';
const DATASET = 'production';
const API_VERSION = '2025-02-19';

async function sanityQuery(query) {
    const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?perspective=published`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query}),
    });
    if (!response.ok) {
        throw new Error(`Sanity query failed (${response.status}): ${await response.text()}`);
    }
    return (await response.json()).result;
}

// "2026-05-15" -> "May 15, 2026"
function formatDate(isoDate) {
    if (!isoDate) return undefined;
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

const compact = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

async function loadClients() {
    const clients = await sanityQuery(`*[_type == "client"] | order(orderRank) {
        name, website, categories, logoStyle, "logo": logo.asset->url
    }`);
    return clients.map((c) =>
        compact({logo: {src: c.logo}, name: c.name, site: c.website, tags: c.categories || [], logoClass: c.logoStyle})
    );
}

async function loadTeam() {
    const team = await sanityQuery(`*[_type == "teamMember"] | order(orderRank) {
        name, title, bio, linkedin, twitter, "image": photo.asset->url
    }`);
    return team.map((t) => compact({...t, image: {src: t.image}}));
}

// Same shape and order the results page used when the data lived in src/components/results/data.
async function loadResults() {
    const items = await sanityQuery(`*[_type == "coverage"] {
        _createdAt, kind, url, date, categories, headline, showOnHomepage, legacyOrder,
        title, show, duration, artworkUrl, "artwork": artwork.asset->url,
        "publication": publication->name, "logo": publication->logo.asset->url
    }`);

    const timestamp = (date) => (date ? Date.parse(date) : Number.NEGATIVE_INFINITY);
    // Newest first; imported items keep their original order, new items come before them on the same date.
    const byDate = (a, b) =>
        timestamp(b.date) - timestamp(a.date) ||
        (a.legacyOrder ?? -1) - (b.legacyOrder ?? -1) ||
        b._createdAt.localeCompare(a._createdAt);

    const toResult = (item) => {
        const tags = [...(item.categories || [])];
        if (item.kind === 'podcast') {
            if (!tags.includes('podcasts')) tags.push('podcasts');
            return compact({
                url: item.url,
                tags,
                podcastTitle: item.title,
                podcastShow: item.show,
                podcastDate: item.date,
                podcastDuration: item.duration,
                podcastHref: item.url,
                podcastArtwork: item.artwork || item.artworkUrl,
            });
        }
        return compact({
            url: item.url,
            logo: item.logo ? {src: item.logo} : undefined,
            publication: item.publication || '',
            date: formatDate(item.date),
            headline: item.headline,
            tags,
            // Articles shown under the Podcasts tab render as regular cards.
            embed: tags.includes('podcasts') ? false : undefined,
            showOnHomepage: item.showOnHomepage || undefined,
        });
    };

    const isPodcastTab = (item) => item.kind === 'podcast' || (item.categories || []).includes('podcasts');
    const articles = items.filter((i) => !isPodcastTab(i)).sort(byDate);
    const podcasts = items.filter(isPodcastTab).sort(byDate);
    return [...articles, ...podcasts].map(toResult);
}

async function loadPositions() {
    return sanityQuery(`*[_type == "jobPosition" && isOpen != false] | order(orderRank) {
        title, location, overview, applyEmail, "sections": sections[]{heading, points}
    }`);
}

const loaders = {
    clients: loadClients,
    team: loadTeam,
    positions: loadPositions,
    results: loadResults,
    'homepage-results': async () => (await load('results')).filter((r) => r.showOnHomepage && r.logo).slice(0, 4),
};

const cache = new Map();
function load(name) {
    if (!cache.has(name)) cache.set(name, loaders[name]());
    return cache.get(name);
}

const PREFIX = 'virtual:cms/';

export default function cmsContent() {
    return {
        name: 'cms-content',
        resolveId(id) {
            if (id.startsWith(PREFIX) && id.slice(PREFIX.length) in loaders) return '\0' + id;
        },
        async load(id) {
            if (!id.startsWith('\0' + PREFIX)) return;
            const data = await load(id.slice(PREFIX.length + 1));
            return `export default ${JSON.stringify(data)};`;
        },
    };
}
