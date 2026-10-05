import {useCallback, useEffect, useState} from 'react';
import {useClient} from 'sanity';
import {IntentLink} from 'sanity/router';
import {usePaneRouter} from 'sanity/structure';
import {LexoRank} from 'lexorank';
import {EyeOff, GripVertical, Plus} from 'lucide-react';
import '@fontsource/outfit/600.css';
import styles from './gallery.module.css';

// Card gallery with drag-and-drop ordering (writes the same orderRank field as the orderable lists).
function Gallery({type, title, addLabel, query, wide, searchText, renderCard}) {
    const client = useClient({apiVersion: '2025-02-19'});
    const {ChildLink} = usePaneRouter();
    const [items, setItems] = useState(null);
    const [search, setSearch] = useState('');
    const [dragId, setDragId] = useState(null);
    const [overId, setOverId] = useState(null);

    const load = useCallback(
        () => client.fetch(query, {}, {perspective: 'drafts'}).then(setItems),
        [client, query]
    );

    useEffect(() => {
        load();
        // Refresh when documents of this type change (edits, publishes, other editors).
        const subscription = client.listen(`*[_type == "${type}"]`, {}, {visibility: 'query'}).subscribe(() => load());
        return () => subscription.unsubscribe();
    }, [client, load, type]);

    async function move(fromId, toId) {
        if (!items || fromId === toId) return;
        const from = items.findIndex((i) => i._id === fromId);
        const to = items.findIndex((i) => i._id === toId);
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        setItems(next);

        const before = next[to - 1]?.orderRank;
        const after = next[to + 1]?.orderRank;
        const rank = before && after
            ? LexoRank.parse(before).between(LexoRank.parse(after))
            : before
              ? LexoRank.parse(before).genNext()
              : after
                ? LexoRank.parse(after).genPrev()
                : LexoRank.middle();

        // Keep the published document and any open draft in the same position.
        const tx = client.transaction().patch(moved._id, {set: {orderRank: rank.toString()}});
        if (moved._originalId?.startsWith('drafts.')) tx.patch(moved._originalId, {set: {orderRank: rank.toString()}});
        await tx.commit({visibility: 'async'});
    }

    const visible = (items || []).filter((item) => !search || searchText(item).toLowerCase().includes(search.toLowerCase()));

    return (
        <div className={styles.pane}>
            <div className={styles.head}>
                <h1 className={styles.title}>{title}</h1>
                <IntentLink className={styles.add} intent="create" params={{type}}>
                    <Plus size={16} /> {addLabel}
                </IntentLink>
            </div>
            <p className={styles.count}>
                {items ? `${items.length} items · the order here is the order on the website` : 'Loading…'}
            </p>
            <input className={styles.search} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />

            {items && !visible.length && <div className={styles.empty}>Nothing found.</div>}
            <div className={`${styles.grid} ${wide ? styles.gridWide : ''}`}>
                {visible.map((item) => (
                    <ChildLink
                        key={item._id}
                        childId={item._id}
                        className={`${styles.card} ${dragId === item._id ? styles.dragging : ''} ${overId === item._id && dragId !== item._id ? styles.dropTarget : ''}`}
                        draggable={!search}
                        onDragStart={(e) => {
                            setDragId(item._id);
                            e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setOverId(item._id);
                        }}
                        onDragEnd={() => {
                            setDragId(null);
                            setOverId(null);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            move(dragId, item._id);
                            setDragId(null);
                            setOverId(null);
                        }}
                    >
                        {!search && (
                            <span className={styles.handle} title="Drag to reorder" onClick={(e) => e.preventDefault()}>
                                <GripVertical size={15} />
                            </span>
                        )}
                        {renderCard(item)}
                    </ChildLink>
                ))}
            </div>
            <p className={styles.hint}>
                Drag a card to change its position on the website. Click a card to edit it.{search ? ' (Clear the search to reorder.)' : ''}
            </p>
        </div>
    );
}

const CATEGORY_LABELS = {'AI & ML': 'AI & ML', saas: 'SaaS', security: 'Security', dev: 'Dev', medtech: 'Medtech', hr: 'HR', fintech: 'Fintech', 'deep tech': 'Deep tech', insurtech: 'Insurtech', 2025: '2025'};

export function ClientsGallery() {
    return (
        <Gallery
            type="client"
            title="Clients"
            addLabel="Add client"
            query={`*[_type == "client"] | order(orderRank){_id, _originalId, orderRank, name, website, categories, logoStyle, "logo": logo.asset->url}`}
            searchText={(c) => `${c.name} ${c.website}`}
            renderCard={(c) => (
                <>
                    <div className={styles.logoBox}>{c.logo && <img src={`${c.logo}?w=320&fit=max`} alt="" style={c.logoStyle === 'invert-logo' ? {filter: 'invert(1)'} : undefined} />}</div>
                    <div>
                        <p className={styles.name}>{c.name}</p>
                        <p className={styles.sub}>{c.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</p>
                    </div>
                    {c.categories?.length > 0 && (
                        <div className={styles.chips}>
                            {c.categories.map((cat) => <span key={cat} className={styles.chip}>{CATEGORY_LABELS[cat] || cat}</span>)}
                        </div>
                    )}
                </>
            )}
        />
    );
}

export function TestimonialsGallery() {
    return (
        <Gallery
            type="testimonial"
            title="Testimonials"
            addLabel="Add testimonial"
            wide
            query={`*[_type == "testimonial"] | order(orderRank){
                _id, _originalId, orderRank, quote, name, title, isVisible,
                "logo": coalesce(logoOverride.asset->url, client->logo.asset->url)
            }`}
            searchText={(t) => `${t.name} ${t.title} ${t.quote}`}
            renderCard={(t) => (
                <>
                    {t.isVisible === false && (
                        <span className={styles.hidden}><EyeOff size={12} /> Hidden</span>
                    )}
                    <p className={styles.quote} style={t.isVisible === false ? {marginTop: 22} : undefined}>“{t.quote}”</p>
                    <div className={styles.person}>
                        {t.logo && <img className={styles.personLogo} src={`${t.logo}?w=160&fit=max`} alt="" />}
                        <div style={{minWidth: 0}}>
                            <p className={styles.name}>{t.name}</p>
                            <p className={styles.sub}>{t.title}</p>
                        </div>
                    </div>
                </>
            )}
        />
    );
}
