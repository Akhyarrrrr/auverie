import React, { useRef, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { appDefinition, isConversation, MESSAGE_KINDS, MESSAGE_LABELS, messageKind, sceneIdentity, SCREEN_LABELS, SCREEN_LABELS_EN } from '../../data/sceneCatalog';
import { whatsappColors } from '../../data/whatsappThemes';
import { finite } from '../../services/sceneModel';
import { Avatar, MediaContent, NativeControl, NativeIcon, SceneViewport, useSceneText } from './SceneParts';
import KeyboardView, { EMOJI_KEYS } from './KeyboardView';
import AssetPickerModal from '../studio/AssetPickerModal';

function Conversation({ slide, app, person, getPerson, action, onScroll, locale, theme, platform, text }) {
  const c = slide.content, hold = useRef(null);
  const group = ['group', 'channel'].includes(sceneIdentity(slide).screen);
  const control = (icon, label, value, className = '') => <NativeControl label={label} onAction={action} action={value} className={className}>
    <NativeIcon name={c.iconOverrides?.[label] || icon} /></NativeControl>;
  const name = c.contactName || (group ? c.groupTitle : person.name);
  return <>
    <header className="native-chat-header" data-edit-target="chat-header">
      <div className="native-chat-header-start"><NativeControl label="Daftar chat" onAction={action} action={{ type: 'go', screen: 'inbox' }} className="native-back">
        <NativeIcon name="back" />{c.backCount && app === 'whatsapp' && <span className="native-back-count">{c.backCount}</span>}</NativeControl>
        <NativeControl label="Info percakapan" onAction={action} action={{ type: 'go', screen: 'info' }} className="native-chat-contact">
          <Avatar person={{ ...person, avatar: group ? c.groupAvatar || person.avatar : c.contactAvatar || person.avatar }} />
          <span><strong data-edit-target="contact-name">{name}</strong><small data-edit-target="contact-status">{c.showTypingIndicator
            ? text('typing', 'typing…', 'sedang mengetik…') : c.statusText || (app === 'instagram' ? person.handle : '')}</small></span>
        </NativeControl>
      </div>
      <div className="native-chat-header-actions">
        {appDefinition(app).screens.includes('call') && control('video', 'Panggilan video', { type: 'call', kind: 'video' })}
        {appDefinition(app).screens.includes('call') && control('phone', 'Panggilan suara', { type: 'call', kind: 'voice' })}
        {control('more', 'Menu percakapan', { type: 'overlay', value: 'chat-menu' })}
      </div>
    </header>
    {c.pinnedMessage && <div className="native-pinned" data-edit-target="pinned">⌖ {c.pinnedMessage}</div>}
    <SceneViewport slide={slide} chat onScroll={onScroll} className="native-conversation">
      {c.dateLabel !== '' && <div className="native-date" data-edit-target="date-label">{c.dateLabel || text('today', 'Today', 'Hari ini')}</div>}
      {(c.messages || []).map((message, index) => {
        const kind = messageKind(message), me = message.senderId === 'me';
        const sender = getPerson(message.senderId);
        const previous = c.messages[index - 1];
        const avatar = !me && ['instagram', 'messenger', 'tiktok'].includes(app);
        const nativeTime = ['whatsapp', 'telegram', 'line'].includes(app) || message.showTime || c.showMessageTimes;
        const lastReceipt = me && index === c.messages.length - 1 && ['read', 'failed', 'pending'].includes(message.status);
        return <React.Fragment key={message.id}>
          {c.unreadCount > 0 && index === finite(c.unreadStartIndex, 0, 0, c.messages.length) && <div className="native-unread" data-edit-target="unread">
            {c.unreadCount} {text('unread', 'unread messages', 'pesan belum dibaca')}</div>}
          {message.timeLabel && <div className="native-date" data-edit-target={`message:${message.id}`}>{message.timeLabel}</div>}
          <div className={`native-message-row ${me ? 'me' : 'other'} kind-${kind} ${!nativeTime && lastReceipt ? 'external-receipt' : ''} ${previous?.senderId === message.senderId ? 'consecutive' : ''}`}
            data-edit-target={`message:${message.id}`} onContextMenu={action ? event => { event.preventDefault(); action({ type: 'message-menu', id: message.id }); } : undefined}
            onPointerDown={action ? () => { hold.current = setTimeout(() => action({ type: 'message-menu', id: message.id }), 500); } : undefined}
            onPointerUp={() => clearTimeout(hold.current)} onPointerLeave={() => clearTimeout(hold.current)}>
            {avatar && <Avatar person={sender} size={28} className="message-avatar" />}
            <div className={`native-bubble ${message.hasTail !== false ? 'has-tail' : ''}`}>
              {group && !me && kind !== 'system' && <strong className="native-sender" style={{ color: sender.color }}>{sender.name}</strong>}
              {message.isForwarded && <small className="native-forwarded">↪ {text('forwarded', 'Forwarded', 'Diteruskan')}</small>}
              {message.replyTo && <div className="native-quote"><strong>{message.replyTo.senderName}</strong><span>{message.replyTo.textPreview}</span></div>}
              <MediaContent message={message} locale={locale} onOpen={action && ['image', 'album', 'video', 'gif', 'sticker'].includes(kind)
                ? item => action({ type: 'media', message: item }) : undefined} />
              {kind !== 'system' && (nativeTime || lastReceipt) && <div className="native-message-meta"><span>{message.isEdited && text('edited', 'edited', 'diedit')} {nativeTime && message.time}</span>
                {me && kind !== 'deleted' && <span className={message.status === 'read' ? 'read-receipt' : ''}>
                  {message.status === 'failed' ? 'ⓘ' : message.status === 'pending' ? '◷' : app === 'whatsapp' || app === 'telegram'
                    ? <NativeIcon name={['read', 'delivered'].includes(message.status) ? 'checks' : 'check'} size={16} />
                    : ['instagram', 'messenger'].includes(app) && message.status === 'read' ? <Avatar person={person} size={12} />
                      : message.status === 'read' ? text('read', 'Read', 'Dibaca') : ''}</span>}
              </div>}
              {!!message.reactions?.length && <div className="native-message-reactions">{message.reactions.join(' ')}</div>}
            </div>
            {kind === 'sticker' && <NativeControl label="Teruskan stiker" className="native-sticker-share" onAction={action}
              action={{ type: 'forward', id: message.id }}><NativeIcon name="share" size={23} fill /></NativeControl>}
          </div>
        </React.Fragment>;
      })}
      {c.showTypingIndicator && <div className="native-typing" data-edit-target="typing">● ● ●</div>}
      {c.seenText && <small className="native-seen" data-edit-target="seen">{c.seenText}</small>}
    </SceneViewport>
    <div className="native-composer" data-edit-target="composer">
      {c.composerReply && <div className="native-composer-reply"><strong>{c.composerReply.senderName}</strong><span>{c.composerReply.textPreview}</span>
        {control('close', 'Batal balasan', { type: 'cancel-reply' })}</div>}
      {c.isRecording ? <div className="native-recording">● {c.recordingDuration || '0:04'}
        {control('close', 'Batalkan rekaman', { type: 'cancel-recording' })}{control('send', 'Kirim voice note', { type: 'send-voice' })}</div> : <>
        {control(app === 'messages' && platform === 'ios' ? 'plus' : app === 'instagram' ? 'camera' : 'plus', 'Lampiran', { type: 'overlay', value: 'attachments' }, 'composer-add')}
        <div className="native-composer-pill">
          {action ? <input aria-label="Teks pesan cerita" inputMode="none" value={c.draftText || ''}
            placeholder={c.showKeyboard ? '' : c.composerPlaceholder || text('message', 'Message', 'Pesan')}
            onFocus={() => action({ type: 'keyboard-open' })} onChange={event => action({ type: 'draft', value: event.target.value })}
            onSelect={event => { if (event.target.selectionStart !== c.caretPosition) action({ type: 'caret', value: event.target.selectionStart }); }}
            onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); action({ type: 'send' }); } }} />
            : <span className="native-composer-value">{c.showKeyboard ? <>{(c.draftText || '').slice(0, finite(c.caretPosition, c.draftText?.length || 0, 0, c.draftText?.length || 0))}<i className="native-draft-caret" />{(c.draftText || '').slice(finite(c.caretPosition, c.draftText?.length || 0, 0, c.draftText?.length || 0))}</>
              : c.draftText || c.composerPlaceholder || text('message', 'Message', 'Pesan')}</span>}
          {control('sticker', 'Stiker dan emoji', { type: 'overlay', value: 'stickers' })}
        </div>
        {app === 'whatsapp' && control('camera', 'Kirim foto', { type: 'pick-media', kind: 'image' }, 'composer-camera')}
        {control(c.draftText ? 'send' : 'mic', c.draftText ? 'Kirim pesan' : 'Rekam voice note', { type: c.draftText ? 'send' : 'recording' }, `composer-send${c.draftText ? '' : ' is-mic'}`)}
      </>}
    </div>
    {c.showKeyboard && <KeyboardView content={c} platform={platform} theme={theme} locale={locale} onAction={action} />}
  </>;
}

