import {useCallback, useEffect, useRef, useState} from 'react';
import {useClient} from 'sanity';
import {IntentLink} from 'sanity/router';
import {usePaneRouter} from 'sanity/structure';
import {DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {LexoRank} from 'lexorank';
import {EyeOff, GripVertical, Plus} from 'lucide-react';
import '@fontsource/outfit/600.css';
import styles from './gallery.module.css';

// One card: the whole card can be dragged; a plain click opens the document.
function SortableCard({id, disabled, children, link: Link}) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id, disabled});
    return (
        <div
            ref={setNodeRef}
            style={{transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 2 : undefined}}
            className={isDragging ? styles.dragging : undefined}
            {...attributes}
            {...listeners}
        >
            <Link childId={id} className={styles.card} draggable={false} onDragStart={(e) => e.preventDefault()}>
                {!disabled && (
                    <span className={styles.handle} title="Drag to reorder">
                        <GripVertical size={15} />
                    </span>
                )}
                {children}
            </Link>
        </div>
    );
}

// Card gallery with drag-and-drop ordering (writes the same orderRank field as the orderable lists).
function Gallery({type, title, addLabel, query, wide, searchText, renderCard}) {
    const client = useClient({apiVersion: '2025-02-19'});
    const {ChildLink} = usePaneRouter();
    const [items, setItems] = useState(null);
    const [search, setSearch] = useState('');
    const justDragged = useRef(false);
    const sensors = useSensors(
        // A short movement is needed before a drag starts, so clicks still open the card.
        useSensor(PointerSensor, {activationConstraint: {distance: 6}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
    );

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

    // Releasing the mouse after a drag also fires a click on the card under it. Swallow clicks
    // for a moment after every drag so the card doesn't open.
    function blockClickAfterDrag() {
        justDragged.current = true;
        const swallow = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        window.addEventListener('click', swallow, true);
        setTimeout(() => {
            window.removeEventListener('click', swallow, true);
            justDragged.current = false;
        }, 300);
    }

    async function handleDragEnd({active, over}) {
        blockClickAfterDrag();
        if (!items || !over || active.id === over.id) return;

        const next = arrayMove(items, items.findIndex((i) => i._id === active.id), items.findIndex((i) => i._id === over.id));
        const index = next.findIndex((i) => i._id === active.id);
        const moved = next[index];
        const before = next[index - 1]?.orderRank;
        const after = next[index + 1]?.orderRank;
        const rank = before && after
            ? LexoRank.parse(before).between(LexoRank.parse(after))
            : before
              ? LexoRank.parse(before).genNext()
              : after
                ? LexoRank.parse(after).genPrev()
                : LexoRank.middle();

        // Update the local copy too, so the next drag computes from the new position.
        next[index] = {...moved, orderRank: rank.toString()};
        setItems(next);

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
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={() => (justDragged.current = true)}
                onDragCancel={blockClickAfterDrag}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={visible.map((i) => i._id)} strategy={rectSortingStrategy}>
                    <div
                        className={`${styles.grid} ${wide ? styles.gridWide : ''}`}
                        onClickCapture={(e) => {
                            if (justDragged.current) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        }}
                    >
                        {visible.map((item) => (
                            <SortableCard key={item._id} id={item._id} disabled={Boolean(search)} link={ChildLink}>
                                {renderCard(item)}
                            </SortableCard>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
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
            query={`*[_type == "client"] | order(orderRank, _id){_id, _originalId, orderRank, name, website, categories, logoStyle, "logo": logo.asset->url}`}
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
            query={`*[_type == "testimonial"] | order(orderRank, _id){
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
