import {useState} from 'preact/hooks';
import styles from './styles.module.scss';
import classNames from 'classnames/bind';
import results from './results';

const cn = classNames.bind(styles);

const tags = [
    {name: 'Highlights', value: 'highlights'},
    {name: 'Developer Tools', value: 'dev'},
    {name: 'CyberSecurity', value: 'security'},
    {name: 'AI & ML', value: 'AI & ML'},
    {name: 'Medtech', value: 'medtech'},
    {name: 'B2B SaaS', value: 'saas'},
    {name: 'HR Tech', value: 'hr'},
    {name: 'Fintech', value: 'fintech'}
];

export default function Results() {
    const [value, setValue] = useState('highlights');

    return (
        <>
            <div className={styles.tags}>
                {tags.map(({name, value: val}) => <button className={cn('tag', {active: value == val})} onClick={() => setValue(val)}>{name}</button>)}
            </div>
            <div className={styles.resultsWrapper}>
                {results.filter(({tags}) => !value || tags.includes(value)).map(({articleUrl, logo, headline, publication, date}) => (
                <li className={styles["result-card"]}>
                    <a href={articleUrl} target="_blank">
                        <img src={logo} alt={`${publication} logo`}/>
                        <h4>{headline}</h4>
                        <p>{date}</p>
                    </a>
                </li>
))}
            </div>
        </>
    );
}