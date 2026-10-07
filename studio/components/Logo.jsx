import markUrl from '../static/concrete-mark.svg';

// Workspace icon in the Studio's top bar (replaces the default initials badge).
export function Logo() {
    return <img src={markUrl} alt="Concrete Media" style={{width: '100%', height: '100%', objectFit: 'contain'}} />;
}