export default function AppSceneView({ slide, platform, theme, interactive = false, previewCharacters = [] }) {
  const { project, getCharacter, updateSlideContent, updateSlideMeta, setEditTarget } = useProject();
  const { app, screen } = sceneIdentity(slide);
  const definition = appDefinition(app), c = slide.content || {}, state = slide.sceneState || {};
  const [picker, setPicker] = useState(null);
  const locale = slide.customSettings?.locale || 'id';
  const text = useSceneText(slide);
  const screenLabel = name => text(name, SCREEN_LABELS_EN[name] || name, SCREEN_LABELS[name] || name);
  const getPerson = id => previewCharacters.find(item => item.id === id) || slide.charactersSnapshot?.find(item => item.id === id) || getCharacter(id);
  const person = getPerson(state.personId || c.targetCharacterId || c.authorId);
  const patch = updates => updateSlideContent(slide.id, updates);
  const patchState = updates => updateSlideMeta(slide.id, { sceneState: { ...state, ...updates } });
  const navigate = (next, extra = {}) => {
    if (!definition.screens.includes(next)) next = definition.screens.includes('info') ? 'info' : definition.screens[0];
    updateSlideMeta(slide.id, previous => ({ sceneState: { ...previous.sceneState, screen: next, overlay: null,
      history: [...(previous.sceneState?.history || []), screen], ...extra },
      viewport: { ...previous.viewport, scroll: 0, intentional: true } }));
  };
  const append = message => {
    updateSlideMeta(slide.id, previous => ({ content: { ...previous.content, messages: [...(previous.content.messages || []), {
      id: crypto.randomUUID(), senderId: previous.content.composerSenderId || 'me', time: previous.content.timestamp || slide.customSettings?.time || project.globalSettings.time,
      status: 'read', ...message }], draftText: '', composerReply: null, isRecording: false },
      sceneState: { ...previous.sceneState, overlay: null }, viewport: { ...previous.viewport, anchor: 'bottom', scroll: 0, intentional: true } }));
  };
  const action = interactive ? value => {
    if (!value) return;
    const message = c.messages?.find(item => item.id === (value.id || state.messageId));
    switch (value.type) {
      case 'go': navigate(value.screen, value.personId ? { personId: value.personId } : {}); break;
      case 'back': patchState({ screen: state.history?.at(-1) || definition.screens[0], history: (state.history || []).slice(0, -1), overlay: null }); break;
      case 'overlay': patchState({ overlay: value.value }); break;
      case 'close-overlay': patchState({ overlay: null }); break;
      case 'draft': patch({ draftText: value.value, caretPosition: value.value.length }); break;
      case 'caret': updateSlideContent(slide.id, { caretPosition: value.value }, false); break;
      case 'keyboard-open': patch({ showKeyboard: true }); break;
      case 'keyboard-mode': patch({ keyboardMode: value.value, showKeyboard: true }); break;
      case 'caps': patch({ keyboardCaps: !c.keyboardCaps }); break;
      case 'key': { const draft = c.draftText || '', at = finite(c.caretPosition, draft.length, 0, draft.length);
        patch({ draftText: draft.slice(0, at) + value.value + draft.slice(at), caretPosition: at + value.value.length }); break; }
      case 'delete-key': { const draft = c.draftText || '', at = finite(c.caretPosition, draft.length, 0, draft.length);
        const segments = [...new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(draft.slice(0, at))];
        const start = segments.at(-1)?.index ?? 0; patch({ draftText: draft.slice(0, start) + draft.slice(at), caretPosition: start }); break; }
      case 'suggestion': patch({ draftText: `${c.draftText || ''}${value.value} `, caretPosition: (c.draftText || '').length + value.value.length + 1 }); break;
      case 'send':
        if (c.draftText?.trim()) {
          if (['story', 'status', 'instant'].includes(screen)) patch({ storyReplySent: c.draftText, draftText: '', showKeyboard: false });
          else if (screen === 'comments') patch({ comments: [...(c.comments || []), { id: crypto.randomUUID(), authorId: c.composerSenderId || 'me', text: c.draftText, time: 'now' }], draftText: '' });
          else append({ kind: 'text', text: c.draftText, replyTo: c.composerReply });
        } break;
      case 'recording': patch({ isRecording: !c.isRecording, showKeyboard: false }); break;
      case 'cancel-recording': patch({ isRecording: false }); break;
      case 'send-voice': append({ kind: 'voice', voiceDuration: c.recordingDuration || '0:04' }); break;
      case 'cancel-reply': patch({ composerReply: null }); break;
      case 'pick-media': setPicker(value.kind); break;
      case 'send-sticker': append({ kind: 'sticker', stickerUrl: value.url }); break;
      case 'add-card': { const id = crypto.randomUUID(); append({ id, kind: value.kind, title: MESSAGE_LABELS[value.kind], text: '' });
        setEditTarget(`message:${id}`); break; }
      case 'media': navigate('media', { media: value.message }); break;
      case 'message-menu': patchState({ overlay: 'message-menu', messageId: value.id }); break;
      case 'react': case 'reply': case 'delete': case 'forward': case 'pin': case 'edit-message': {
        if (!message) { patchState({ overlay: null }); break; }
        const updates = value.type === 'reply' ? { composerReply: { senderName: getPerson(message.senderId).name, textPreview: message.text || MESSAGE_LABELS[messageKind(message)] }, showKeyboard: true }
          : value.type === 'pin' ? { pinnedMessage: message.text || MESSAGE_LABELS[messageKind(message)] } : {};
        const messageUpdates = value.type === 'react' ? { reactions: [...(message.reactions || []), value.value] }
          : value.type === 'delete' ? { kind: 'deleted', text: '', isDeleted: true } : value.type === 'forward' ? { isForwarded: true } : value.type === 'edit-message' ? { isEdited: true } : {};
        updateSlideMeta(slide.id, previous => ({ content: { ...previous.content, ...updates,
          messages: previous.content.messages.map(item => item.id === message.id ? { ...item, ...messageUpdates } : item) }, sceneState: { ...previous.sceneState, overlay: null } }));
        if (value.type === 'edit-message') setEditTarget(`message:${message.id}`);
        break;
      }
      case 'call': updateSlideMeta(slide.id, previous => ({ content: { ...previous.content, callKind: value.kind, callStatus: 'outgoing' },
        sceneState: { ...previous.sceneState, screen: 'call', overlay: null, history: [...(previous.sceneState?.history || []), screen] } })); break;
      case 'answer': patch({ callStatus: 'active' }); break;
      case 'end-call': patch({ callStatus: 'ended' }); break;
      case 'mute': patch({ callMuted: !c.callMuted }); break;
      case 'speaker': patch({ callSpeaker: !c.callSpeaker }); break;
      case 'hold': patch({ callHeld: !c.callHeld }); break;
      case 'dial': patch({ dialedNumber: (c.dialedNumber || '') + value.value }); break;
      case 'note-bold': patch({ noteBold: !c.noteBold }); break;
      case 'inbox-filter': patchState({ inboxFilter: value.value }); break;
      case 'like': patch({ isLiked: !c.isLiked }); break;
      case 'bookmark': patch({ isBookmarked: !c.isBookmarked }); break;
      case 'facebook-reaction': updateSlideMeta(slide.id, previous => ({ content: { ...previous.content, reaction: value.value }, sceneState: { ...previous.sceneState, overlay: null } })); break;
      case 'carousel': patchState({ mediaIndex: value.index }); break;
      case 'play': patch({ isPlaying: !c.isPlaying }); break;
      case 'shuffle': patch({ shuffle: !c.shuffle }); break;
      case 'repeat': patch({ repeat: !c.repeat }); break;
      case 'track': patch({ song: value.track.title, artist: value.track.artist, albumArt: value.track.imageUrl || c.albumArt }); navigate('player'); break;
      case 'skip-track': { const index = (c.tracks || []).findIndex(item => item.title === c.song);
        const track = c.tracks?.[(Math.max(0, index) + value.direction + (c.tracks?.length || 0)) % (c.tracks?.length || 1)];
        if (track) patch({ song: track.title, artist: track.artist, albumArt: track.imageUrl || c.albumArt, progress: '0:00', progressPercent: 0 }); break; }
      case 'edit': setEditTarget(value.target || 'scene-content'); break;
      case 'open-note': patch({ title: value.note.title, text: value.note.text, timestamp: value.note.time }); navigate('note'); break;
      default: break;
    }
  } : undefined;
  const control = (icon, label, value, className = '') => <NativeControl label={label} action={value} onAction={action} className={className}>
    <NativeIcon name={c.iconOverrides?.[label] || icon} fill={['play', 'pause', 'home'].includes(icon)} /></NativeControl>;
  const viewport = children => <SceneViewport slide={slide} onScroll={action ? scroll => updateSlideMeta(slide.id, {
    viewport: { ...slide.viewport, anchor: 'top', scroll, intentional: true } }) : undefined}>{children}</SceneViewport>;
  const header = (title, trailing = control('more', 'Menu', { type: 'overlay', value: 'screen-menu' })) => <header className="native-page-header" data-edit-target="header">
    {control('back', 'Kembali', { type: 'back' })}<strong>{title}</strong>{trailing}</header>;
  const tabs = () => <nav className="native-bottom-nav" data-edit-target="navigation">{(app === 'whatsapp'
    ? [['status', 'chat', text('updates', 'Updates', 'Pembaruan')], ['calls', 'phone', text('calls', 'Calls', 'Panggilan')], ['inbox', 'chat', text('chats', 'Chats', 'Chat')], ['info', 'person', text('settings', 'You', 'Anda')]]
    : app === 'phone' ? [['calls', 'phone', text('recent', 'Recents', 'Terbaru')], ['contacts', 'person', text('contacts', 'Contacts', 'Kontak')]]
      : app === 'spotify' ? [['playlist', 'home', text('home', 'Home', 'Beranda')], ['queue', 'search', text('search', 'Search', 'Cari')], ['profile', 'music', text('library', 'Your Library', 'Koleksi Kamu')]]
        : app === 'telegram' ? [['inbox', 'chat', text('chats', 'Chats', 'Chat')], ['calls', 'phone', text('calls', 'Calls', 'Panggilan')], ['profile', 'person', text('profile', 'Profile', 'Profil')], ['info', 'more', text('info', 'Info', 'Info')]]
          : app === 'line' ? [['profile', 'home', text('home', 'Home', 'Beranda')], ['inbox', 'chat', text('chats', 'Chats', 'Chat')], ['calls', 'phone', text('calls', 'Calls', 'Panggilan')]]
            : app === 'messenger' ? [['inbox', 'chat', text('chats', 'Chats', 'Chat')], ['calls', 'phone', text('calls', 'Calls', 'Panggilan')], ['story', 'person', text('stories', 'Stories', 'Cerita')]]
        : [['feed', 'home', text('home', 'Home', 'Beranda')], ['profile', 'search', text('search', 'Search', 'Cari')], ['reel', 'play', 'Reels'], ['notifications', 'bell', text('activity', 'Activity', 'Aktivitas')], ['inbox', 'chat', text('messages', 'Messages', 'Pesan')]])
    .filter(([next]) => definition.screens.includes(next)).map(([next, icon, label]) => <NativeControl key={next} label={label} onAction={action}
      action={{ type: 'go', screen: next }} className={screen === next ? 'active' : ''}><NativeIcon name={icon} /><small>{label}</small></NativeControl>)}</nav>;
  const showImage = (url, alt, className = '') => url ? <img src={url} alt={alt} className={className} /> : <div className={`native-image-empty ${className}`} data-edit-target="scene-content">{text('addPhoto', 'Add photo', 'Tambahkan foto')}</div>;
  const mainHeader = title => <header className={`native-main-header native-page-header ${app === 'x' ? 'x-main-header' : ''}`} data-edit-target="header">
    {app === 'x' && <NativeControl onAction={action} action={{ type: 'go', screen: 'profile' }} label="Profil"><Avatar person={getPerson('me')} size={32} /></NativeControl>}
    <strong className={app === 'facebook' ? 'facebook-wordmark' : ''}>{title}</strong>
    {app === 'whatsapp' ? <>{control('camera', 'Kamera', { type: 'edit', target: 'scene-list' })}{control('plus', 'Chat baru', { type: 'edit', target: 'contacts' })}</>
      : app === 'instagram' ? <>{control('heart', 'Aktivitas', { type: 'go', screen: 'notifications' })}{control('chat', 'Pesan', { type: 'go', screen: 'inbox' })}</>
        : <>{control('search', 'Cari', { type: 'edit', target: 'search' })}{control('more', 'Menu', { type: 'overlay', value: 'screen-menu' })}</>}
  </header>;
  const post = (item, i = 0) => {
    const author = getPerson(item.authorId || c.authorId), images = item.images?.length ? item.images : item.imageUrl || item.mediaUrl ? [{ src: item.imageUrl || item.mediaUrl }] : [];
    const mediaIndex = finite(state.mediaIndex, 0, 0, Math.max(0, images.length - 1));
    return <article className={`native-post ${app === 'x' ? 'x-native-post' : ''}`} key={item.id || i} data-edit-target={item.id ? `post:${item.id}` : 'post'}>
      <div className="native-post-author"><NativeControl label="Profil" onAction={action} action={{ type: 'go', screen: 'profile', personId: author.id }}><Avatar person={author} /></NativeControl>
        <div><strong>{app === 'instagram' ? author.handle?.replace('@', '') : author.name} {author.verified && <span className="native-verified">●✓</span>}</strong>
          <small>{app === 'x' ? author.handle : item.location || item.timestamp || c.timestamp} {app === 'facebook' && '· 🌐'}</small></div>
        {control('more', 'Menu postingan', { type: 'overlay', value: 'screen-menu' })}</div>
      {app !== 'instagram' && <p className="native-post-text" data-edit-target="post-text">{item.text || item.caption}</p>}
      {images.length > 0 && <div className="native-post-media" data-edit-target="post-media">{app !== 'instagram' && images.length > 1 ? <MediaContent message={{ kind: 'album', images }} locale={locale} /> : ['video', 'gif', 'album'].includes(item.mediaKind || item.kind)
        ? <MediaContent message={{ ...item, kind: item.mediaKind || item.kind }} locale={locale} />
        : showImage(images[mediaIndex]?.src || images[mediaIndex]?.url || images[mediaIndex], 'Foto postingan')}
        {app === 'instagram' && images.length > 1 && <><span className="native-carousel-count">{mediaIndex + 1}/{images.length}</span><div className="native-carousel-dots">
          {images.map((_, index) => <NativeControl key={index} label={`Foto ${index + 1}`} action={{ type: 'carousel', index }} onAction={action} className={index === mediaIndex ? 'active' : ''}>●</NativeControl>)}</div></>}
      </div>}
      {item.quoteTweet?.enabled && <div className="native-post-quote"><strong>{getPerson(item.quoteTweet.authorId).name}</strong><p>{item.quoteTweet.text}</p></div>}
      {item.poll?.enabled && <MediaContent message={{ kind: 'poll', ...item.poll }} locale={locale} />}
      {app === 'facebook' && <small className="native-fb-metrics">{c.reaction || '👍'} {item.likesCount || '0'} · {item.repliesCount || '0'} {text('comments', 'comments', 'komentar')} · {item.sharesCount || '0'} {text('shares', 'shares', 'dibagikan')}</small>}
      <div className="native-post-actions" data-edit-target="post-metrics">
        {control(app === 'facebook' ? 'like' : 'heart', text('like', 'Like', 'Suka'), { type: app === 'facebook' ? 'overlay' : 'like', value: 'facebook-reactions' }, c.isLiked ? 'liked' : '')}
        <small>{app === 'facebook' ? text('like', 'Like', 'Suka') : item.likesCount}</small>
        {control('chat', 'Komentar', { type: 'go', screen: 'comments' })}<small>{app === 'facebook' ? text('comments', 'Comment', 'Komentar') : item.repliesCount}</small>
        {app === 'x' && <>{control('repeat', 'Repost', { type: 'overlay', value: 'share' })}<small>{item.retweetsCount}</small></>}
        {control('send', 'Bagikan', { type: 'overlay', value: 'share' })}
        {app !== 'facebook' && control('bookmark', 'Simpan', { type: 'bookmark' }, c.isBookmarked ? 'liked' : '')}
      </div>
      {app === 'instagram' && <><strong className="native-post-likes">{item.likesCount || '0'} {text('likes', 'likes', 'suka')}</strong>
        <p className="native-post-caption" data-edit-target="post-caption"><strong>{author.handle?.replace('@', '')}</strong> {item.caption || item.text}</p></>}
      {app === 'x' && screen !== 'feed' && <small className="native-post-time" data-edit-target="timestamp">{item.timestamp} · <b>{item.viewsCount}</b> {text('views', 'Views', 'Tayangan')}</small>}
    </article>;
  };

  let body;
  if (isConversation(screen)) body = <Conversation slide={slide} app={app} person={person} getPerson={getPerson} action={action}
    onScroll={action ? scroll => updateSlideMeta(slide.id, { viewport: { ...slide.viewport, scroll, intentional: true } }) : undefined}
    locale={locale} theme={theme} platform={platform} text={text} />;
  else if (['inbox', 'requests', 'contacts', 'calls', 'notifications', 'note_list'].includes(screen)) {
    const key = screen === 'notifications' ? 'notifications' : screen === 'note_list' ? 'notes' : 'contacts';
    const allItems = c[key]?.length ? c[key] : ['inbox', 'contacts', 'calls', 'requests'].includes(screen) ? [
      { id: 'contact-default', characterId: person.id, name: c.contactName || person.name, text: c.messages?.at(-1)?.text || c.statusText, time: c.timestamp, unread: c.unreadCount }
    ] : [];
    const items = allItems.filter(item => state.inboxFilter === 'unread' ? item.unread > 0 : state.inboxFilter === 'groups' ? item.isGroup : state.inboxFilter === 'favorites' ? item.isFavorite : true);
    body = <>{screen === 'inbox' ? mainHeader(app === 'x' ? 'Chat' : app === 'whatsapp' && platform === 'android' ? 'WhatsApp' : text('chats', 'Chats', 'Chat'))
      : header(screenLabel(screen), control('plus', 'Buat baru', { type: 'edit', target: 'scene-list' }))}
      {screen !== 'notifications' && <div className="native-search" data-edit-target="search">⌕ {c.searchText || text('search', 'Search', 'Cari')}</div>}
      {app === 'whatsapp' && screen === 'inbox' && <div className="native-chat-filters" data-edit-target="chat-filters">{[['all', 'All', 'Semua'], ['unread', 'Unread', 'Belum dibaca'], ['favorites', 'Favorites', 'Favorit'], ['groups', 'Groups', 'Grup']].map(([value, en, id]) =>
        <NativeControl key={value} label={text(value, en, id)} onAction={action} action={{ type: 'inbox-filter', value }} className={(state.inboxFilter || 'all') === value ? 'active' : ''}>{text(value, en, id)}</NativeControl>)}</div>}
      {['instagram', 'messenger'].includes(app) && ['inbox', 'requests'].includes(screen) && <div className="native-inbox-notes" data-edit-target="notes">
        <NativeControl label="Notes" action={{ type: 'go', screen: 'notes' }} onAction={action}><Avatar person={getPerson('me')} size={62} /><small>{c.noteText || text('yourNote', 'Your note', 'Catatan Anda')}</small></NativeControl>
        <NativeControl label="Permintaan pesan" action={{ type: 'go', screen: 'requests' }} onAction={action}>{text('requests', 'Requests', 'Permintaan')} {c.requestsCount || '0'}</NativeControl></div>}
      {viewport(items.map(item => <NativeControl key={item.id} className="native-list-row" label={item.name || item.title || 'Buka'} onAction={action}
        action={screen === 'note_list' ? { type: 'open-note', note: item } : { type: 'go', screen: screen === 'contacts' ? 'info' : screen === 'calls' ? 'call' : screen === 'notifications' ? 'post' : 'chat', personId: item.characterId }}
        target={`${key}:${item.id}`}>
        {screen !== 'note_list' && <Avatar person={item.imageUrl ? { name: item.name, avatar: item.imageUrl } : getPerson(item.characterId || person.id)} size={screen === 'calls' ? 40 : 56} />}
        <span className="native-list-copy"><strong>{item.name || item.title || getPerson(item.characterId).name}</strong><span>{item.text || item.message || item.phoneNumber}</span>
          {screen === 'calls' && <small className={item.status === 'missed' ? 'missed-call' : ''}>{item.callStatus || item.status || text('incoming', 'Incoming', 'Masuk')} · {item.duration}</small>}</span>
        <span className="native-list-end"><small>{item.time}</small>{item.unread > 0 && <b>{item.unread}</b>}{screen === 'calls' && <NativeIcon name="phone" size={21} />}</span>
      </NativeControl>))}{tabs()}</>;
  } else if (['profile', 'info'].includes(screen)) {
    const social = ['instagram', 'facebook', 'x', 'tiktok'].includes(app);
    body = <>{header(c.profileTitle || person.handle?.replace('@', '') || person.name)}{viewport(<>
      {['facebook', 'x', 'line'].includes(app) && <div className="native-profile-cover" data-edit-target="cover">{c.coverUrl && showImage(c.coverUrl, 'Sampul profil')}</div>}
      <div className={`native-profile ${social ? 'social-profile' : 'contact-profile'}`} data-edit-target="profile">
        <Avatar person={{ ...person, avatar: c.contactAvatar || person.avatar }} size={social ? 92 : 120} />
        <h2 data-edit-target="contact-name">{c.contactName || person.name}</h2><p>{person.handle}</p>
        {social && <div className="native-profile-stats" data-edit-target="profile-metrics"><span><b>{c.postsCount || c.posts?.length || '0'}</b>{text('posts', 'posts', 'postingan')}</span>
          <span><b>{c.followersCount || '0'}</b>{text('followers', 'followers', 'pengikut')}</span><span><b>{c.followingCount || '0'}</b>{text('following', 'following', 'mengikuti')}</span></div>}
        <p className="native-bio" data-edit-target="bio">{c.bio || person.bio}</p>{c.phoneNumber && <p>{c.phoneNumber}</p>}
        <div className="native-profile-actions">{definition.screens.includes('chat') && control('chat', 'Pesan', { type: 'go', screen: 'chat' })}
          {definition.screens.includes('call') && <>{control('phone', 'Telepon', { type: 'call', kind: 'voice' })}{control('video', 'Video', { type: 'call', kind: 'video' })}</>}</div>
        {c.membersText && <p data-edit-target="members">{c.membersText}</p>}
      </div>
      {social ? <><div className="native-profile-tabs">{text('posts', 'Posts', 'Postingan')}　▦　{app === 'x' ? text('replies', 'Replies', 'Balasan') : 'Reels'}</div>
        {app === 'x' || app === 'facebook' ? (c.posts?.length ? c.posts : [c]).map(post) : <div className="native-profile-grid" data-edit-target="profile-grid">
          {(c.images || []).map((item, i) => <NativeControl key={item.id || i} label={`Foto ${i + 1}`} onAction={action} action={{ type: 'media', message: { kind: 'image', mediaUrl: item.src || item.url || item } }}>
            {showImage(item.src || item.url || item, `Foto ${i + 1}`)}</NativeControl>)}</div>}</>
        : <div className="native-info-sections">{definition.screens.some(next => ['album', 'media'].includes(next)) && <NativeControl onAction={action} action={{ type: 'go', screen: definition.screens.includes('album') ? 'album' : 'media' }} label="Media" className="native-info-row">
          {text('mediaLinks', 'Media, links and docs', 'Media, tautan, dan dokumen')}<NativeIcon name="arrow" size={17} /></NativeControl>}
          <div className="native-info-row" data-edit-target="contact-status">{c.statusText}</div>
          {(c.contacts || []).map(item => <div className="native-info-row" key={item.id} data-edit-target={`contacts:${item.id}`}><Avatar person={getPerson(item.characterId)} />{item.name || getPerson(item.characterId).name}</div>)}</div>}
    </>)}{tabs()}</>;
  } else if (['feed', 'post', 'thread', 'group_feed', 'comments'].includes(screen)) {
    body = <>{screen === 'feed' ? mainHeader(app === 'facebook' ? 'facebook' : app === 'x' ? '𝕏' : definition.name)
      : header(screen === 'group_feed' ? c.groupTitle : screenLabel(screen), control('plus', 'Tulis postingan', { type: 'edit', target: 'post' }))}
      {viewport(<>{(screen === 'feed' || screen === 'group_feed') && <div className="native-feed-story-strip" data-edit-target="story-strip">
        {definition.screens.includes('story') && <NativeControl onAction={action} action={{ type: 'go', screen: 'story' }} label="Story"><Avatar person={person} size={64} /><small>{person.name}</small></NativeControl>}
        {app === 'facebook' && <NativeControl onAction={action} action={{ type: 'edit', target: 'post' }} label="Tulis postingan">{text('mind', "What's on your mind?", 'Apa yang Anda pikirkan?')}</NativeControl>}</div>}
        {(c.posts?.length && ['feed', 'group_feed'].includes(screen) ? c.posts : [c]).map(post)}
        {(screen === 'thread' ? c.replies || [] : c.comments || []).map(comment => <div className="native-comment" key={comment.id} data-edit-target={`comment:${comment.id}`}>
          <Avatar person={getPerson(comment.authorId)} size={32} /><div><strong>{getPerson(comment.authorId).handle || getPerson(comment.authorId).name}</strong><p>{comment.text}</p>
            <small>{comment.time || comment.timestamp} · {comment.likesCount || '0'} {text('likes', 'likes', 'suka')} · {text('reply', 'Reply', 'Balas')}</small>
            {comment.replyText && <blockquote>{comment.replyText}</blockquote>}</div></div>)}
      </>)}
      {screen === 'comments' && <><div className="native-comment-composer" data-edit-target="composer">
        {action ? <input aria-label="Tulis komentar" value={c.draftText || ''} inputMode="none" placeholder={text('addComment', 'Add a comment…', 'Tambahkan komentar…')}
          onFocus={() => action({ type: 'keyboard-open' })} onChange={event => action({ type: 'draft', value: event.target.value })} /> : <span>{c.draftText || text('addComment', 'Add a comment…', 'Tambahkan komentar…')}</span>}
        {control('send', 'Kirim komentar', { type: 'send' })}</div>
        {c.showKeyboard && <KeyboardView content={c} platform={platform} theme={theme} locale={locale} onAction={action} />}</>}{tabs()}</>;
  } else if (screen === 'reel') {
    const photoFrames = ['image', 'album'].includes(c.mediaKind) ? c.images || [] : [];
    const frameIndex = finite(state.mediaIndex, 0, 0, Math.max(0, photoFrames.length - 1));
    const frame = photoFrames[frameIndex];
    body = <div className="native-reel-screen" data-edit-target="media">
      {showImage(frame?.src || frame?.url || frame || c.imageUrl || c.mediaUrl || c.backgroundUrl, 'Poster video / foto', 'native-reel-poster')}
      <div className="native-reel-top" data-edit-target="reel-header">{app === 'tiktok'
        ? <><span>{text('following', 'Following', 'Mengikuti')}</span><strong>{text('forYou', 'For You', 'Untuk Anda')}</strong></>
        : <><strong>Reels</strong>{control('camera', 'Kamera', { type: 'edit', target: 'media' })}</>}</div>
      {!['image', 'album'].includes(c.mediaKind) && control(c.isPlaying ? 'pause' : 'play', 'Keadaan video', { type: 'play' }, 'native-reel-play')}
      {photoFrames.length > 1 && <div className="native-reel-photo-dots">{photoFrames.map((_, index) => <NativeControl key={index} label={`Foto ${index + 1}`} onAction={action}
        action={{ type: 'carousel', index }} className={index === frameIndex ? 'active' : ''}>●</NativeControl>)}</div>}
      <div className="native-reel-actions" data-edit-target="reel-metrics">{app === 'tiktok' && <Avatar person={person} size={45} />}
        {control('heart', 'Suka', { type: 'like' }, c.isLiked ? 'liked' : '')}<span>{c.likesCount}</span>
        {control('chat', 'Komentar', { type: 'go', screen: 'comments' })}<span>{c.repliesCount}</span>
        {control('bookmark', 'Simpan', { type: 'bookmark' })}<span>{c.bookmarksCount || '0'}</span>
        {control('share', 'Bagikan', { type: 'overlay', value: 'share' })}<span>{c.shareCount || '0'}</span>
      </div>
      <div className="native-reel-caption" data-edit-target="story-caption"><strong>{person.handle || person.name}</strong><p>{c.caption || c.text}</p>
        <span><NativeIcon name="music" size={15} /> {c.song || c.musicSticker?.song} · {c.artist || person.name}</span></div>
      {tabs()}
    </div>;
  } else if (screen === 'album' && app !== 'spotify') {
    body = <>{header(c.albumTitle || c.title || text('album', 'Album', 'Album'))}{viewport(<div className="native-album-page" data-edit-target="scene-images">
      <strong>{c.albumTitle || c.title}</strong><small>{c.albumOwnerName || person.name} · {c.images?.length || 0} {text('photos', 'photos', 'foto')}</small>
      <div className="native-album-grid">{(c.images || []).map((item, index) => <NativeControl key={item.id || index} label={`Foto ${index + 1}`} action={{ type: 'media', message: { kind: 'image', mediaUrl: item.src || item.url || item } }} onAction={action}>
        {showImage(item.src || item.url || item, 'Foto album')}</NativeControl>)}</div>
    </div>)}{tabs()}</>;
  } else if (['story', 'status', 'instant', 'media'].includes(screen)) {
    const media = state.media || { kind: c.mediaKind || 'image',
      mediaUrl: c.imageUrl || c.mediaUrl || c.backgroundUrl, images: c.images, text: '', duration: c.duration };
    const full = ['story', 'status', 'instant'].includes(screen);
    body = <div className={`native-media-screen ${full ? 'full-media-screen' : ''} screen-${screen}`} style={{ backgroundColor: c.backgroundColor || '#111111' }}>
      {full && <div className="native-story-progress" data-edit-target="story-progress">{Array.from({ length: finite(c.storySegments, 1, 1, 15) }, (_, i) => <i key={i} className={i === (state.storyIndex || 0) ? 'active' : ''} />)}</div>}
      <div className="native-media-header" data-edit-target="story-header">{control('back', 'Kembali', { type: 'back' })}<Avatar person={person} size={34} />
        <span><strong>{person.handle || person.name}</strong><small>{c.storyTime || c.timestamp}</small></span>{control('more', 'Menu media', { type: 'overlay', value: 'screen-menu' })}</div>
      <div className="native-media-stage" data-edit-target="media"><MediaContent message={media} locale={locale} /></div>
      {c.caption && <p className="native-story-caption" data-edit-target="story-caption">{c.caption}</p>}
      {(c.musicSticker?.enabled ?? !!c.musicSticker?.song) && <div className="native-story-music" data-edit-target="story-stickers"><MediaContent message={{ kind: 'music', ...c.musicSticker, mediaUrl: c.musicSticker.albumArt }} /></div>}
      {c.questionSticker?.enabled && <div className="native-story-question" data-edit-target="story-question"><b>{c.questionSticker.prompt}</b><span>{c.questionSticker.answer || text('answer', 'Type something…', 'Ketik sesuatu…')}</span></div>}
      {(c.storyStickers || []).map(item => <div className="native-story-free-sticker" key={item.id} data-edit-target={`storySticker:${item.id}`}
        style={{ left: `${item.x || 10}%`, top: `${item.y || 30}%`, width: item.width || 120, transform: `rotate(${item.rotation || 0}deg)` }}>
        {item.kind === 'sticker' || item.kind === 'image' ? <MediaContent message={item} /> : <span style={{ color: item.color || '#ffffff', background: item.background }}>{item.text}</span>}</div>)}
      <div className="native-media-bottom" data-edit-target="story-reply">{full ? <>
        {action ? <input aria-label="Balas story" value={c.draftText || ''} inputMode="none" onFocus={() => action({ type: 'keyboard-open' })}
          placeholder={text('replyTo', 'Send message', 'Kirim pesan')} onChange={event => action({ type: 'draft', value: event.target.value })} />
          : <span>{c.draftText || (c.storyReplySent ? text('sent', 'Sent', 'Terkirim') : text('replyTo', 'Send message', 'Kirim pesan'))}</span>}
        {control('heart', 'Suka', { type: 'like' })}{control('send', 'Kirim balasan', { type: 'send' })}</>
        : <><span>{media.caption || c.caption || media.time}</span>{control('share', 'Bagikan media', { type: 'overlay', value: 'share' })}</>}
      </div>
      {full && c.showKeyboard && <KeyboardView content={c} platform={platform} theme={theme} locale={locale} onAction={action} />}
    </div>;
  } else if (screen === 'call') {
    const status = c.callStatus || 'incoming', video = c.callKind === 'video';
    body = <div className={`native-call-screen call-${status} ${video ? 'video-call' : ''}`} style={{ backgroundColor: c.callBackground || '#20262c',
      backgroundImage: c.callImageUrl ? `url(${c.callImageUrl})` : undefined }}>
      <small className="native-call-app" data-edit-target="call-kind">{definition.name} {video ? text('videoCall', 'video call', 'panggilan video') : text('audioCall', 'audio call', 'panggilan suara')}</small>
      <Avatar person={{ ...person, avatar: c.contactAvatar || person.avatar }} size={120} />
      <h2 data-edit-target="call-name">{c.contactName || person.name}</h2><p data-edit-target="call-status">{status === 'active' ? c.callDuration || '00:24'
        : text(`call-${status}`, { incoming: 'Incoming call', outgoing: 'Calling…', ringing: 'Ringing…', missed: 'Missed call', ended: 'Call ended' }[status] || status,
          { incoming: 'Panggilan masuk', outgoing: 'Memanggil…', ringing: 'Berdering…', missed: 'Panggilan tak terjawab', ended: 'Panggilan berakhir' }[status] || status)}</p>
      {video && c.callImageUrl && <div className="native-call-self">{showImage(c.selfVideoUrl || getPerson('me').avatar, 'Pratinjau kamera')}</div>}
      {app === 'phone' && ['active', 'outgoing', 'ringing'].includes(status) && <div className="native-phone-call-grid" data-edit-target="call-options">
        {control('mic', 'Bisukan', { type: 'mute' }, c.callMuted ? 'active' : '')}{control('keypad', 'Keypad', { type: 'overlay', value: 'dialpad' })}
        {control('speaker', 'Speaker', { type: 'speaker' }, c.callSpeaker ? 'active' : '')}{control('plus', 'Tambah panggilan', { type: 'go', screen: 'contacts' })}
        {control('pause', 'Tahan panggilan', { type: 'hold' }, c.callHeld ? 'active' : '')}{control('person', 'Kontak', { type: 'go', screen: 'contacts' })}
      </div>}
      <div className="native-call-controls" data-edit-target="call-controls">
        {status === 'incoming' ? <>{control('phone', 'Tolak', { type: 'end-call' }, 'call-decline')}{control('phone', 'Terima', { type: 'answer' }, 'call-answer')}</>
          : <>{app !== 'phone' && <>{control('mic', 'Bisukan', { type: 'mute' }, c.callMuted ? 'active' : '')}{control('speaker', 'Speaker', { type: 'speaker' }, c.callSpeaker ? 'active' : '')}</>}
            {control('phone', 'Akhiri', { type: 'end-call' }, 'call-decline')}</>}
      </div>
    </div>;
  } else if (app === 'spotify') {
    const tracks = c.tracks || [];
    body = <>{header(screen === 'player' ? c.playlistName || text('playingFrom', 'Playing from playlist', 'Memutar dari playlist') : c.title || SCREEN_LABELS[screen])}
      {viewport(screen === 'player' || screen === 'share' ? <div className="native-player" data-edit-target="player">
        {showImage(c.albumArt || c.imageUrl, 'Sampul album', 'native-album-cover')}<div className="native-song-heading"><div><h2>{c.song}</h2><p>{c.artist}</p></div>{control('plus', 'Simpan lagu', { type: 'like' }, c.isLiked ? 'liked' : '')}</div>
        <div className="native-player-progress" data-edit-target="player-progress"><i style={{ width: `${finite(c.progressPercent, 38, 0, 100)}%` }} /></div><div className="native-player-times"><small>{c.progress}</small><small>{c.duration}</small></div>
        <div className="native-player-controls">{control('shuffle', 'Acak', { type: 'shuffle' }, c.shuffle ? 'active' : '')}{control('previous', 'Lagu sebelumnya', { type: 'skip-track', direction: -1 })}
          {control(c.isPlaying ? 'pause' : 'play', 'Putar / jeda', { type: 'play' }, 'player-play')}{control('next', 'Lagu berikutnya', { type: 'skip-track', direction: 1 })}{control('repeat', 'Ulang', { type: 'repeat' }, c.repeat ? 'active' : '')}</div>
        <div className="native-player-tools">{control('music', 'Antrean', { type: 'go', screen: 'queue' })}{control('share', 'Bagikan', { type: 'overlay', value: 'share' })}
          <NativeControl onAction={action} action={{ type: 'go', screen: 'lyrics' }} label="Lirik">{text('lyrics', 'Lyrics', 'Lirik')}</NativeControl></div>
        {screen === 'share' && <div className="native-share-card"><b>{c.song}</b><p>{c.shareCaption}</p></div>}
      </div> : screen === 'lyrics' ? <div className="native-lyrics" data-edit-target="lyrics">{(c.lyrics || '').split('\n').map((line, i) => <p className={i === c.lyricActiveLine ? 'active' : ''} key={i}>{line}</p>)}</div>
        : <div className="native-track-list" data-edit-target="tracks">{screen !== 'queue' && <>{showImage(c.albumArt || c.imageUrl, 'Sampul', 'native-playlist-cover')}<h2>{c.title || c.song}</h2><p>{c.artist || c.bio}</p></>}
          {tracks.map((track, i) => <NativeControl key={track.id} className="native-track-row" label={track.title} onAction={action} action={{ type: 'track', track }} target={`track:${track.id}`}>
            <small>{i + 1}</small>{track.imageUrl && showImage(track.imageUrl, 'Sampul lagu')}<span><strong>{track.title}</strong><small>{track.artist}</small></span><small>{track.duration}</small></NativeControl>)}</div>)}{!['player', 'share', 'lyrics'].includes(screen) && tabs()}</>;
  } else if (app === 'notes' && screen === 'note') {
    body = <>{header(text('notes', 'Notes', 'Catatan'), control('more', 'Format catatan', { type: 'overlay', value: 'screen-menu' }))}
      {viewport(<article className="native-note" data-edit-target="note"><small data-edit-target="timestamp">{c.timestamp}</small>
        <h1 data-edit-target="note-title">{c.title}</h1><p data-edit-target="note-text" style={{ fontWeight: c.noteBold ? 700 : 400 }}>{c.text}</p>
        {c.images?.map((item, i) => <React.Fragment key={item.id || i}>{showImage(item.src || item.url || item, `Gambar catatan ${i + 1}`)}</React.Fragment>)}
        {(c.checklist || []).map(item => <div key={item.id} data-edit-target={`check:${item.id}`}>{item.checked ? '☑' : '◯'} {item.text}</div>)}</article>)}
      <div className="native-note-toolbar" data-edit-target="note-toolbar">{control('plus', 'Tambah isi', { type: 'edit', target: 'note-text' })}<span>Aa</span>
        {control('camera', 'Lampiran catatan', { type: 'edit', target: 'scene-images' })}{control('share', 'Bagikan', { type: 'overlay', value: 'share' })}</div></>;
  } else if (screen === 'notes') body = <>{header('Notes')}{viewport(<div className="native-note-bubbles" data-edit-target="notes"><Avatar person={person} size={110} /><div>{c.noteText || c.text}</div><p>{person.name}</p></div>)}{tabs()}</>;
  else body = <>{header(definition?.name || 'Adegan')}{viewport(<p data-edit-target="scene-content">{c.text}</p>)}</>;

  return <div className={`app-scene app-${app} scene-${screen} ${platform} ${theme} ${c.showKeyboard ? 'keyboard-open' : ''}`}
    style={{ '--app-accent': app === 'whatsapp' ? whatsappColors(c, theme)['--wa-accent'] : c.accentColor || definition?.accent,
      ...(app === 'whatsapp' ? whatsappColors(c, theme) : {}),
      ...(c.backgroundColor ? { '--app-background': c.backgroundColor } : {}),
      ...(c.backgroundColor ? { '--chat-color': c.backgroundColor } : {}),
      ...(c.headerColor ? { '--app-header': c.headerColor } : {}),
      ...(c.incomingColor ? { '--bubble-incoming': c.incomingColor } : {}),
      ...(c.outgoingColor ? { '--bubble-outgoing': c.outgoingColor } : {}),
      ...(c.incomingTextColor ? { '--bubble-incoming-text': c.incomingTextColor } : {}),
      ...(c.outgoingTextColor ? { '--bubble-outgoing-text': c.outgoingTextColor } : {}),
      ...(c.headerTextColor ? { '--app-header-text': c.headerTextColor } : {}),
      ...(c.inputColor ? { '--composer-background': c.inputColor } : {}),
      ...(c.inputTextColor ? { '--composer-text': c.inputTextColor } : {}),
      ...(c.textColor ? { '--app-text': c.textColor } : {}),
      ...(c.mutedColor ? { '--app-muted': c.mutedColor } : {}),
      ...(c.lineColor ? { '--app-line': c.lineColor } : {}),
      ...(c.customWallpaper ? { '--chat-wallpaper': `url(${c.customWallpaper})` } : app === 'whatsapp' && c.chatPalette === 'ocean' && theme === 'dark'
        ? { '--chat-wallpaper': 'linear-gradient(to bottom, #041e30, #03070b 160px)' } : {}) }}>
    {body}
    {state.overlay && <div className={`native-overlay overlay-${state.overlay}`} data-edit-target="overlay">
      <div className="native-overlay-dimmer" onClick={action ? () => action({ type: 'close-overlay' }) : undefined} />
      <section className="native-overlay-sheet"><div className="native-overlay-heading"><strong>{c.overlayTitle || (state.overlay === 'stickers' ? text('stickers', 'Stickers', 'Stiker')
        : state.overlay === 'attachments' ? text('attach', 'Attach', 'Lampiran') : state.overlay === 'message-menu' ? text('message', 'Message', 'Pesan') : text('menu', 'Menu', 'Menu'))}</strong>
        {control('close', 'Tutup menu', { type: 'close-overlay' })}</div>
        {state.overlay === 'message-menu' || state.overlay === 'facebook-reactions' ? <>
          <div className="native-reaction-picker">{['👍', '❤️', '😂', '😮', '😢', '🙏'].map(value => <NativeControl key={value} onAction={action} label={value}
            action={{ type: state.overlay === 'facebook-reactions' ? 'facebook-reaction' : 'react', value }}>{value}</NativeControl>)}</div>
          {state.overlay === 'message-menu' && [['reply', 'Balas'], ['forward', 'Teruskan'], ['pin', 'Sematkan'], ['edit-message', 'Edit'], ['delete', 'Hapus']].map(([type, label]) =>
            <NativeControl key={type} className="native-menu-row" label={label} onAction={action} action={{ type }}>{text(type, { reply: 'Reply', forward: 'Forward', pin: 'Pin', 'edit-message': 'Edit', delete: 'Delete' }[type], label)}</NativeControl>)}
        </> : state.overlay === 'attachments' ? <div className="native-attachment-grid">{(MESSAGE_KINDS[app] || ['image', 'sticker']).filter(kind => !['text', 'deleted', 'system', 'voice', 'gif'].includes(kind)).map(kind =>
          <NativeControl key={kind} label={MESSAGE_LABELS[kind]} action={{ type: ['image', 'video', 'sticker', 'album'].includes(kind) ? 'pick-media' : 'add-card', kind }} onAction={action}>
            <NativeIcon name={kind === 'sticker' ? 'sticker' : kind === 'video' ? 'video' : kind === 'image' || kind === 'album' ? 'image' : kind === 'location' ? 'location' : kind === 'contact' ? 'person' : 'file'} size={30} /><small>{MESSAGE_LABELS[kind]}</small></NativeControl>)}
        </div> : state.overlay === 'stickers' ? <><div className="native-sticker-tray">{(project.stickerLibrary || []).map(item => <NativeControl key={item.id} label={item.name || 'Stiker'} onAction={action}
          action={{ type: 'send-sticker', url: item.url }}><img src={item.url} alt={item.name || 'Stiker'} /></NativeControl>)}
          <NativeControl label="Tambah stiker" action={{ type: 'pick-media', kind: 'sticker' }} onAction={action}><NativeIcon name="plus" size={38} /></NativeControl></div>
          <div className="native-reaction-picker">{EMOJI_KEYS.slice(0, 12).map(value => <NativeControl key={value} label={value} action={{ type: 'key', value }} onAction={action}>{value}</NativeControl>)}</div></>
          : state.overlay === 'share' ? <><div className="native-share-preview" data-edit-target="share-caption">{c.shareCaption || c.song || c.title || c.text}</div>
            {(c.contacts || []).map(item => <NativeControl key={item.id} onAction={action} action={definition.screens.includes('chat')
              ? { type: 'go', screen: 'chat', personId: item.characterId } : { type: 'edit', target: 'share-caption' }} label={item.name || getPerson(item.characterId).name} className="native-menu-row">
              <Avatar person={getPerson(item.characterId)} size={32} /> {item.name || getPerson(item.characterId).name}</NativeControl>)}</>
          : state.overlay === 'dialpad' ? <><p className="native-dial-number" data-edit-target="dialed-number">{c.dialedNumber || ''}</p><div className="native-dialpad">{'123456789*0#'.split('').map(value =>
            <NativeControl key={value} label={value} onAction={action} action={{ type: 'dial', value }}>{value}</NativeControl>)}</div></>
          : <>{isConversation(screen) && definition.screens.includes('info') && <NativeControl onAction={action} action={{ type: 'go', screen: 'info' }} label="Info percakapan" className="native-menu-row">{text('info', 'Contact info', 'Info percakapan')}</NativeControl>}
            {definition.screens.includes('media') && <NativeControl onAction={action} action={{ type: 'go', screen: 'media' }} label="Media" className="native-menu-row">{text('mediaLinks', 'Media, links and docs', 'Media, tautan, dan dokumen')}</NativeControl>}
            {app === 'notes' && <NativeControl onAction={action} action={{ type: 'note-bold' }} label="Teks tebal" className="native-menu-row">{text('bold', 'Bold', 'Tebal')} {c.noteBold ? '✓' : ''}</NativeControl>}
            <NativeControl onAction={action} action={{ type: 'overlay', value: 'share' }} label="Bagikan" className="native-menu-row">{text('share', 'Share', 'Bagikan')}</NativeControl>
          </>}
      </section>
    </div>}
    {picker && <div className="no-export"><AssetPickerModal isOpen type={picker === 'sticker' ? 'sticker' : 'wallpaper'} onClose={() => setPicker(null)}
      onSelect={url => { append(picker === 'album' ? { kind: 'album', images: [{ id: crypto.randomUUID(), src: url }] }
        : { kind: picker, [picker === 'sticker' ? 'stickerUrl' : 'mediaUrl']: url }); setPicker(null); }} /></div>}
  </div>;
}
