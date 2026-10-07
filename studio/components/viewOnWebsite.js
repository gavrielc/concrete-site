import {ExternalLink} from 'lucide-react';
import {SITE_URL} from '../siteUrl';

const PAGE_PATHS = {
    'page-clients': 'clients/',
    'page-team': 'team/',
    'page-coverage': 'results/',
    'page-joinUs': 'join-us/',
    'page-contact': 'contact/',
};

// Where each kind of content appears on the website.
function pathFor(type, doc) {
    switch (type) {
        case 'homepage':
            return '';
        case 'page':
            return PAGE_PATHS[doc?._id?.replace(/^drafts./, '')] ?? '';
        case 'client':
        case 'testimonial':
            return 'clients/';
        case 'teamMember':
            return 'team/';
        case 'jobPosition':
            return 'join-us/';
        case 'coverage':
            return doc?.kind === 'podcast' || doc?.categories?.includes('podcasts') ? 'results/podcasts/' : 'results/';
        case 'publication':
            return 'results/';
        default:
            return undefined;
    }
}

// Document action that opens the page where this item is shown (published version).
export function viewOnWebsiteAction(props) {
    const path = pathFor(props.type, props.published || props.draft);
    if (path === undefined) return null;
    return {
        label: 'View on website',
        icon: ExternalLink,
        title: props.published ? 'Open the page where this appears' : 'Publish first to see it on the website',
        onHandle: () => {
            window.open(SITE_URL + path, '_blank', 'noopener');
            props.onComplete();
        },
    };
}
