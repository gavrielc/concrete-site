import {useState, useCallback} from 'preact/hooks';
import clients from 'virtual:cms/clients';

const tags = [
    {name: 'All', value: null},
    {name: 'AI & ML', value: 'AI & ML'},
    {name: 'B2B SaaS', value: 'saas'},
    {name: 'CyberSecurity', value: 'security'},
    {name: 'Developer Tools', value: 'dev'},
    {name: 'Medtech', value: 'medtech'},
    {name: 'HR Tech', value: 'hr'}
];

export default function Clients() {
    const [value, setValue] = useState(null);
    const filter = useCallback((tag) => {
        const newValue = value == tag ? null : tag;
        setValue(newValue);
    }, [value]);

    return (
        <>
            <div className='tags'>
                {tags.map(({name, value: val}) => <button className={'tag'.concat(value == val ? ' active' : '')} onClick={() => filter(val)}>{name}</button>)}
            </div>
            <div className='logos-wrapper'>
                {clients.filter(({tags}) => !value || tags.includes(value)).map(({logo, site, name, logoClass}) => <a href={site} target="_blank" key={name}><img class={'logo'.concat(logoClass ? ` ${logoClass}` : '')} src={logo.src} alt={`${name} logo`}/></a>)}
            </div>
        </>
    );
}