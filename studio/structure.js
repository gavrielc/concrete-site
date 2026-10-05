import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list';
import {BookOpen, Briefcase, Building2, FileText, House, Mail, MessageSquareQuote, Newspaper, Users} from 'lucide-react';

// Fixed "page" documents, one per website page (see schemaTypes/page.js).
const pageText = (S, id, title, icon = FileText) =>
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
            S.listItem()
                .title('Homepage')
                .icon(House)
                .child(S.document().schemaType('homepage').documentId('homepage').title('Homepage')),
            S.divider(),
            pageText(S, 'page-coverage', 'Coverage page text'),
            S.listItem()
                .title('Coverage (Results)')
                .icon(Newspaper)
                .child(
                    S.documentTypeList('coverage')
                        .title('Coverage (Results)')
                        .defaultOrdering([{field: 'date', direction: 'desc'}])
                ),
            S.listItem()
                .title('Publications')
                .icon(BookOpen)
                .child(
                    S.documentTypeList('publication')
                        .title('Publications')
                        .defaultOrdering([{field: 'name', direction: 'asc'}])
                ),
            S.divider(),
            pageText(S, 'page-clients', 'Clients page text'),
            orderableDocumentListDeskItem({type: 'client', title: 'Clients', icon: Building2, S, context}),
            orderableDocumentListDeskItem({type: 'testimonial', title: 'Testimonials', icon: MessageSquareQuote, S, context}),
            S.divider(),
            pageText(S, 'page-team', 'Team page text'),
            orderableDocumentListDeskItem({type: 'teamMember', title: 'Team', icon: Users, S, context}),
            pageText(S, 'page-joinUs', 'Join Us page text'),
            orderableDocumentListDeskItem({type: 'jobPosition', title: 'Open positions', icon: Briefcase, S, context}),
            S.divider(),
            pageText(S, 'page-contact', 'Contact page text', Mail),
        ]);
