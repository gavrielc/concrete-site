// Content of the editor guide. Used by the Studio "Help" tab (components/HelpTool.jsx) and by
// help/build-guide.mjs, which turns it into a printable PDF.
// Images live in static/help/; highlight boxes are percentages of the image (x, y, width, height).

export const guide = {
    title: 'Concrete Media website: editor guide',
    intro: 'Everything on the website — coverage, clients, testimonials, team, open positions and page texts — is edited here, in the Studio. This guide covers the everyday tasks.',
    sections: [
        {
            id: 'basics',
            title: 'How it works',
            paragraphs: [
                'Edit any item and click **Publish**. The website updates automatically within about a minute.',
                'Until you click Publish, your changes are a **draft**: they are saved, but not shown on the website. You can close the Studio and come back later.',
                'The **Home** screen gives you an overview, quick “Add” buttons and a **View website** button. It also lists anything that needs attention, like unpublished drafts.',
            ],
            image: '01-home.jpg',
            highlights: [
                {x: 83.3, y: 13.3, w: 12.6, h: 7},
                {x: 2.3, y: 23.2, w: 90.8, h: 7},
            ],
        },
        {
            id: 'menu',
            title: 'Find your way around',
            paragraphs: [
                'Click **Content** at the top. The menu on the left follows the website’s own menu: Homepage, Clients page, Team page, Coverage page, Join Us page and Contact page.',
                'Each page opens its parts — for example, **Coverage page** has the page text, **Articles**, **Podcasts** and **Publications**.',
            ],
            image: '02-menu.jpg',
            highlights: [{x: 1, y: 13, w: 27.5, h: 28}],
        },
        {
            id: 'article',
            title: 'Add press coverage (article)',
            steps: [
                'Go to **Coverage page → Articles** and click **+** (or click **Coverage article** on the Home screen).',
                'Paste the article link into **Link** and click **Fill in details from this link**. The headline, date and publication are filled in for you.',
                'Check the details. If the publication isn’t in the list, choose **Create new** in the Publication field and upload its logo.',
                'Tick the **Categories**. Choose **Highlights** to show it on the Coverage page’s main tab.',
                'Click **Publish**.',
            ],
            tips: [
                'Some sites (for example Forbes) block automatic reading. The date and publication are still filled in from the link; type the headline yourself.',
                'If the link is already in Coverage, you’ll see a warning with the existing item’s name.',
            ],
            image: '04-autofill.jpg',
            highlights: [{x: 38, y: 66.8, w: 50.5, h: 24}],
        },
        {
            id: 'podcast',
            title: 'Add a podcast episode',
            steps: [
                'Go to **Coverage page → Podcasts** and click **+** (or click **Podcast** on the Home screen).',
                'Paste the episode’s **Apple Podcasts** link into **Link** and click **Fill in details from this link**. The episode title, show, date, length and artwork are filled in.',
                'Click **Publish**. The episode appears on the Coverage page’s **Podcasts** tab, newest first.',
            ],
            tips: ['For other podcast links, fill in the episode title, show name, date and artwork by hand.'],
        },
        {
            id: 'homepage',
            title: 'Choose what’s on the homepage',
            paragraphs: [
                'Open **Homepage**. Its tabs follow the homepage from top to bottom: Top banner, Clients, Coverage, Testimonials, Join us and SEO.',
                'In **Coverage**, the **Coverage cards** list holds the 4 articles shown on the homepage. Click **Add item** to choose an article, drag the handle (⋮⋮) to change the order, or use **⋯ → Remove**. The **Clients** tab works the same way for the 6 client logos.',
                'Click **Publish** when you’re done.',
            ],
            image: '07-homepage-coverage.jpg',
            highlights: [
                {x: 58, y: 35.2, w: 6.8, h: 4.4},
                {x: 38, y: 54.2, w: 50.5, h: 33},
            ],
        },
        {
            id: 'clients',
            title: 'Clients and testimonials',
            steps: [
                'Go to **Clients page → Clients** and click **+** to add a client: company name, logo (SVG or a PNG with a transparent background), website and categories.',
                'To change the order on the website, drag a client by its handle (⋮⋮). The new order is saved immediately.',
                'To hide a client without deleting it, turn off **Show on website** and click Publish.',
                'Testimonials (**Clients page → Testimonials**) work the same way. Each testimonial is linked to a client, and shows that client’s logo.',
            ],
            image: '08-clients.jpg',
            highlights: [{x: 58.4, y: 14.4, w: 3.2, h: 84.6}],
        },
        {
            id: 'team',
            title: 'Team members',
            steps: [
                'Go to **Team page → Team** and click **+**.',
                'Add the name, role, photo, bio (leave an empty line between paragraphs) and LinkedIn link.',
                'Click **Publish**. Drag the handle (⋮⋮) to change the order on the Team page.',
            ],
        },
        {
            id: 'positions',
            title: 'Open positions',
            steps: [
                'Go to **Join Us page → Open positions** and click **+**.',
                'Add the job title, location, role overview and description sections (a heading with bullet points). The **Apply now** button emails the address in **Apply email**.',
                'Click **Publish**. To close a position without deleting it, turn off **Show on website**. When no positions are shown, the section disappears from the page.',
            ],
        },
        {
            id: 'texts',
            title: 'Page texts and Google (SEO)',
            paragraphs: [
                'Each page has a **Page text** item with the large purple heading and the paragraph under it. Select text to make it bold.',
                'The **SEO (Google)** tab sets the title and short description shown in Google results. A warning appears if they are longer than Google usually shows (60 and 160 characters).',
            ],
            image: '09-page-text.jpg',
            highlights: [{x: 39.6, y: 38.6, w: 26.4, h: 4.8}],
        },
        {
            id: 'publish',
            title: 'Publish, view, hide and delete',
            paragraphs: [
                '**Publish** (bottom right) makes your changes live. The **⋯** menu next to it has more options:',
            ],
            bullets: [
                '**View on website** opens the page where this item appears.',
                '**Discard changes** throws away an unpublished draft.',
                '**Delete** removes the item completely. To hide something temporarily, use **Show on website** instead.',
            ],
            image: '05-actions.jpg',
            highlights: [{x: 82.9, y: 64.8, w: 15.2, h: 29.6}],
        },
        {
            id: 'faq',
            title: 'Questions',
            faq: [
                ['I published, but the website hasn’t changed.', 'Wait about a minute and refresh the page. If you published several changes in a row, they are applied one after another and can take a few minutes.'],
                ['Can I see changes before publishing?', 'Drafts are not shown on the website. Publish, check the page with View on website, and change it again if needed.'],
                ['I deleted something by mistake.', 'Contact us — a full backup of the content is taken every week.'],
                ['A logo looks too small or is invisible.', 'Open the client and use Logo display adjustment (wider, or invert colors for white logos).'],
            ],
        },
    ],
};
