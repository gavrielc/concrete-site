import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {schemaTypes} from './schemaTypes';
import {structure} from './structure';

export default defineConfig({
    name: 'default',
    title: 'Concrete Media',
    projectId: 'o458gxs0',
    dataset: 'production',
    plugins: [structureTool({structure})],
    schema: {types: schemaTypes},
});
