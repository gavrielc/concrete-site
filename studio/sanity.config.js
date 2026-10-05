import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {schemaTypes} from './schemaTypes';
import {structure} from './structure';
import {theme} from './theme';
import {Logo} from './components/Logo';
import {homeTool} from './components/HomeTool';
import {viewOnWebsiteAction} from './components/viewOnWebsite';

export default defineConfig({
    name: 'default',
    title: 'Concrete Media',
    icon: Logo,
    theme,
    projectId: 'o458gxs0',
    dataset: 'production',
    plugins: [structureTool({structure, title: 'Content'})],
    // The Home screen (quick links) opens first.
    tools: (prev) => [homeTool, ...prev],
    schema: {
        types: schemaTypes,
        templates: (templates) => [
            // Homepage and page texts are fixed documents; coverage is created as an article or a podcast.
            ...templates.filter(({schemaType}) => !['homepage', 'page', 'coverage'].includes(schemaType)),
            {id: 'coverage-article', title: 'Coverage article', schemaType: 'coverage', value: {kind: 'article'}},
            {id: 'coverage-podcast', title: 'Podcast episode', schemaType: 'coverage', value: {kind: 'podcast', categories: ['podcasts']}},
        ],
    },
    document: {
        actions: (actions, {schemaType}) => [
            ...(['homepage', 'page'].includes(schemaType)
                ? actions.filter(({action}) => !['delete', 'duplicate', 'unpublish'].includes(action))
                : actions),
            viewOnWebsiteAction,
        ],
    },
});
