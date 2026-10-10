import { useRef, useState } from 'react';
import { finite } from '../../services/sceneModel';
import { messageKind } from '../../data/sceneCatalog';

const paths = {
  back: 'M15 4 7 12l8 8', close: 'm6 6 12 12M18 6 6 18', plus: 'M12 3v18M3 12h18',
  send: 'm3 3 18 9-18 9 4-9-4-9Zm4 9h14', phone: 'M6 3 3 5c-1 8 8 17 16 16l2-3-5-4-3 3-6-6 3-3-4-5Z',
  video: 'M3 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm14 4 6-4v14l-6-4',
  camera: 'M2 7h5l2-3h6l2 3h5v14H2V7Zm10 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  mic: 'M9 3a3 3 0 0 1 6 0v9a3 3 0 0 1-6 0V3Zm-4 8a7 7 0 0 0 14 0M12 18v5M8 23h8',
  sticker: 'M7 3h10a4 4 0 0 1 4 4v7l-7 7H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm7 18v-4a3 3 0 0 1 3-3h4',
  heart: 'M12 21 3 12C-3 5 7-1 12 6c5-7 15-1 9 6l-9 9Z',
  chat: 'M21 11a9 9 0 0 1-9 9H3l2-4a9 9 0 1 1 16-5Z',
  play: 'm8 4 13 8-13 8V4Z', pause: 'M8 4v16M16 4v16',
  search: 'M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm6 14 6 6',
  more: 'M4 12h.01M12 12h.01M20 12h.01', check: 'm3 12 6 6L21 5', checks: 'm1 12 5 5L18 5m-6 12 10-12',
  share: 'm13 3 8 7-8 7v-4c-5 0-8 2-11 7 0-9 4-13 11-13V3Z',
  home: 'm2 10 10-8 10 8v12h-7v-8H9v8H2V10Z', bookmark: 'M5 2h14v20l-7-5-7 5V2Z',
  person: 'M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM3 22v-3a9 9 0 0 1 18 0v3',
  bell: 'M5 17V9a7 7 0 0 1 14 0v8l3 3H2l3-3Zm4 5h6',
  image: 'M2 3h20v18H2V3Zm0 14 6-6 5 5 3-3 6 6M16 7h.01',
  smile: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM6 14c2 5 10 5 12 0M8 8h.01M16 8h.01',
  info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 9v7M12 6h.01',
  arrow: 'M4 12h16m-7-7 7 7-7 7', up: 'm3 11 9-9 9 9h-5v11H8V11H3Z',
  delete: 'M9 4h13v16H9l-7-8 7-8Zm4 4 5 8m0-8-5 8',
  file: 'M5 2h9l5 5v15H5V2Zm9 0v6h5M8 13h8M8 17h8',
  location: 'M12 22s-8-9-8-14a8 8 0 0 1 16 0c0 5-8 14-8 14ZM12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  music: 'M10 17V4l11-2v13M10 4l11-2M6 15a4 3 0 1 0 0 6 4 3 0 0 0 0-6Zm11-2a4 3 0 1 0 0 6 4 3 0 0 0 0-6Z',
  repeat: 'm16 2 4 4-4 4M4 12V6h16M8 22l-4-4 4-4m12-2v6H4',
  like: 'M7 10 11 2h3v7h6c2 0 2 2 1 4l-2 8H7V10ZM2 10h5v11H2V10Z',
  speaker: 'M3 9h4l6-5v16l-6-5H3V9Zm14-2a8 8 0 0 1 0 10m-2-7a3 3 0 0 1 0 4',
  shuffle: 'M3 5h3c5 0 7 14 12 14h3m-4-4 4 4-4 4M3 19h3c5 0 7-14 12-14h3m-4-4 4 4-4 4',
  previous: 'M5 4v16m14-16L7 12l12 8V4Z', next: 'M19 4v16M5 4l12 8-12 8V4Z', star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2-4.5-4.4 6.2-.9L12 3Z',
  return: 'M20 4v9H4m6-6-6 6 6 6', keypad: 'M5 4h.01M12 4h.01M19 4h.01M5 12h.01M12 12h.01M19 12h.01M5 20h.01M12 20h.01M19 20h.01',
};
export function NativeIcon({ name, size = 24, fill = false, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d={paths[name] || paths.more} />
  </svg>;
}
export const NATIVE_ICONS = Object.keys(paths);
export function NativeControl({ children, label, action, onAction, className = '', target, ...props }) {
  return onAction ? <button type="button" className={`native-control ${className}`} aria-label={label}
    data-edit-target={target || `control:${label}`} onClick={event => { event.stopPropagation(); onAction(action); }} {...props}>{children}</button>
    : <span className={`native-control ${className}`} data-edit-target={target || `control:${label}`} {...props}>{children}</span>;
}
export function Avatar({ person = {}, size, className = '', ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  const style = { background: person.color || '#566779', ...(size ? { width: size, height: size } : {}), ...props.style };
  const shared = { ...props, style, className: `native-avatar ${className}` };
  return person.avatar && failedSource !== person.avatar
    ? <img {...shared} src={person.avatar} alt={person.name || 'Foto profil'} onError={() => setFailedSource(person.avatar)} />
    : <span {...shared} className={`${shared.className} native-avatar-empty`} role="img" aria-label={person.name || 'Foto profil'}>
      <NativeIcon name="person" size={Math.round((size || 40) * .58)} />
    </span>;
}
export function useSceneText(slide) {
  return (key, en, id = en) => slide.content?.labels?.[key] ?? ((slide.customSettings?.locale || 'id') === 'en' ? en : id);
}

export function SceneViewport({ slide, children, onScroll, className = '', chat = false }) {
  const body = useRef(null), stream = useRef(null), touch = useRef(null);
  const bottom = chat && (slide.viewport?.anchor === 'bottom' || slide.content?.showKeyboard);
  const scroll = finite(slide.viewport?.scroll, 0, 0, 100000);
  const adjust = delta => {
    if (!onScroll) return;
    const max = Math.max(0, (stream.current?.scrollHeight || 0) - (body.current?.clientHeight || 0));
    onScroll(Math.max(0, Math.min(max, scroll + (bottom ? -delta : delta))));
  };
  return <div ref={body} className={`scene-viewport ${className}`} data-intentional-viewport={slide.viewport?.intentional ? 'true' : undefined}
    onWheel={onScroll ? event => { event.stopPropagation(); adjust(event.deltaY); } : undefined}
    onTouchStart={onScroll ? event => { touch.current = event.touches[0].clientY; } : undefined}
    onTouchMove={onScroll ? event => { const next = event.touches[0].clientY; adjust(touch.current - next); touch.current = next; } : undefined}>
    <div ref={stream} className={`scene-stream ${bottom ? 'anchor-bottom' : ''}`}
      style={{ transform: `translateY(${bottom ? scroll : -scroll}px)` }}>{children}</div>
  </div>;
}

export function MediaContent({ message, onOpen, locale = 'id' }) {
  const kind = messageKind(message);
  const src = message.stickerUrl || message.mediaUrl || message.imageUrl || message.albumArt;
  const images = message.images?.length ? message.images : src ? [{ src }] : [];
  const text = message.text || message.caption;
  const image = (url, alt, props = {}) => url ? <img src={url} alt={alt} {...props} />
    : <div className="native-missing-media" data-missing-asset="true">{locale === 'en' ? 'Choose an image' : 'Pilih gambar'}</div>;
  if (['hidden', 'opened'].includes(message.onceState)) return <div className="native-once"><span>①</span>
    {message.onceState === 'opened' ? (locale === 'en' ? 'Opened' : 'Dibuka') : (locale === 'en' ? 'Photo' : 'Foto')}</div>;
  if (kind === 'text' || kind === 'system') return <span className="native-message-text">{text}</span>;
  if (kind === 'deleted') return <span className="native-deleted">⊘ {locale === 'en' ? 'This message was deleted' : 'Pesan ini telah dihapus'}</span>;
  if (['image', 'video', 'gif', 'sticker', 'album'].includes(kind)) return <>
    <div className={`native-media media-${kind}`} role={onOpen ? 'button' : undefined} tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? 'Buka media' : undefined} onClick={onOpen ? event => { event.stopPropagation(); onOpen(message); } : undefined}
      onKeyDown={onOpen ? event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(message); } } : undefined}
      style={{ ...(message.mediaWidth || message.stickerSize ? { width: message.mediaWidth || message.stickerSize, ...(kind === 'sticker' ? { height: message.stickerSize || message.mediaWidth } : {}) } : {}), ...(kind === 'sticker' && (message.outlineSize || message.outline) ? {
        filter: `drop-shadow(${message.outlineSize || message.outline}px 0 ${message.outlineColor || '#ffffff'}) drop-shadow(-${message.outlineSize || message.outline}px 0 ${message.outlineColor || '#ffffff'}) drop-shadow(0 ${message.outlineSize || message.outline}px ${message.outlineColor || '#ffffff'}) drop-shadow(0 -${message.outlineSize || message.outline}px ${message.outlineColor || '#ffffff'})` } : {}) }}>
      {kind === 'album' ? <>{message.albumTitle && <strong className="native-shared-album-title">{message.albumTitle}</strong>}<div className={`native-album-grid count-${Math.min(images.length, 4)}`}>{images.length ? images.slice(0, 4).map((item, i) =>
        <div key={item.id || i}>{image(item.src || item.url || item, `Foto ${i + 1}`)}{i === 3 && images.length > 4 && <b>+{images.length - 4}</b>}</div>)
        : image('', 'Album')}</div>{message.albumTitle && <small className="native-shared-album-footer">{images.length} {locale === 'en' ? 'photos · View album' : 'foto · Lihat album'}</small>}</> : image(src, kind === 'sticker' ? 'Stiker' : 'Media cerita')}
      {kind === 'video' && <><span className="native-play"><NativeIcon name="play" fill size={30} /></span><small className="native-media-duration">{message.duration || '0:24'}</small></>}
      {kind === 'gif' && <small className="native-media-duration">GIF</small>}
      {message.isHD && <small className="native-media-hd">HD</small>}
    </div>{text && kind !== 'sticker' && <span className="native-message-text">{text}</span>}
  </>;
  if (kind === 'voice') return <div className="native-voice"><NativeIcon name={message.isPlaying ? 'pause' : 'play'} fill size={25} />
    <div><div className="native-waveform">{[10, 18, 7, 23, 13, 17, 27, 11, 21, 15, 8, 24, 17, 10, 20, 13, 26, 7, 17, 12].map((height, i) =>
      <i key={i} style={{ height, opacity: i / 20 < (message.progressPercent || 0) / 100 ? 1 : .4 }} />)}</div>
      <small>{message.voiceDuration || message.duration || '0:24'}</small></div><small>{message.playbackSpeed || '1×'}</small></div>;
  if (kind === 'poll') return <div className="native-card native-poll"><strong>{message.title || text}</strong>
    {(message.options || []).map((option, i) => <div key={i}><span>○ {option.text}</span><small>{option.votes || '0'}</small>
      <i style={{ width: `${finite(option.percent, 0, 0, 100)}%` }} /></div>)}<small>{message.totalVotes || '0'} {locale === 'en' ? 'votes' : 'suara'}</small></div>;
  if (kind === 'location') return <div className="native-card"><div className="native-map">{message.mediaUrl ? image(message.mediaUrl, 'Peta lokasi') : <NativeIcon name="location" size={38} />}</div>
    <strong>{message.title || 'Lokasi'}</strong><small>{message.address || text}</small></div>;
  if (kind === 'contact') return <div className="native-card"><NativeIcon name="person" size={32} /><strong>{message.title || text}</strong>
    <small>{message.phoneNumber}</small><span className="native-card-footer">{locale === 'en' ? 'View contact' : 'Lihat kontak'}</span></div>;
  if (kind === 'music') return <div className="native-card native-music-card">{src && image(src, 'Sampul lagu')}
    <div><strong>{message.song || message.title || text}</strong><small>{message.artist}</small><NativeIcon name="play" size={22} fill /></div></div>;
  return <div className={`native-card card-${kind}`}>{src && image(src, 'Pratinjau')}
    {kind === 'document' && <NativeIcon name="file" size={35} />}<strong>{message.title || message.fileName || text}</strong>
    <small>{kind === 'document' ? `${message.fileSize || '240 KB'} · ${message.fileType || 'PDF'}` : message.description || text}</small>
    {message.url && <small className="native-link-url">{message.url}</small>}</div>;
}
