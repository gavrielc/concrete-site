// Import all date-based result files
import podcastMetadata from './podcast-metadata.js';
import results20260607podcasts from './2026-06-07-podcasts.js';
import results20260602 from './2026-06-02.js';
import results20260518batch2 from './2026-05-18-batch2.js';
import results20260518podcasts from './2026-05-18-podcasts.js';
import results20260518 from './2026-05-18.js';
import results20260515 from './2026-05-15.js';
import results20251222 from './2025-12-22.js';
import results20250913batch3 from './2025-09-13-batch3.js';
import results20250913batch2 from './2025-09-13-batch2.js';
import results20250913 from './2025-09-13.js';
import results20250619 from './2025-06-19.js';
import results20250619batch2 from './2025-06-19-batch2.js';
import results20250619podcasts from './2025-06-19-podcasts.js';
import results20250615 from './2025-06-15.js';
import results20250228 from './2025-02-28.js';
import oldResults from './old-results.js';

// Combine all results into a single array
const combinedResults = [
    ...results20260607podcasts,
    ...results20260602,
    ...results20260518batch2,
    ...results20260518podcasts,
    ...results20260518,
    ...results20260515,
    ...results20251222,
    ...results20250913batch3,
    ...results20250913batch2,
    ...results20250913,
    ...results20250619,
    ...results20250619batch2,
    ...results20250619podcasts,
    ...results20250615,
    ...results20250228,
    ...oldResults,
];

// Separate podcasts from regular articles
const podcasts = combinedResults.filter(item => item.tags && item.tags.includes('podcasts'));
const articles = combinedResults.filter(item => !item.tags || !item.tags.includes('podcasts'));

const getDateTimestamp = (date) => {
    const timestamp = Date.parse(date);
    return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};

// Sort articles by date (newest first)
const sortedArticles = articles.sort((a, b) => {
    // Parse dates for comparison
    const dateA = getDateTimestamp(a.date);
    const dateB = getDateTimestamp(b.date);
    return dateB - dateA; // Newest first
});

// Sort podcasts by original episode publish date, not by when they were added to the site.
const sortedPodcasts = podcasts
    .map((item, index) => ({item, index}))
    .sort((a, b) => {
        const dateA = getDateTimestamp(podcastMetadata[a.item.url]?.date || a.item.date);
        const dateB = getDateTimestamp(podcastMetadata[b.item.url]?.date || b.item.date);
        return dateB - dateA || a.index - b.index;
    })
    .map(({item}) => {
        const metadata = podcastMetadata[item.url] || {};

        return {
            ...item,
            podcastTitle: metadata.title || item.headline,
            podcastShow: metadata.show || item.publication,
            podcastDate: metadata.date || item.date,
            podcastDuration: metadata.duration,
            podcastHref: metadata.href || item.url,
            podcastArtwork: metadata.artwork,
        };
    });

const allResults = [...sortedArticles, ...sortedPodcasts];

export default allResults;
