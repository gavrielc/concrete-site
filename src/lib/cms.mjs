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
    const clients = await sanityQuery(`*[_type == "client" && isVisible != false] | order(orderRank, _id) {
        name, website, categories, logoStyle, "logo": logo.asset->url
    }`);
    return clients.map((c) =>
        compact({logo: {src: c.logo}, name: c.name, site: c.website, tags: c.categories || [], logoClass: c.logoStyle})
    );
}

async function loadTeam() {
    const team = await sanityQuery(`*[_type == "teamMember"] | order(orderRank, _id) {
        name, title, bio, linkedin, "image": photo.asset->url
    }`);
    return team.map((t) => compact({...t, image: {src: t.image}}));
}

// Same shape and order the results page used when the data lived in src/components/results/data.
async function loadResults() {
    const items = await sanityQuery(`*[_type == "coverage"] {
        _createdAt, kind, url, date, categories, headline, legacyOrder,
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
                // Shown at 64px; request a 2x square from the Sanity image CDN.
                podcastArtwork: item.artwork ? `${item.artwork}?w=128&h=128&fit=crop&auto=format` : item.artworkUrl,
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
        });
    };

    const isPodcastTab = (item) => item.kind === 'podcast' || (item.categories || []).includes('podcasts');
    const articles = items.filter((i) => !isPodcastTab(i)).sort(byDate);
    const podcasts = items.filter(isPodcastTab).sort(byDate);
    return [...articles, ...podcasts].map(toResult);
}

async function loadPositions() {
    return sanityQuery(`*[_type == "jobPosition" && isOpen != false] | order(orderRank, _id) {
        title, location, overview, applyEmail, "sections": sections[]{heading, points}
    }`);
}

async function loadTestimonials() {
    const testimonials = await sanityQuery(`*[_type == "testimonial" && isVisible != false] | order(orderRank, _id) {
        "text": quote, name, title, "company": client->name,
        "logo": coalesce(logoOverride.asset->url, client->logo.asset->url)
    }`);
    return testimonials.map((t) => ({...t, logo: {src: t.logo}}));
}

// The coverage cards chosen (and ordered) in the Homepage document.
async function loadHomepageResults() {
    const items = await sanityQuery(`*[_id == "homepage"][0].coverageItems[]->{
        url, date, headline, "publication": publication->name, "logo": publication->logo.asset->url
    }`);
    return (items || []).filter(Boolean).map((item) =>
        compact({url: item.url, logo: item.logo ? {src: item.logo} : undefined, publication: item.publication || '', date: formatDate(item.date), headline: item.headline})
    );
}

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function loadHomepageClients() {
    const logos = await sanityQuery(`*[_id == "homepage"][0].clientLogos[]->{name, website, isVisible, "logo": logo.asset->url}`);
    return (logos || []).filter((c) => c && c.isVisible !== false).map(({isVisible, ...c}) => ({...c, logo: {src: c.logo}}));
}

// Homepage section texts and images (the client logos are loaded separately above).
async function loadHomepage() {
    const home = await sanityQuery(`*[_id == "homepage"][0]{
        heroText, "heroImage": heroImage.asset->url,
        clientsHeading, clientsButtonLabel,
        coverageHeading, coverageText, coverageButtonLabel,
        testimonialsHeading,
        "joinUsImage": joinUsImage.asset->url, joinUsImageAlt, joinUsHeading, joinUsText, joinUsButtonLabel,
        seoTitle, seoDescription
    }`);
    // Line breaks in the tagline become <br>
    return {...home, heroHtml: escapeHtml(home?.heroText || '').replace(/\n/g, '<br>')};
}

// Portable Text paragraphs -> the HTML the page intros used before ("<b>" for bold, "<br><br>" between paragraphs).
function introHtml(blocks) {
    return (blocks || [])
        .map((block) =>
            (block.children || [])
                .map((span) => {
                    let html = escapeHtml(span.text || '');
                    if (span.marks?.includes('em')) html = `<i>${html}</i>`;
                    if (span.marks?.includes('strong')) html = `<b>${html}</b>`;
                    return html;
                })
                .join('')
        )
        .join('<br><br>');
}

// Page headings, intros and SEO, keyed by page: {coverage, clients, team, joinUs, contact}.
async function loadPages() {
    const pages = await sanityQuery(`*[_type == "page" && _id match "page-*" && !(_id in path("drafts.**"))]{
        _id, heading, intro, seoTitle, seoDescription,
        positionsHeading, bannerText, benefitsHeading, benefitsButtonLabel,
        email, "offices": offices[]{name, address, map},
        "banner": bannerImage.asset->{url, "width": metadata.dimensions.width, "height": metadata.dimensions.height},
        "benefits": benefits[]{title, text, "icon": icon.asset->url}
    }`);
    return Object.fromEntries(
        pages.map((p) => [
            p._id.replace(/^page-/, ''),
            {
                ...p,
                intro: introHtml(p.intro),
                // The map field accepts the embed link or the whole <iframe> code from Google Maps.
                offices: (p.offices || []).map((o) => ({...o, mapSrc: o.map?.match(/src="([^"]+)"/)?.[1] || o.map?.trim()})),
            },
        ])
    );
}

const loaders = {
    pages: loadPages,
    clients: loadClients,
    'homepage-clients': loadHomepageClients,
    homepage: loadHomepage,
    team: loadTeam,
    positions: loadPositions,
    testimonials: loadTestimonials,
    results: loadResults,
    'homepage-results': loadHomepageResults,
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
