import {buildLegacyTheme} from 'sanity';

// Concrete Media brand colors for the Studio UI.
const brand = '#7022FB';
const black = '#1a1a1a';
const white = '#ffffff';
const gray = '#64748b';

export const theme = buildLegacyTheme({
    '--black': black,
    '--white': white,
    '--gray': gray,
    '--gray-base': gray,
    '--component-bg': white,
    '--component-text-color': black,
    '--brand-primary': brand,
    '--default-button-color': gray,
    '--default-button-primary-color': brand,
    '--default-button-success-color': '#16a34a',
    '--default-button-warning-color': '#d97706',
    '--default-button-danger-color': '#dc2626',
    '--state-info-color': brand,
    '--state-success-color': '#16a34a',
    '--state-warning-color': '#d97706',
    '--state-danger-color': '#dc2626',
    '--main-navigation-color': black,
    '--main-navigation-color--inverted': white,
    '--focus-color': brand,
});
