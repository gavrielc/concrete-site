import {useState, useEffect, useRef, useMemo} from 'preact/hooks';
import styles from './styles.module.scss';
import classNames from 'classnames/bind';
import results from './data';
import podcast from '../../assets/icons/microphone.svg';

const cn = classNames.bind(styles);
const PODCASTS_BATCH = 10;

function formatPodcastDate(date) {
    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    }).toUpperCase();
}

function formatPodcastDuration(duration) {
    if (!duration) return null;

    return duration
        .toUpperCase()
        .replace(/\bH\b/g, 'HR')
        .replace(/\bM\b/g, 'MIN');
}

function PodcastCard({title, show, date, duration, href, artwork, artworkIsLogo}) {
    const details = [
        date ? formatPodcastDate(date) : null,
        formatPodcastDuration(duration),
    ].filter(Boolean);

    return (
        <div className={styles.podcastCardSurface}>
            <a className={styles.podcastCardMain} href={href} target="_blank" rel="noreferrer">
                <div className={styles.podcastCardHeader}>
                    <span className={styles.podcastCardLabel}>
                        <span className={styles.applePodcastLogo} aria-hidden="true"></span>
                        Podcasts
                    </span>
                </div>
                <div className={styles.podcastCardBody}>
                    <div className={styles.podcastArtworkWrap}>
                        {artwork ? (
                            <img
                                className={cn('podcastArtwork', {podcastLogoArtwork: artworkIsLogo})}
                                src={artwork}
                                alt={`${show} artwork`}
                                loading="lazy"
                            />
                        ) : (
                            <img className={styles.podcastArtworkFallback} src={podcast.src} alt="" aria-hidden="true" />
                        )}
                    </div>
                    <div className={styles.podcastCardCopy}>
                        <span className={styles.podcastMeta}>{details.join(' · ')}</span>
                        <h4>{title}</h4>
                        <p>{show}</p>
                    </div>
                </div>
            </a>
            <div className={styles.podcastActions}>
                <a href={href} target="_blank" rel="noreferrer" className={styles.podcastPlay}>
                    <span aria-hidden="true">▶</span>
                    Play
                </a>
                <a href={href} target="_blank" rel="noreferrer" className={styles.podcastMore}>
                    See More ↗
                </a>
            </div>
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
                {displayedResults.map(({
                    url,
                    logo,
                    headline,
                    publication,
                    date,
                    tags,
                    embed = true,
                    podcastTitle,
                    podcastShow,
                    podcastDate,
                    podcastDuration,
                    podcastHref,
                    podcastArtwork,
                }) => {
                    const isExternalPodcast = tags.includes('podcasts') && embed === false;
                    const isPodcast = tags.includes('podcasts');

                    return (
                        <li
                            className={cn('result-card', {
                                podcastCard: isPodcast && !isExternalPodcast,
                            })}
                            key={url}
                        >
                            {isEditMode && (
                                <button type="button" className={styles.deleteButton} onClick={() => hideCard(url)}>
                                    ×
                                </button>
                            )}
                            {isExternalPodcast ? (
                                <a href={url} target="_blank" rel="noreferrer">
                                    {logo && <img className={cn({
                                        techtargetLogo: publication === 'TechTarget',
                                        tldrLogo: publication.startsWith('TLDR')
                                    })} src={logo.src} alt={`${publication} logo`} />}
                                    <h4>{headline}</h4>
                                    <p>{date}</p>
                                </a>
                            ) : isPodcast ? (
                                <PodcastCard
                                    title={podcastTitle || headline}
                                    show={podcastShow || publication}
                                    date={podcastDate || date}
                                    duration={podcastDuration}
                                    href={podcastHref || url}
                                    artwork={podcastArtwork}
                                    artworkIsLogo={false}
                                />
                            ) : (
                                <a href={url} target="_blank" rel="noreferrer">
                                    {logo && <img className={cn({
                                        techtargetLogo: publication === 'TechTarget',
                                        tldrLogo: publication.startsWith('TLDR')
                                    })} src={logo.src} alt={`${publication} logo`} />}
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
