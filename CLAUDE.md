# Results System Documentation

This document explains how the results/media coverage system works in the Concrete Media website and how to add new results.

## System Overview

The results system displays media coverage organized by categories (tags) like "Highlights", "AI & ML", "B2B SaaS", etc. It supports both regular articles and podcast embeds.

## File Structure

```
src/components/results/
├── index.jsx          # Main React component
├── data/
│   ├── index.js       # Combines all monthly files
│   ├── 2025-02-28.js  # results added on february 28
│   ├── old-results.js # older results
│   ├── PublicationLogos.md # list of publication names and the filename of the logo image located within the `src/assets/publication-logos/` folder
│   └── [more YYYY-MM.js files] # Other monthly files
└── styles.module.scss # Styling

src/assets/publication-logos/
└── [various logo files] # Publication logos
```

## How It Works

### Data Structure

Each result in `results.js` follows this structure:

**Regular Articles:**
```javascript
{
    url: "https://example.com/article-url",
    logo: importedLogo,
    publication: "Publication Name",
    date: "Month Day, Year",
    headline: "Article Headline",
    tags: ['security', 'highlights', 'dev']
}
```

**Podcasts:**
```javascript
{
    url: "https://open.spotify.com/embed/episode/EPISODE_ID",
    tags: ['podcasts']
}
```

### Available Tags

Tags are defined in `src/components/results/index.jsx:9-19`:

- `highlights` - coverage in high level publications
- `AI & ML` - Artificial Intelligence and Machine Learning
- `saas` - B2B SaaS companies
- `dev` - Developer tools and platforms
- `security` - Cybersecurity companies
- `podcasts` - Podcast appearances

## Adding New Results

The results are organized by date added. Each new addition involves creating a new file rather than editing existing ones.

### Step 1: Create New File (if one doesn't exist for the current date)

### Step 2: Add Publication Logo (if new)

1. Save logo file to `src/assets/publication-logos/`
2. Import in your file:
```javascript
import newpub from '../../../assets/publication-logos/newpub.png';
```
### Step 3: Add Result to Array

**For Regular Articles:**
```javascript
{
    url: "https://techcrunch.com/example-article",
    logo: techcrunch,
    publication: "TechCrunch", 
    date: "March 15, 2025",
    headline: "Company X Raises $50M for Revolutionary AI Platform",
    tags: ['AI & ML', 'highlights', 'saas']
}
```

**For Podcasts:**
```javascript
{
    url: "https://open.spotify.com/embed/episode/4dh5naxMVgYrvk3p6Uh8Pt",
    tags: ['podcasts']
}
```

### Step 4: Update Index File

Add your new file to `data/index.js`:

1. **Import the new file:**
```javascript
import results20250307 from './2025-03-07.js';
```

2. **Add to the allResults array** (at the top for newest first):
```javascript
const allResults = [
    ...results20250307, // Add newest at top
    ...results20250228,
    // ... rest
];
```

### Step 5: Choose Appropriate Tags

- Use `highlights` for high level publications
- Match tags to the company's industry/focus and the type of story
- Multiple tags are allowed and recommended
- Podcasts should only use `['podcasts']`

## Best Practices

### Date Format
- Use full month names: "March 15, 2025" not "Mar 15, 2025"
- Be consistent with format across all entries
- Make sure to order all results newest to oldest

### Headlines
- Use exact headline from the article

### Fetching data
- If you are given a URL to add, get the article itself (fetch using firecrawl mcp scrape, if that doesn't work then try to fetch directly) and get the date, headline and other necessary details from there
- If you are unable to find/fetch the article, you can try to infer the headline and date from the URL but note this. If the URL is missing the date or headline, don't add the result and note this in your response
- If you are given a podcast link that is not a spotify link, find the spotify link for the episode and use that instead
- If a logo isn't saved yet, track it down and save it. Get the official logo from the publication site
- Use parallel subagents when fetching multiple results
- Use spotify mcp search to find the episode. Search with "type" of "episode" and limit to 1
