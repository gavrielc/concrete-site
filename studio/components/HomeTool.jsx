import {useEffect, useMemo, useState} from 'react';
import {useClient, useCurrentUser} from 'sanity';
import {IntentLink, useRouter} from 'sanity/router';
import {
    AlertCircle,
    ArrowUpRight,
    Briefcase,
    Building2,
    ExternalLink,
    FilePen,
    House,
    MessageSquareQuote,
    Mic,
    Newspaper,
    Plus,
    Sparkles,
    Users,
} from 'lucide-react';
import '@fontsource/outfit/600.css';
import styles from './home.module.css';

// Change to https://concrete.media/ at launch.
export const SITE_URL = 'https://feature-sanity-cms--lucky-dodol-392453.netlify.app/';

const CATEGORIES = [
    {value: 'highlights', label: 'Highlights'},
    {value: 'AI & ML', label: 'AI & ML'},
    {value: 'saas', label: 'SaaS'},
    {value: 'dev', label: 'Dev'},
    {value: 'security', label: 'Security'},
    {value: 'podcasts', label: 'Podcasts'},
];

const QUERY = `{
    "counts": {
        "articles": count(*[_type == "coverage" && kind == "article"]),
        "podcasts": count(*[_type == "coverage" && kind == "podcast"]),
        "clients": count(*[_type == "client"]),
        "testimonials": count(*[_type == "testimonial" && isVisible != false]),
        "team": count(*[_type == "teamMember"]),
        "positions": count(*[_type == "jobPosition" && isOpen != false])
    },
    "dates": *[_type == "coverage" && defined(date)]{kind, date},
    "categories": {${CATEGORIES.map((c, i) => `"c${i}": count(*[_type == "coverage" && "${c.value}" in categories])`).join(', ')}},
    "homepage": *[_id == "homepage"][0].coverageItems[]->{
        _id, headline, date, "publication": publication->name
    },
    "latest": *[_type == "coverage" && defined(date)] | order(date desc, _createdAt desc)[0...5]{
        _id, kind, date, "title": coalesce(headline, title, "(untitled)"),
        "source": coalesce(publication->name, show),
        "image": coalesce(publication->logo.asset->url, artwork.asset->url)
    },
    "team": *[_type == "teamMember"] | order(orderRank)[0...4]{_id, name, title, "photo": photo.asset->url},
    "positions": *[_type == "jobPosition" && isOpen != false] | order(orderRank){_id, title, location},
    "untitled": count(*[_type == "coverage" && kind == "podcast" && !defined(title)]),
    "noArtwork": count(*[_type == "coverage" && kind == "podcast" && !defined(artwork)])
}`;

const formatDate = (iso) =>
    iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '';

function greeting() {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

// Last 12 months of coverage, split into articles and podcasts.
function monthlySeries(dates) {
    const now = new Date();
    const months = Array.from({length: 12}, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        return {
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('en-US', {month: 'short'}),
            articles: 0,
            podcasts: 0,
        };
    });
    const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
    for (const {kind, date} of dates) {
        const month = byKey[date.slice(0, 7)];
        if (month) month[kind === 'podcast' ? 'podcasts' : 'articles']++;
    }
    return months;
}

