import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list';
import {BookOpen, Briefcase, Building2, FileText, House, Mail, MessageSquareQuote, Mic, Newspaper, UserRound, Users} from 'lucide-react';

// Fixed "page" documents, one per website page (see schemaTypes/page.js).
const pageText = (S, id, title = 'Page text', icon = FileText) =>
    S.listItem()
        .id(id)
        .title(title)
        .icon(icon)
        .child(S.document().schemaType('page').documentId(id).title(title));

// Coverage split by type; "+" creates the matching type.
const coverageList = (S, id, title, icon, kind) =>
    S.listItem()
        .id(id)
        .title(title)
        .icon(icon)
        .child(
            S.documentList()
                .id(id)
                .title(title)
                .schemaType('coverage')
                .filter('_type == "coverage" && kind == $kind')
                .params({kind})
                .defaultOrdering([{field: 'date', direction: 'desc'}])
                .initialValueTemplates([S.initialValueTemplateItem(`coverage-${kind}`)])
        );

// A folder per website page, holding its page text and its lists.
const pageFolder = (S, id, title, icon, items) =>
    S.listItem().id(id).title(title).icon(icon).child(S.list().id(id).title(title).items(items));

// Same order as the website's main menu: Home, Clients, Team, Coverage, Join Us, Contact.
export const structure = (S, context) =>
    S.list()
        .title('Content')
        .items([
            S.listItem()
                .id('homepage')
                .title('Homepage')
                .icon(House)
                .child(S.document().schemaType('homepage').documentId('homepage').title('Homepage')),
            pageFolder(S, 'clients-page', 'Clients page', Building2, [
                pageText(S, 'page-clients'),
                orderableDocumentListDeskItem({type: 'client', title: 'Clients', icon: Building2, S, context}),
                orderableDocumentListDeskItem({type: 'testimonial', title: 'Testimonials', icon: MessageSquareQuote, S, context}),
            ]),
            pageFolder(S, 'team-page', 'Team page', Users, [
                pageText(S, 'page-team'),
                orderableDocumentListDeskItem({type: 'teamMember', title: 'Team', icon: UserRound, S, context}),
            ]),
            pageFolder(S, 'coverage-page', 'Coverage page', Newspaper, [
                pageText(S, 'page-coverage'),
                coverageList(S, 'articles', 'Articles', Newspaper, 'article'),
                coverageList(S, 'podcasts', 'Podcasts', Mic, 'podcast'),
                S.listItem()
                    .id('publications')
                    .title('Publications')
                    .icon(BookOpen)
                    .child(
                        S.documentTypeList('publication')
                            .title('Publications')
                            .defaultOrdering([{field: 'name', direction: 'asc'}])
                    ),
            ]),
            pageFolder(S, 'join-us-page', 'Join Us page', Briefcase, [
                pageText(S, 'page-joinUs'),
                orderableDocumentListDeskItem({type: 'jobPosition', title: 'Open positions', icon: Briefcase, S, context}),
            ]),
            pageText(S, 'page-contact', 'Contact page', Mail),
        ]);
