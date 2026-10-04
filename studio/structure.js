import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list';
import {icons} from '@sanity/icons';

const {
    users: UsersIcon,
    tags: TagsIcon,
    'document-text': DocumentTextIcon,
    book: BookIcon,
    case: CaseIcon,
    home: HomeIcon,
    comment: CommentIcon,
    document: PageIcon,
    envelope: EnvelopeIcon,
} = icons;

// Fixed "page" documents, one per website page (see schemaTypes/page.js).
const pageText = (S, id, title, icon = PageIcon) =>
    S.listItem()
        .id(id)
        .title(title)
        .icon(icon)
        .child(S.document().schemaType('page').documentId(id).title(title));

export const structure = (S, context) =>
    S.list()
        .title('Content')
        // Grouped by website page: Homepage | Coverage | Clients | Team & Join Us | Contact.
        .items([
            pageText(S, 'page-home', 'Homepage SEO', HomeIcon),
            S.listItem()
                .title('Homepage logos')
                .icon(HomeIcon)
                .child(S.document().schemaType('homepage').documentId('homepage').title('Homepage')),
            S.listItem()
                .title('Homepage coverage')
                .icon(HomeIcon)
                .child(
                    // The homepage shows the 4 newest of these, so the top 4 of this list are live.
                    S.documentList()
                        .title('On homepage (top 4 are shown)')
                        .schemaType('coverage')
                        .filter('_type == "coverage" && showOnHomepage == true')
                        .defaultOrdering([{field: 'date', direction: 'desc'}])
                ),
            S.divider(),
            pageText(S, 'page-coverage', 'Coverage page text'),
            S.listItem()
                .title('Coverage (Results)')
                .icon(DocumentTextIcon)
                .child(
                    S.documentTypeList('coverage')
                        .title('Coverage (Results)')
                        .defaultOrdering([{field: 'date', direction: 'desc'}])
                ),
            S.listItem()
                .title('Publications')
                .icon(BookIcon)
                .child(
                    S.documentTypeList('publication')
                        .title('Publications')
                        .defaultOrdering([{field: 'name', direction: 'asc'}])
                ),
            S.divider(),
            pageText(S, 'page-clients', 'Clients page text'),
            orderableDocumentListDeskItem({type: 'client', title: 'Clients', icon: TagsIcon, S, context}),
            orderableDocumentListDeskItem({type: 'testimonial', title: 'Testimonials', icon: CommentIcon, S, context}),
            S.divider(),
            pageText(S, 'page-team', 'Team page text'),
            orderableDocumentListDeskItem({type: 'teamMember', title: 'Team', icon: UsersIcon, S, context}),
            pageText(S, 'page-joinUs', 'Join Us page text'),
            orderableDocumentListDeskItem({type: 'jobPosition', title: 'Open positions', icon: CaseIcon, S, context}),
            S.divider(),
            pageText(S, 'page-contact', 'Contact page text', EnvelopeIcon),
        ]);
