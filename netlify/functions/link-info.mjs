// Reads a coverage link and returns the details the Studio uses to fill in a coverage item.
//   GET /.netlify/functions/link-info?url=<article or Apple Podcasts episode link>
//   GET /.netlify/functions/link-info?image=<Apple artwork URL>   (image proxy, so the Studio can upload it)
// Only parsed fields are returned, never the fetched page itself.

const CORS = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET'};
const json = (status, body) =>
    new Response(JSON.stringify(body), {status, headers: {...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});

const decode = (s) =>
    s
        ?.replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;|&apos;/g, "'")
        .replace(/&#8217;|&rsquo;/g, '’')
        .replace(/&#8216;|&lsquo;/g, '‘')
        .replace(/&#8220;|&ldquo;/g, '“')
        .replace(/&#8221;|&rdquo;/g, '”')
        .replace(/&#8211;|&ndash;/g, '–')
        .replace(/&#8212;|&mdash;/g, '—')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();

const isoDate = (value) => {
    if (!value) return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
};

// "1h 6m" / "31m", the format the podcast cards use.
const duration = (ms) => {
    if (!ms) return undefined;
    const minutes = Math.round(ms / 60000);
    const h = Math.floor(minutes / 60);
    return h ? `${h}h ${minutes % 60}m` : `${minutes}m`;
};

async function fetchText(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`The page returned ${response.status}`);
    return (await response.text()).slice(0, 2_000_000);
}

function meta(html, ...names) {
    for (const name of names) {
        const re = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${name}["'][^>]*>`, 'i');
        const tag = html.match(re)?.[0];
        const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
        if (content) return decode(content);
    }
    return undefined;
}

// Pull Article/NewsArticle data out of JSON-LD blocks.
function jsonLd(html) {
    const found = {};
    for (const [, raw] of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
        let data;
        try {
            data = JSON.parse(raw.trim());
        } catch {
            continue;
        }
        const nodes = [data, ...(Array.isArray(data) ? data : []), ...(data['@graph'] || [])].flat();
        for (const node of nodes) {
            const type = [].concat(node?.['@type'] || []).join(' ');
            if (!/Article|BlogPosting|Report/i.test(type)) continue;
            found.headline ||= decode(node.headline);
            found.date ||= isoDate(node.datePublished);
            found.publication ||= decode(node.publisher?.name);
        }
    }
    return found;
}

async function article(url) {
    const html = await fetchText(url);
    const ld = jsonLd(html);
    const siteName = meta(html, 'og:site_name', 'application-name');
    let headline = ld.headline || meta(html, 'og:title', 'twitter:title') || decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]);
    // Drop a trailing " | Site name" / " - Site name".
    if (headline && siteName) headline = headline.replace(new RegExp(`\\s*[|–—-]\\s*${siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'), '');
    const date =
        ld.date ||
        isoDate(meta(html, 'article:published_time', 'og:published_time', 'parsely-pub-date', 'pubdate', 'publish-date', 'date', 'datePublished', 'sailthru.date')) ||
        isoDate(html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1]);
    return {kind: 'article', headline, date, publication: ld.publication || siteName};
}

// Apple Podcasts episode links: podcasts.apple.com/.../id<show>?i=<episode>
async function applePodcast(url) {
    const showId = url.pathname.match(/id(\d+)/)?.[1];
    const episodeId = url.searchParams.get('i');
    if (!showId || !episodeId) return undefined;
    const response = await fetch(`https://itunes.apple.com/lookup?id=${showId}&entity=podcastEpisode&limit=300`, {signal: AbortSignal.timeout(8000)});
    const episode = (await response.json()).results?.find((r) => String(r.trackId) === episodeId);
    if (!episode) return undefined;
    return {
        kind: 'podcast',
        title: episode.trackName,
        show: episode.collectionName,
        date: isoDate(episode.releaseDate),
        duration: duration(episode.trackTimeMillis),
        artwork: episode.artworkUrl600?.replace('600x600bb', '1200x1200bb'),
        url: `https://podcasts.apple.com/podcast/id${showId}?i=${episodeId}`,
    };
}

async function podcastPage(url) {
    const html = await fetchText(url.href);
    return {
        kind: 'podcast',
        title: meta(html, 'og:title', 'twitter:title'),
        show: meta(html, 'og:site_name'),
        date: isoDate(meta(html, 'article:published_time', 'datePublished')),
        artwork: meta(html, 'og:image'),
    };
}

export default async (request) => {
    if (request.method === 'OPTIONS') return new Response(null, {headers: CORS});
    const params = new URL(request.url).searchParams;

    // Image proxy: only Apple's artwork CDN.
    const image = params.get('image');
    if (image) {
        const imageUrl = new URL(image);
        if (!/(^|\.)mzstatic\.com$/.test(imageUrl.hostname)) return json(400, {error: 'Unsupported image host'});
        const response = await fetch(imageUrl, {signal: AbortSignal.timeout(8000)});
        return new Response(response.body, {
            status: response.status,
            headers: {...CORS, 'Content-Type': response.headers.get('content-type') || 'image/jpeg'},
        });
    }

    let url;
    try {
        url = new URL(params.get('url'));
        if (!/^https?:$/.test(url.protocol)) throw new Error();
    } catch {
        return json(400, {error: 'Please paste a full link starting with https://'});
    }

    try {
        const isApple = /(^|\.)podcasts\.apple\.com$/.test(url.hostname);
        const isPodcastHost = isApple || /(^|\.)(open\.spotify\.com|podcasts\.google\.com)$/.test(url.hostname);
        const info = isApple ? (await applePodcast(url)) || (await podcastPage(url)) : isPodcastHost ? await podcastPage(url) : await article(url.href);
        return json(200, info);
    } catch (error) {
        // Some sites block automated requests. Fall back to what the link itself tells us.
        const fromLink = fromUrl(url);
        if (fromLink.date || fromLink.publication) {
            return json(200, {
                ...fromLink,
                warning: `The site didn't allow reading the page (${error.message}). The date and publication were taken from the link; please add the headline.`,
            });
        }
        return json(502, {error: `Couldn't read the link (${error.message}). Please fill in the details by hand.`});
    }
};

// Date from paths like /2026/04/14/, publication from the domain (forbes.com -> "forbes").
function fromUrl(url) {
    const m = url.pathname.match(/\/(20\d{2})[/-](\d{1,2})[/-](\d{1,2})(?:\/|$)/);
    const date = m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : undefined;
    const publication = url.hostname.replace(/^www\./, '').split('.').slice(-2, -1)[0];
    return {kind: 'article', date, publication};
}
