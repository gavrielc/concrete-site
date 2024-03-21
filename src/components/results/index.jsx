import {useState} from 'preact/hooks';
import styles from './styles.module.scss';
import classNames from 'classnames/bind';
import results from './results';
import podcast from '../../assets/icons/microphone.svg';

const cn = classNames.bind(styles);

export const tags = [
    {name: 'Highlights', value: 'highlights'},
    {name: 'AI & ML', value: 'AI & ML'},
    {name: 'B2B SaaS', value: 'saas'},
    {name: 'Developer', value: 'dev'},
    {name: 'CyberSecurity', value: 'security'},
    {name: 'Fintech', value: 'fintech'},
    {name: 'Medtech', value: 'medtech'},
    {name: 'HR Tech', value: 'hr'},
    {name: 'Podcasts', value: 'podcasts', icon: podcast}
];

export default function Results({tag}) {
    const [value, setValue] = useState(tag || 'highlights');

    return (
        <>
            <div className={styles.tags}>
                {tags.map(({name, value: val, icon}) => <button className={cn('tag', {active: value == val})} onClick={() => setValue(val)}>{icon ? <img class='social-icon' src={podcast.src} alt="podcast mic icon"></img> : null}{name}</button>)}
            </div>
            <div className={styles.resultsWrapper}>
                {results.filter(({tags}) => !value || tags.includes(value)).map(({articleUrl, logo, headline, publication, date, url, tags}) => (
                <li className={cn("result-card", {podcast: tags.includes('podcasts')})} key={articleUrl}>
                    {
                        tags.includes('podcasts')
                        ? <iframe style="border-radius:16px" src={`${url}?utm_source=generator&theme=0`} width="100%" height="158" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                        : (
                            <a href={articleUrl} target="_blank">
                                <img src={logo.src} alt={`${publication} logo`}/>
                                <h4>{headline}</h4>
                                <p>{date}</p>
                            </a>
                        )
                    }
                </li>
                ))}
            </div>
        </>
    );
}