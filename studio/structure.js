import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list';
import {BookOpen, Briefcase, Building2, FileText, House, Mail, MessageSquareQuote, Newspaper, Star, Users} from 'lucide-react';
import {ClientsGallery, TestimonialsGallery} from './components/Gallery';

// Fixed "page" documents, one per website page (see schemaTypes/page.js).
const pageText = (S, id, title, icon = FileText) =>
    S.listItem()
        .id(id)
        .title(title)
        .icon(icon)
        .child(S.document().schemaType('page').documentId(id).title(title));

// Card gallery panes (drag to reorder); opening a card shows the document next to it.
const gallery = (S, id, title, icon, component, type) =>
    S.listItem()
        .id(id)
        .title(title)
        .icon(icon)
        .child(S.component(component).id(id).title(title).child((docId) => S.document().schemaType(type).documentId(docId)));

export const structure = (S, context) =>
    S.list()
        .title('Content')
        // Grouped by website page: Homepage | Coverage | Clients | Team & Join Us | Contact.
        .items([
            S.listItem()
                .title('Homepage')
                .icon(House)
                .child(S.document().schemaType('homepage').documentId('homepage').title('Homepage')),
            S.listItem()
                .title('Homepage coverage')
                .icon(Star)
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
            gallery(S, 'orderable-client', 'Clients', Building2, ClientsGallery, 'client'),
            gallery(S, 'orderable-testimonial', 'Testimonials', MessageSquareQuote, TestimonialsGallery, 'testimonial'),
            S.divider(),
            pageText(S, 'page-team', 'Team page text'),
            orderableDocumentListDeskItem({type: 'teamMember', title: 'Team', icon: Users, S, context}),
            pageText(S, 'page-joinUs', 'Join Us page text'),
            orderableDocumentListDeskItem({type: 'jobPosition', title: 'Open positions', icon: Briefcase, S, context}),
            S.divider(),
            pageText(S, 'page-contact', 'Contact page text', Mail),
        ]);