function LineChart({months}) {
    const w = 320, h = 150, pad = {l: 26, r: 6, t: 10, b: 22};
    const max = Math.max(4, ...months.map((m) => Math.max(m.articles, m.podcasts)));
    const x = (i) => pad.l + (i * (w - pad.l - pad.r)) / (months.length - 1);
    const y = (v) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
    const path = (key) => months.map((m, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(m[key]).toFixed(1)}`).join(' ');
    const area = `${path('articles')} L${x(months.length - 1)},${h - pad.b} L${x(0)},${h - pad.b} Z`;
    const ticks = [0, Math.round(max / 2), max];
    return (
        <svg className={styles.chart} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Coverage per month">
            <defs>
                <linearGradient id="cm-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7022FB" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#7022FB" stopOpacity="0" />
                </linearGradient>
            </defs>
            {ticks.map((t) => (
                <g key={t}>
                    <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="#eef0f4" />
                    <text className={styles.axis} x={0} y={y(t) + 4}>{t}</text>
                </g>
            ))}
            <path d={area} fill="url(#cm-area)" />
            <path d={path('podcasts')} fill="none" stroke="#c9b2fd" strokeWidth="2" strokeLinejoin="round" />
            <path d={path('articles')} fill="none" stroke="#7022FB" strokeWidth="2.5" strokeLinejoin="round" />
            {months.map((m, i) =>
                i % 2 === 1 ? (
                    <text key={m.key} className={styles.axis} x={x(i)} y={h - 4} textAnchor="middle">{m.label}</text>
                ) : null
            )}
        </svg>
    );
}

function BarChart({data}) {
    const w = 460, h = 210, pad = {l: 30, r: 6, t: 16, b: 26};
    const max = Math.max(1, ...data.map((d) => d.count));
    const top = data.reduce((a, b) => (b.count > a.count ? b : a), data[0]);
    const slot = (w - pad.l - pad.r) / data.length;
    const bw = Math.min(54, slot * 0.62);
    const y = (v) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
    const avg = data.reduce((s, d) => s + d.count, 0) / data.length;
    return (
        <svg className={styles.chart} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Coverage by category">
            <defs>
                <linearGradient id="cm-bar" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7022FB" />
                    <stop offset="100%" stopColor="#b58cfd" />
                </linearGradient>
            </defs>
            {[0, Math.round(max / 2), max].map((t) => (
                <text key={t} className={styles.axis} x={0} y={y(t) + 4}>{t}</text>
            ))}
            <line x1={pad.l} x2={w - pad.r} y1={y(avg)} y2={y(avg)} stroke="#7022FB" strokeDasharray="5 5" opacity="0.6" />
            {data.map((d, i) => {
                const bx = pad.l + i * slot + (slot - bw) / 2;
                const isTop = d === top;
                return (
                    <g key={d.label}>
                        <rect x={bx} y={y(d.count)} width={bw} height={h - pad.b - y(d.count)} rx="10" fill={isTop ? 'url(#cm-bar)' : '#f1eaff'} stroke={isTop ? 'none' : '#e4d7fe'} />
                        <text className={styles.axis} x={bx + bw / 2} y={y(d.count) - 6} textAnchor="middle" style={{fontWeight: 600, fill: isTop ? '#7022FB' : undefined}}>{d.count}</text>
                        <text className={styles.axis} x={bx + bw / 2} y={h - 6} textAnchor="middle">{d.label}</text>
                    </g>
                );
            })}
        </svg>
    );
}

// Opens a Structure list by its pane path (e.g. "coverage-page;coverageResults").
function useOpenList() {
    const router = useRouter();
    return (paneId) => {
        // This tool lives at ".../home"; the Content (structure) tool is its sibling ".../structure".
        const base = window.location.pathname.replace(/\/home\/?$/, '');
        router.navigateUrl({path: `${base}/structure/${paneId}`});
    };
}

export function HomeTool() {
    const client = useClient({apiVersion: '2025-02-19'});
    const user = useCurrentUser();
    const openList = useOpenList();
    const [data, setData] = useState(null);
    const [drafts, setDrafts] = useState(0);
    const [slide, setSlide] = useState(0);

    useEffect(() => {
        let active = true;
        client.fetch(QUERY, {}, {perspective: 'published'}).then((result) => active && setData(result));
        client
            .fetch('count(*[_id in path("drafts.**")])', {}, {perspective: 'raw'})
            .then((count) => active && setDrafts(count));
        return () => {
            active = false;
        };
    }, [client]);

    const months = useMemo(() => (data ? monthlySeries(data.dates) : []), [data]);
    const categories = useMemo(
        () => (data ? CATEGORIES.map((c, i) => ({label: c.label, count: data.categories[`c${i}`]})) : []),
        [data]
    );

    useEffect(() => {
        if (!data?.homepage?.length) return undefined;
        const timer = setInterval(() => setSlide((s) => (s + 1) % data.homepage.length), 6000);
        return () => clearInterval(timer);
    }, [data]);

    if (!data) return <div className={`${styles.page} ${styles.loading}`}>Loading…</div>;

    const firstName = user?.name?.split(' ')[0] || 'there';
    const yearCount = data.dates.filter((d) => d.date.startsWith(String(new Date().getFullYear()))).length;
    const featured = data.homepage[slide] || data.homepage[0];
    const attention = [
        {label: 'Unpublished drafts', count: drafts, hint: 'Open them and click Publish to show them on the website.'},
        {label: 'Podcasts without a title', count: data.untitled, hint: 'Shown as empty cards on the Podcasts tab.'},
        {label: 'Podcasts without artwork', count: data.noArtwork, hint: 'Shown with a microphone placeholder.'},
    ];
    const totals = [
        {label: 'Articles', count: data.counts.articles, icon: Newspaper, pane: 'coverage-page;coverageResults'},
        {label: 'Podcasts', count: data.counts.podcasts, icon: Mic, pane: 'coverage-page;coverageResults'},
        {label: 'Clients', count: data.counts.clients, icon: Building2, pane: 'clients-page;orderable-client'},
        {label: 'Testimonials', count: data.counts.testimonials, icon: MessageSquareQuote, pane: 'clients-page;orderable-testimonial'},
    ];

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.greeting}>
                            {greeting()}, <span>{firstName}!</span>
                        </h1>
                        <p className={styles.sub}>
                            Edit the website content here. After you click Publish, the website updates within about a minute.
                        </p>
                    </div>
                    <a className={styles.primary} href={SITE_URL} target="_blank" rel="noreferrer">
                        <ExternalLink size={18} /> View website
                    </a>
                </div>

                {/* Same order as the website menu: Home, Clients, Team, Coverage, Join Us */}
                <div className={styles.toolbar}>
                    <IntentLink className={styles.pill} intent="edit" params={{id: 'homepage', type: 'homepage'}}>
                        <House size={16} /> Edit homepage
                    </IntentLink>
                    <span className={styles.toolbarLabel}>
                        <Plus size={14} /> Add:
                    </span>
                    <IntentLink className={styles.pill} intent="create" params={{type: 'client'}}>
                        <Building2 size={16} /> Client
                    </IntentLink>
                    <IntentLink className={styles.pill} intent="create" params={{type: 'testimonial'}}>
                        <MessageSquareQuote size={16} /> Testimonial
                    </IntentLink>
                    <IntentLink className={styles.pill} intent="create" params={{type: 'teamMember'}}>
                        <Users size={16} /> Team member
                    </IntentLink>
                    <IntentLink className={styles.pill} intent="create" params={{type: 'coverage', template: 'coverage-article'}}>
                        <Newspaper size={16} /> Coverage article
                    </IntentLink>
                    <IntentLink className={styles.pill} intent="create" params={{type: 'coverage', template: 'coverage-podcast'}}>
                        <Mic size={16} /> Podcast
                    </IntentLink>
                    <IntentLink className={styles.pill} intent="create" params={{type: 'jobPosition'}}>
                        <Briefcase size={16} /> Open position
                    </IntentLink>
                </div>

                <div className={styles.grid}>
                    {/* Coverage per month */}
                    <div className={`${styles.card} ${styles.span3}`}>
                        <div className={styles.cardHead}>
                            <h2 className={styles.cardTitle}>Coverage per month</h2>
                            <button type="button" className={styles.ghost} onClick={() => openList('coverage-page;coverageResults')}>All</button>
                        </div>
                        <div style={{display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap'}}>
                            <span className={`${styles.badge} ${styles.badgeDark}`}>{yearCount} this year</span>
                            <span className={styles.badge}>● Articles</span>
                            <span className={styles.badge} style={{color: '#a47dfc'}}>● Podcasts</span>
                        </div>
                        <LineChart months={months} />
                    </div>

                    {/* On the homepage now */}
                    <div className={`${styles.card} ${styles.feature} ${styles.span3}`}>
                        <div className={styles.cardHead}>
                            <div className={styles.featureIcon}><Newspaper size={20} /></div>
                            <span className={styles.featureTag}>On the homepage</span>
                        </div>
                        {featured ? (
                            <IntentLink className={styles.featureLink} intent="edit" params={{id: featured._id, type: 'coverage'}}>
                                <h2 className={styles.cardTitle}>{featured.headline}</h2>
                                <p className={styles.featureText}>{featured.publication} · {formatDate(featured.date)}</p>
                            </IntentLink>
                        ) : (
                            <p className={styles.featureText}>No coverage cards are chosen under Homepage → Coverage.</p>
                        )}
                        <div className={styles.dots}>
                            {data.homepage.map((item, i) => (
                                <button
                                    key={item._id}
                                    type="button"
                                    aria-label={`Show item ${i + 1}`}
                                    className={`${styles.dot} ${i === slide ? styles.dotActive : ''}`}
                                    onClick={() => setSlide(i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className={`${styles.card} ${styles.span3}`}>
                        <div className={styles.cardHead}>
                            <h2 className={styles.cardTitle}>On the website</h2>
                            <Sparkles size={18} color="#7022FB" />
                        </div>
                        <div className={styles.stats}>
                            {totals.map(({label, count, icon: Icon, pane}) => (
                                <button key={label} type="button" className={styles.stat} onClick={() => openList(pane)}>
                                    <div className={styles.statTop}><Icon size={18} /><ArrowUpRight size={14} /></div>
                                    <div className={styles.statNum}>{count}</div>
                                    <div className={styles.statLabel}>{label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Needs attention */}
                    <div className={`${styles.card} ${styles.span3}`}>
                        <div className={styles.cardHead}>
                            <h2 className={styles.cardTitle}>Needs attention</h2>
                            <AlertCircle size={18} color="#7022FB" />
                        </div>
                        <div className={styles.list}>
                            {attention.map(({label, count, hint}) => (
                                <div key={label} className={`${styles.row} ${styles.rowBlock}`}>
                                    <div className={styles.rowLine}>
                                        <span className={styles.rowTitle}>{label}</span>
                                        <span className={count ? `${styles.badge} ${styles.badgeDark}` : styles.badge}>{count}</span>
                                    </div>
                                    <div className={styles.rowSub}>{count ? hint : 'All good'}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Latest coverage */}
                    <div className={`${styles.card} ${styles.span4}`}>
                        <div className={styles.cardHead}>
                            <h2 className={styles.cardTitle}>Latest coverage</h2>
                            <button type="button" className={styles.ghost} onClick={() => openList('coverage-page;coverageResults')}>See all</button>
                        </div>
                        <div className={styles.list}>
                            {data.latest.map((item) => (
                                <IntentLink key={item._id} className={styles.row} intent="edit" params={{id: item._id, type: 'coverage'}}>
                                    <div className={styles.thumb}>
                                        {item.image ? (
                                            <img src={`${item.image}?w=96&h=96&fit=max`} alt="" />
                                        ) : item.kind === 'podcast' ? (
                                            <Mic size={18} />
                                        ) : (
                                            <Newspaper size={18} />
                                        )}
                                    </div>
                                    <div className={styles.rowText}>
                                        <div className={styles.rowTitle}>{item.title}</div>
                                        <div className={styles.rowSub}>{[item.source, formatDate(item.date)].filter(Boolean).join(' · ')}</div>
                                    </div>
                                </IntentLink>
                            ))}
                        </div>
                    </div>

                    {/* Coverage by category */}
                    <div className={`${styles.card} ${styles.span5}`}>
                        <div className={styles.cardHead}>
                            <h2 className={styles.cardTitle}>Coverage by category</h2>
                            <span className={styles.muted}>- - average</span>
                        </div>
                        <BarChart data={categories} />
                    </div>

                    {/* Team & open positions */}
                    <div className={`${styles.card} ${styles.span3}`}>
                        <div className={styles.cardHead}>
                            <h2 className={styles.cardTitle}>Team</h2>
                            <button type="button" className={styles.ghost} onClick={() => openList('team-page;orderable-teamMember')}>
                                See all {data.counts.team}
                            </button>
                        </div>
                        <div className={styles.list}>
                            {data.team.map((member) => (
                                <IntentLink key={member._id} className={styles.row} intent="edit" params={{id: member._id, type: 'teamMember'}}>
                                    <div className={`${styles.thumb} ${styles.avatar}`}>
                                        {member.photo ? <img src={`${member.photo}?w=96&h=96&fit=crop`} alt="" /> : <Users size={18} />}
                                    </div>
                                    <div className={styles.rowText}>
                                        <div className={styles.rowTitle}>{member.name}</div>
                                        <div className={styles.rowSub}>{member.title}</div>
                                    </div>
                                </IntentLink>
                            ))}
                        </div>
                        <div className={`${styles.cardHead} ${styles.subHead}`}>
                            <h2 className={styles.cardTitle}>Open positions</h2>
                            <span className={styles.badge}>{data.counts.positions}</span>
                        </div>
                        {data.positions.length ? (
                            data.positions.map((p) => (
                                <IntentLink key={p._id} className={styles.row} intent="edit" params={{id: p._id, type: 'jobPosition'}}>
                                    <div className={styles.thumb}><Briefcase size={18} /></div>
                                    <div className={styles.rowText}>
                                        <div className={styles.rowTitle}>{p.title}</div>
                                        <div className={styles.rowSub}>{p.location}</div>
                                    </div>
                                </IntentLink>
                            ))
                        ) : (
                            <div className={styles.empty}>No open positions.</div>
                        )}
                    </div>
                </div>

                <p className={`${styles.sub} ${styles.tip}`}>
                    <FilePen size={14} /> Tip: drafts are not shown on the website until you click Publish. To hide an item
                    without deleting it, turn off “Show on website”.
                </p>
            </div>
        </div>
    );
}

export const homeTool = {
    name: 'home',
    title: 'Home',
    icon: House,
    component: HomeTool,
};
