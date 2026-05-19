import {useState, useEffect, useRef, useMemo} from 'preact/hooks';
import styles from './styles.module.scss';
import classNames from 'classnames/bind';
import results from './data';
import podcast from '../../assets/icons/microphone.svg';

const cn = classNames.bind(styles);
const PODCASTS_BATCH = 10;

function embedSrc(url) {
    return `${url}${url.includes('?') ? '&' : '?'}utm_source=generator&theme=0`;
}

function PodcastEmbed({url}) {
    const containerRef = useRef(null);
    const [src, setSrc] = useState(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || src) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSrc(embedSrc(url));
                    observer.disconnect();
                }
            },
            {rootMargin: '200px 0px'}
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [url, src]);

    return (
        <div ref={containerRef} className={styles.podcastEmbed}>
            {src ? (
                <iframe
                    style="border-radius:16px"
                    src={src}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowfullscreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                />
            ) : (
                <div className={styles.podcastPlaceholder} aria-hidden="true" />
            )}
        </div>
    );
}

export const tags = [
    {name: 'Highlights', value: 'highlights'},
    {name: 'AI & ML', value: 'AI & ML'},
    {name: 'B2B SaaS', value: 'saas'},
    {name: 'Developer', value: 'dev'},
    {name: 'CyberSecurity', value: 'security'},
    // {name: 'Fintech', value: 'fintech'},
    // {name: 'Medtech', value: 'medtech'},
    // {name: 'HR Tech', value: 'hr'},
    {name: 'Podcasts', value: 'podcasts', icon: podcast}
];

const visibleTags = tags.filter(({value}) => ['highlights', 'podcasts'].includes(value));

export default function Results({tag}) {
    const [value, setValue] = useState(tag || 'highlights');
    const [isEditMode, setIsEditMode] = useState(false);
    const [hiddenCards, setHiddenCards] = useState(new Set());
    const [visiblePodcastCount, setVisiblePodcastCount] = useState(PODCASTS_BATCH);
    const loadMoreRef = useRef(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        setIsEditMode(searchParams.get('edit') === 'true');
    }, []);

    useEffect(() => {
        if (value === 'podcasts') {
            setVisiblePodcastCount(PODCASTS_BATCH);
        }
    }, [value]);

    const filteredResults = useMemo(
        () => results
            .filter(({tags}) => !value || tags.includes(value))
            .filter(({url}) => !hiddenCards.has(url)),
        [value, hiddenCards]
    );

    const paginatePodcasts = value === 'podcasts' && !isEditMode;
    const displayedResults = useMemo(
        () => paginatePodcasts
            ? filteredResults.slice(0, visiblePodcastCount)
            : filteredResults,
        [filteredResults, paginatePodcasts, visiblePodcastCount]
    );

    const hasMorePodcasts = paginatePodcasts && visiblePodcastCount < filteredResults.length;

    useEffect(() => {
        if (!hasMorePodcasts) return;

        const el = loadMoreRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisiblePodcastCount((count) =>
                        Math.min(count + PODCASTS_BATCH, filteredResults.length)
                    );
                }
            },
            {rootMargin: '400px 0px'}
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMorePodcasts, filteredResults.length, visiblePodcastCount]);

    const hideCard = (url) => {
        setHiddenCards(prev => new Set([...prev, url]));
    };

    return (
        <>
            <div className={styles.tags}>
                {visibleTags.map(({name, value: val, icon}) => (
                    <button
                        key={val}
                        type="button"
                        className={cn('tag', {active: value == val})}
                        onClick={() => setValue(val)}
                    >
                        {icon ? <img class="social-icon" src={podcast.src} alt="podcast mic icon" /> : null}
                        {name}
                    </button>
                ))}
            </div>
            <div className={cn(styles.resultsWrapper, {[styles.editMode]: isEditMode})}>
                {displayedResults.map(({url, logo, headline, publication, date, tags, embed = true}) => {
                    const isEmbeddedPodcast = tags.includes('podcasts') && embed !== false;
                    const isExternalPodcast = tags.includes('podcasts') && embed === false;

                    return (
                        <li
                            className={cn('result-card', {podcast: isEmbeddedPodcast, externalPodcast: isExternalPodcast})}
                            key={url}
                        >
                            {isEditMode && (
                                <button type="button" className={styles.deleteButton} onClick={() => hideCard(url)}>
                                    ×
                                </button>
                            )}
                            {isEmbeddedPodcast ? (
                                <PodcastEmbed url={url} />
                            ) : (
                                <a href={url} target="_blank" rel="noreferrer">
                                    {logo && <img src={logo.src} alt={`${publication} logo`} />}
                                    <h4>{headline}</h4>
                                    <p>{date}</p>
                                </a>
                            )}
                        </li>
                    );
                })}
                {hasMorePodcasts && (
                    <li ref={loadMoreRef} className={styles.loadMoreSentinel} aria-hidden="true" />
                )}
            </div>
        </>
    );
}
