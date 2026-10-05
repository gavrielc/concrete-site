import {IntentButton} from 'sanity';
import {Box, Button, Card, Container, Flex, Grid, Heading, Stack, Text} from '@sanity/ui';
import {icons} from '@sanity/icons';

// Change to https://concrete.media/ at launch.
export const SITE_URL = 'https://feature-sanity-cms--lucky-dodol-392453.netlify.app/';

const create = [
    {title: 'Add coverage article', type: 'coverage', template: 'coverage-article', icon: icons['document-text']},
    {title: 'Add podcast episode', type: 'coverage', template: 'coverage-podcast', icon: icons.microphone},
    {title: 'Add client', type: 'client', icon: icons.tags},
    {title: 'Add testimonial', type: 'testimonial', icon: icons.comment},
    {title: 'Add team member', type: 'teamMember', icon: icons.user},
    {title: 'Add open position', type: 'jobPosition', icon: icons.case},
];

const edit = [
    {title: 'Homepage', id: 'homepage', type: 'homepage'},
    {title: 'Coverage page text', id: 'page-coverage', type: 'page'},
    {title: 'Clients page text', id: 'page-clients', type: 'page'},
    {title: 'Team page text', id: 'page-team', type: 'page'},
    {title: 'Join Us page text', id: 'page-joinUs', type: 'page'},
    {title: 'Contact page text', id: 'page-contact', type: 'page'},
];

function Section({title, children}) {
    return (
        <Stack gap={3}>
            <Text size={1} weight="semibold" muted>
                {title.toUpperCase()}
            </Text>
            {children}
        </Stack>
    );
}

export function HomeTool() {
    return (
        <Box padding={[4, 5, 6]} style={{overflowY: 'auto', height: '100%'}}>
            <Container width={2}>
                <Stack gap={6}>
                    <Stack gap={4}>
                        <Heading size={3}>Concrete Media website</Heading>
                        <Text muted>
                            Edit the website content here. After you click Publish, the website updates within about a
                            minute.
                        </Text>
                        <Flex gap={2} wrap="wrap">
                            <Button as="a" href={SITE_URL} target="_blank" rel="noreferrer" text="View website" tone="primary" icon={icons.launch} />
                        </Flex>
                    </Stack>

                    <Section title="Add new">
                        <Grid gridTemplateColumns={[1, 2, 3]} gap={3}>
                            {create.map(({title, type, template, icon}) => (
                                <IntentButton
                                    key={title}
                                    intent="create"
                                    params={template ? {type, template} : {type}}
                                    text={title}
                                    icon={icon}
                                    mode="ghost"
                                    justify="flex-start"
                                    padding={4}
                                />
                            ))}
                        </Grid>
                    </Section>

                    <Section title="Edit page texts">
                        <Grid gridTemplateColumns={[1, 2, 3]} gap={3}>
                            {edit.map(({title, id, type}) => (
                                <IntentButton
                                    key={id}
                                    intent="edit"
                                    params={{id, type}}
                                    text={title}
                                    icon={icons.document}
                                    mode="ghost"
                                    justify="flex-start"
                                    padding={4}
                                />
                            ))}
                        </Grid>
                    </Section>

                    <Card padding={4} radius={2} tone="primary">
                        <Stack gap={3}>
                            <Text weight="semibold">Tips</Text>
                            <Text size={1}>• Drafts are not shown on the website until you click Publish.</Text>
                            <Text size={1}>• Clients, testimonials, team members and open positions: drag to change the order.</Text>
                            <Text size={1}>• To hide an item without deleting it, turn off "Show on website".</Text>
                        </Stack>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
}

export const homeTool = {
    name: 'home',
    title: 'Home',
    icon: icons.home,
    component: HomeTool,
};
