import {CircleHelp} from 'lucide-react';
import '@fontsource/outfit/600.css';
import {guide} from '../help/guide';
import {guideCss, renderGuideHtml} from '../help/render';

const images = import.meta.glob('../static/help/*.jpg', {eager: true, import: 'default'});
const imageSrc = (name) => images[`../static/help/${name}`];

const html = renderGuideHtml(guide, imageSrc);

// "Help" screen in the Studio's top bar: the editor guide.
export function HelpTool() {
    return (
        <div style={{background: '#f4f2f9', height: '100%', overflowY: 'auto', padding: '28px 32px 48px', boxSizing: 'border-box'}}>
            <style>{guideCss}</style>
            <div
                style={{maxWidth: 860, margin: '0 auto'}}
                onClick={(e) => {
                    // Table-of-contents links scroll inside this pane instead of changing the Studio URL.
                    const link = e.target.closest('a[href^="#cmg-"]');
                    if (!link) return;
                    e.preventDefault();
                    document.getElementById(link.getAttribute('href').slice(1))?.scrollIntoView({behavior: 'smooth', block: 'start'});
                }}
                dangerouslySetInnerHTML={{__html: html}}
            />
        </div>
    );
}

export const helpTool = {
    name: 'help',
    title: 'Help',
    icon: CircleHelp,
    component: HelpTool,
};
