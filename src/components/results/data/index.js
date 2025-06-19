// Import all date-based result files
import results20250619 from './2025-06-19.js';
import results20250619batch2 from './2025-06-19-batch2.js';
import results20250619podcasts from './2025-06-19-podcasts.js';
import results20250615 from './2025-06-15.js';
import results20250228 from './2025-02-28.js';
import oldResults from './old-results.js';

// Combine all results into a single array
const combinedResults = [
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

// Sort articles by date (newest first)
const sortedArticles = articles.sort((a, b) => {
    // Parse dates for comparison
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Newest first
});

// Combine sorted articles with podcasts (podcasts maintain their original order)
const allResults = [...sortedArticles, ...podcasts];

export default allResults;
