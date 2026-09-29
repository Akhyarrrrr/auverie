import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { PHONE_MODELS } from '../../data/samplePresets';
import { WHATSAPP_THEMES, whatsappColors } from '../../data/whatsappThemes';
import AssetPickerModal from './AssetPickerModal';
import SceneInspector, { OutputSettings } from './SceneInspector';

const id = () => crypto.randomUUID();
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const CHAT_TYPES = ['wa_chat', 'wa_group', 'x_dm', 'ig_dm'];
const BLOCK_TYPES = [
  ['text', 'Teks'], ['image', 'Gambar'], ['chat', 'Chat'], ['button', 'Tombol'],
  ['appbar', 'Bar aplikasi'], ['notification', 'Notifikasi'], ['media', 'Media / poster video']
];

function Field({ label, value, onChange, placeholder = '', multiline = false, type = 'text', min, max }) {
  return <label className="field"><span>{label}</span>{multiline
    ? <textarea aria-label={label} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
    : <input aria-label={label} type={type} min={min} max={max} value={value ?? ''} onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} />}</label>;
}

function Toggle({ label, checked, onChange }) {
  return <label className="toggle-field"><span>{label}</span><input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} /></label>;
}

function Choice({ label, value, onChange, options }) {
  return <label className="field"><span>{label}</span><select aria-label={label} value={value ?? ''} onChange={e => onChange(e.target.value)}>
    {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
  </select></label>;
}

function PersonChoice({ label, value, onChange, characters, self = false }) {
  return <Choice label={label} value={value || (self ? 'me' : characters[0]?.id || '')} onChange={onChange}
    options={[...(self ? [['me', 'Saya']] : []), ...characters.map(c => [c.id, c.name])]} />;
}

function ImageField({ label, value, onPick, onClear }) {
  return <div className="field"><span>{label}</span><div className="asset-control">
    {value && <img src={value} alt="" />}
    <button className="button secondary" onClick={onPick} type="button"><ImagePlus size={16} /> {value ? 'Ganti gambar' : 'Pilih atau unggah'}</button>
    {value && <button className="text-button" onClick={onClear} type="button">Hapus</button>}
  </div></div>;
}

function Section({ title, children, target }) {
  return <section className="inspector-section" data-field-key={target}><h3>{title}</h3>{children}</section>;
}

export default function SlideInspector() {
  const { project, activeSlide, updateSlideContent, updateSlideMeta, duplicateSlide, deleteSlide,
    editTarget, setEditTarget } = useProject();
  const [advanced, setAdvanced] = useState(false);
  const [picker, setPicker] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!editTarget) return;
    if (editTarget === 'story-stickers' || editTarget === 'lock-music' || editTarget === 'replies'
      || editTarget.startsWith('comment:') || (activeSlide?.type?.startsWith('x_') && editTarget === 'post')) {
      if (!advanced) { setAdvanced(true); return; }
    }
    const target = [...document.querySelectorAll('[data-field-key]')]
      .find(node => node.dataset.fieldKey === editTarget);
    target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [editTarget, activeSlide?.id, activeSlide?.type, advanced]);

  if (!activeSlide) return <aside className="inspector-panel"><p>Pilih slide untuk mulai mengedit.</p></aside>;
  const slide = activeSlide;
  const c = slide.content || {};
  const patch = changes => updateSlideContent(slide.id, changes);
  const patchNested = (key, changes) => patch({ [key]: { ...(c[key] || {}), ...changes } });
  const changeItem = (key, itemId, changes) => updateSlideContent(slide.id, previous => ({
    ...previous, [key]: (previous[key] || []).map(item => item.id === itemId ? { ...item, ...changes } : item)
  }));
  const addItem = (key, item) => updateSlideContent(slide.id, previous => ({
    ...previous, [key]: [...(previous[key] || []), { id: id(), ...item }]
  }));
  const removeItem = (key, itemId) => updateSlideContent(slide.id, previous => ({
    ...previous, [key]: (previous[key] || []).filter(item => item.id !== itemId)
  }));
  const moveItem = (key, index, direction) => updateSlideContent(slide.id, previous => {
    const items = [...(previous[key] || [])];
    const other = index + direction;
    if (other < 0 || other >= items.length) return previous;
    [items[index], items[other]] = [items[other], items[index]];
    return { ...previous, [key]: items };
  });
  const pick = (value, apply, type = 'wallpaper') => setPicker({ value, apply, type });
  const image = (label, value, apply, type) => <ImageField label={label} value={value}
    onPick={() => pick(value, apply, type)} onClear={() => apply('')} />;
  const setOverride = (key, value) => {
    const next = { ...(slide.customSettings || {}) };
    if (value === '') delete next[key];
    else next[key] = value;
    if (key === 'phoneModel') delete next.bezelColor;
    updateSlideMeta(slide.id, { customSettings: next });
  };
  const selectedClass = target => editTarget === target ? 'edit-card selected' : 'edit-card';
  const selectCard = target => setEditTarget(target);
  const modelId = slide.customSettings?.phoneModel || project.globalSettings.phoneModel;
  const isAndroid = modelId?.startsWith('samsung');
  const waTheme = slide.customSettings?.theme || project.globalSettings.theme || 'dark';
  const waColors = whatsappColors(c, waTheme);
  const modern = slide.renderVersion === 3 || slide.type === 'app_scene' || slide.type === 'composition';
  const controls = { Field, Choice, Toggle, PersonChoice, Section };
  const setWaPalette = chatPalette => {
    const keys = ['backgroundColor', 'incomingColor', 'outgoingColor', 'headerColor', 'accentColor', 'inputColor',
      'outgoingTextColor', 'incomingTextColor', 'headerTextColor', 'inputTextColor'];
    if (chatPalette === 'custom') patch({ chatPalette,
      backgroundColor: waColors['--wa-background'], incomingColor: waColors['--wa-incoming'],
      outgoingColor: waColors['--wa-outgoing'], headerColor: waColors['--wa-header'],
      accentColor: waColors['--wa-accent'], inputColor: waColors['--wa-input'],
      outgoingTextColor: waColors['--wa-outgoing-text'], incomingTextColor: waColors['--wa-incoming-text'],
      headerTextColor: waColors['--wa-header-text'], inputTextColor: waColors['--wa-input-text']
    });
    else patch({ chatPalette, ...Object.fromEntries(keys.map(key => [key, ''])) });
  };

  return <aside className="inspector-panel">
    <div className="inspector-header">
      <div><h2>Edit slide {slide.order}</h2><span>Perubahan langsung terlihat di pratinjau</span></div>
      <div className="inspector-actions">
        <button className="icon-button" title="Duplikasi slide" aria-label="Duplikasi slide" onClick={() => duplicateSlide(slide.id)}><Copy size={16} /></button>
        <button className="icon-button danger" title="Hapus slide" aria-label="Hapus slide" onClick={() => {
          if (!deleteSlide(slide.id)) setNotice('Cerita harus memiliki setidaknya satu slide.');
        }}><Trash2 size={16} /></button>
      </div>
    </div>
    <div className="inspector-content">
      {notice && <p className="inline-notice" role="status">{notice}</p>}
      <div className="mode-switch" role="group" aria-label="Mode pengaturan">
        <button className={!advanced ? 'active' : ''} onClick={() => setAdvanced(false)}>Mudah</button>
        <button className={advanced ? 'active' : ''} onClick={() => setAdvanced(true)}>Lanjut</button>
      </div>
      <Field label="Nama slide" value={slide.title} onChange={title => updateSlideMeta(slide.id, { title })} />

      {modern && <SceneInspector controls={controls} image={image} advanced={advanced} />}
      {!modern && CHAT_TYPES.includes(slide.type) && <>
        <Section title="Percakapan" target="chat-header">
          {slide.type === 'wa_group'
            ? <><Field label="Nama grup" value={c.groupTitle} onChange={groupTitle => patch({ groupTitle })} />
              {image('Foto grup', c.groupAvatar, groupAvatar => patch({ groupAvatar }))}</>
            : <PersonChoice label="Lawan bicara" value={c.targetCharacterId} characters={project.characters}
              onChange={targetCharacterId => patch({ targetCharacterId })} />}
          {slide.type.startsWith('wa_') && <Field label="Info di bawah nama" value={c.statusText} onChange={statusText => patch({ statusText })} placeholder="online" />}
          {slide.type === 'ig_dm' && <Field label="Penanda dilihat" value={c.seenText} onChange={seenText => patch({ seenText })} />}
          {slide.type === 'ig_dm' && <Toggle label="Tampilkan status aktif" checked={c.isActive !== false}
            onChange={isActive => patch({ isActive })} />}
        </Section>
        {slide.type.startsWith('wa_') && <>
          <Section title="Tampilan WhatsApp">
            <Choice label="Terang atau gelap" value={slide.customSettings?.theme || ''}
              options={[[ '', 'Ikuti pengaturan HP' ], [ 'light', 'Terang' ], [ 'dark', 'Gelap' ]]}
              onChange={value => setOverride('theme', value)} />
            <Choice label="Warna awal" value={c.chatPalette || 'classic'} options={WHATSAPP_THEMES}
              onChange={setWaPalette} />
            {c.chatPalette === 'custom' && <>
              <div className="field-row"><Field label="Latar chat" type="color" value={c.backgroundColor || waColors['--wa-background']}
                onChange={backgroundColor => patch({ backgroundColor })} />
                <Field label="Bubble saya" type="color" value={c.outgoingColor || waColors['--wa-outgoing']}
                  onChange={outgoingColor => patch({ outgoingColor })} /></div>
              <div className="field-row"><Field label="Bubble lawan bicara" type="color" value={c.incomingColor || waColors['--wa-incoming']}
                onChange={incomingColor => patch({ incomingColor })} />
                <Field label="Header" type="color" value={c.headerColor || waColors['--wa-header']}
                  onChange={headerColor => patch({ headerColor })} /></div>
              <div className="field-row"><Field label="Aksen tombol" type="color" value={c.accentColor || waColors['--wa-accent']}
                onChange={accentColor => patch({ accentColor })} />
                <Field label="Kolom ketik" type="color" value={c.inputColor || waColors['--wa-input']}
                  onChange={inputColor => patch({ inputColor })} /></div>
              <div className="field-row"><Field label="Teks bubble saya" type="color" value={c.outgoingTextColor || waColors['--wa-outgoing-text']}
                onChange={outgoingTextColor => patch({ outgoingTextColor })} />
                <Field label="Teks bubble lawan bicara" type="color" value={c.incomingTextColor || waColors['--wa-incoming-text']}
                  onChange={incomingTextColor => patch({ incomingTextColor })} /></div>
              <div className="field-row"><Field label="Teks header" type="color" value={c.headerTextColor || waColors['--wa-header-text']}
                onChange={headerTextColor => patch({ headerTextColor })} />
                <Field label="Teks kolom ketik" type="color" value={c.inputTextColor || waColors['--wa-input-text']}
                  onChange={inputTextColor => patch({ inputTextColor })} /></div>
            </>}
            <Choice label="Pola latar" value={c.wallpaperPattern || 'auto'}
              options={[[ 'auto', 'Sesuai warna awal' ], [ 'plain', 'Polos' ], [ 'doodle', 'Titik halus' ], [ 'gradient', 'Gradasi' ]]}
              onChange={wallpaperPattern => patch({ wallpaperPattern })} />
            {image('Wallpaper chat', c.customWallpaper, customWallpaper => patch({ customWallpaper }))}
          </Section>
          <Section title="Saat percakapan dibuka" target="composer">
            <Toggle label="Tampilkan keyboard" checked={c.showKeyboard} onChange={showKeyboard => patch({ showKeyboard })} />
            <Field label="Teks yang sedang diketik" value={c.draftText} onChange={draftText => patch({ draftText })}
              placeholder="Kosongkan untuk kolom pesan kosong" />
            <Toggle label="Lawan bicara sedang mengetik" checked={c.showTypingIndicator}
              onChange={showTypingIndicator => patch({ showTypingIndicator })} />
            {advanced && <><Field label="Jumlah chat di tombol kembali" value={c.backCount} onChange={backCount => patch({ backCount })}
              placeholder="Kosongkan untuk menyembunyikan" />
              <Field label="Pesan belum dibaca" type="number" min={0} value={c.unreadCount || 0}
                onChange={unreadCount => patch({ unreadCount: Math.max(0, unreadCount) })} />
              <Field label="Label hari" value={c.dateLabel ?? 'HARI INI'} onChange={dateLabel => patch({ dateLabel })} /></>}
          </Section>
        </>}
        <Section title={'Pesan · ' + (c.messages?.length || 0)} target="messages">
          {(c.messages || []).map((message, index) => <div key={message.id}
            className={selectedClass('message:' + message.id)} data-field-key={'message:' + message.id}
            onClick={() => selectCard('message:' + message.id)}>
            <div className="edit-card-heading"><strong>Pesan {index + 1}</strong><div>
              <button onClick={() => moveItem('messages', index, -1)} disabled={index === 0} aria-label="Geser pesan ke atas"><ArrowUp size={15} /></button>
              <button onClick={() => moveItem('messages', index, 1)} disabled={index === c.messages.length - 1} aria-label="Geser pesan ke bawah"><ArrowDown size={15} /></button>
              <button onClick={() => removeItem('messages', message.id)} aria-label="Hapus pesan"><Trash2 size={15} /></button>
            </div></div>
            <PersonChoice label="Pengirim" value={message.senderId} characters={project.characters} self
              onChange={senderId => changeItem('messages', message.id, { senderId })} />
            {(!slide.type.startsWith('wa_') || !['sticker', 'voice', 'deleted'].includes(message.kind)) &&
              <Field label={message.kind === 'image' ? 'Keterangan foto' : 'Isi pesan'} value={message.text} multiline
                onChange={text => changeItem('messages', message.id, { text })} />}
            <div className="field-row">
              <Field label="Waktu" value={message.time} onChange={time => changeItem('messages', message.id, { time })} />
              {slide.type.startsWith('wa_') && <Choice label="Jenis" value={message.kind || (message.isDeleted ? 'deleted' : message.isVoiceNote ? 'voice' : message.mediaUrl ? 'image' : 'text')}
                options={[[ 'text', 'Teks' ], [ 'image', 'Foto' ], [ 'sticker', 'Stiker' ], [ 'voice', 'Voice note' ], [ 'deleted', 'Dihapus' ]]}
                onChange={kind => changeItem('messages', message.id, { kind })} />}
            </div>
            {slide.type.startsWith('wa_') && (message.kind === 'sticker') && image('Gambar stiker (PNG atau WebP transparan)', message.stickerUrl,
              stickerUrl => changeItem('messages', message.id, { stickerUrl }), 'sticker')}
            {(!slide.type.startsWith('wa_') || message.kind === 'image' || (!message.kind && !!message.mediaUrl)) && image('Foto pesan', message.mediaUrl,
              mediaUrl => changeItem('messages', message.id, { mediaUrl }))}
            {advanced && <>
              {slide.type.startsWith('wa_') && <>
                <Choice label="Status terkirim" value={message.status || 'sent'}
                  options={[[ 'sent', 'Terkirim' ], [ 'delivered', 'Sampai' ], [ 'read', 'Dibaca' ]]}
                  onChange={status => changeItem('messages', message.id, { status })} />
                <Toggle label="Pesan diteruskan" checked={message.isForwarded} onChange={isForwarded => changeItem('messages', message.id, { isForwarded })} />
                <Toggle label="Tampilkan ekor bubble" checked={message.hasTail !== false} onChange={hasTail => changeItem('messages', message.id, { hasTail })} />
                {(message.kind === 'voice' || (!message.kind && message.isVoiceNote)) && <Field label="Durasi voice note" value={message.voiceDuration || '0:24'}
                  onChange={voiceDuration => changeItem('messages', message.id, { voiceDuration })} />}
                <Field label="Kutip pesan" value={message.replyTo?.textPreview || ''}
                  onChange={textPreview => changeItem('messages', message.id, { replyTo: textPreview ? {
                    senderName: message.replyTo?.senderName || 'Lawan bicara', textPreview
                  } : null })} placeholder="Kosongkan jika tanpa kutipan" />
                {message.replyTo && <Field label="Nama pengirim kutipan" value={message.replyTo.senderName}
                  onChange={senderName => changeItem('messages', message.id, { replyTo: { ...message.replyTo, senderName } })} />}
              </>}
              <Field label="Reaksi emoji (pisahkan koma)" value={(message.reactions || []).join(', ')}
                onChange={value => changeItem('messages', message.id, { reactions: value.split(',').map(item => item.trim()).filter(Boolean) })} />
            </>}
          </div>)}
          <button className="button secondary full" onClick={() => addItem('messages', {
            senderId: 'me', text: '', time: project.globalSettings.time || '23:45', status: 'read'
          })}><Plus size={17} /> Tambah pesan</button>
        </Section>
      </>}

      {!modern && (slide.type === 'x_tweet' || slide.type === 'x_thread') && <>
        <Section title="Postingan" target="post-text">
          <PersonChoice label="Penulis" value={c.authorId} characters={project.characters} onChange={authorId => patch({ authorId })} />
          <Field label="Isi postingan" value={c.text} multiline onChange={text => patch({ text })} />
          {image('Foto atau media', c.mediaUrl, mediaUrl => patch({ mediaUrl }))}
        </Section>
        {advanced && <>
          <Section title="Detail postingan" target="post">
            <Field label="Waktu dan tanggal" value={c.timestamp} onChange={timestamp => patch({ timestamp })} />
            <Field label="Sumber perangkat" value={c.client} onChange={client => patch({ client })} placeholder="X for iPhone" />
            <div className="field-row">
              <Field label="Suka" value={c.likesCount} onChange={likesCount => patch({ likesCount })} />
              <Field label="Repost" value={c.retweetsCount} onChange={retweetsCount => patch({ retweetsCount })} />
            </div>
            <div className="field-row">
              <Field label="Markah" value={c.bookmarksCount} onChange={bookmarksCount => patch({ bookmarksCount })} />
              <Field label="Tayangan" value={c.viewsCount} onChange={viewsCount => patch({ viewsCount })} />
            </div>
            <Toggle label="Kutip postingan" checked={c.quoteTweet?.enabled} onChange={enabled => patchNested('quoteTweet', { enabled })} />
            {c.quoteTweet?.enabled && <>
              <PersonChoice label="Penulis kutipan" value={c.quoteTweet.authorId} characters={project.characters}
                onChange={authorId => patchNested('quoteTweet', { authorId })} />
              <Field label="Isi kutipan" value={c.quoteTweet.text} multiline onChange={text => patchNested('quoteTweet', { text })} />
            </>}
            <Toggle label="Polling" checked={c.poll?.enabled} onChange={enabled => patchNested('poll', {
              enabled, options: c.poll?.options?.length ? c.poll.options : [{ text: 'Pilihan 1', percent: 50 }, { text: 'Pilihan 2', percent: 50 }]
            })} />
            {c.poll?.enabled && <>
              {(c.poll.options || []).map((option, index) => <div className="field-row" key={index}>
                <Field label={'Pilihan ' + (index + 1)} value={option.text} onChange={text => patchNested('poll', {
                  options: c.poll.options.map((item, i) => i === index ? { ...item, text } : item)
                })} />
                <Field label="Persen" type="number" min={0} max={100} value={option.percent} onChange={percent => patchNested('poll', {
                  options: c.poll.options.map((item, i) => i === index ? { ...item, percent: Math.max(0, Math.min(100, percent)) } : item)
                })} />
              </div>)}
              <Field label="Jumlah suara" value={c.poll.totalVotes} onChange={totalVotes => patchNested('poll', { totalVotes })} />
            </>}
          </Section>
          <Section title={'Balasan · ' + (c.replies?.length || 0)} target="replies">
            {(c.replies || []).map((reply, index) => <div className="edit-card" key={reply.id}>
              <div className="edit-card-heading"><strong>Balasan {index + 1}</strong><button onClick={() => removeItem('replies', reply.id)} aria-label="Hapus balasan"><Trash2 size={15} /></button></div>
              <PersonChoice label="Penulis" value={reply.authorId} characters={project.characters}
                onChange={authorId => changeItem('replies', reply.id, { authorId })} />
              <Field label="Isi balasan" value={reply.text} multiline onChange={text => changeItem('replies', reply.id, { text })} />
              <div className="field-row"><Field label="Waktu" value={reply.timestamp} onChange={timestamp => changeItem('replies', reply.id, { timestamp })} />
                <Field label="Suka" value={reply.likesCount} onChange={likesCount => changeItem('replies', reply.id, { likesCount })} /></div>
              {image('Media', reply.mediaUrl, mediaUrl => changeItem('replies', reply.id, { mediaUrl }))}
              <div className="field-row"><Field label="Balasan" value={reply.repliesCount ?? '0'}
                onChange={repliesCount => changeItem('replies', reply.id, { repliesCount })} />
                <Field label="Repost" value={reply.retweetsCount ?? '0'}
                  onChange={retweetsCount => changeItem('replies', reply.id, { retweetsCount })} /></div>
            </div>)}
            <button className="button secondary full" onClick={() => addItem('replies', {
              authorId: project.characters[0]?.id, text: '', timestamp: '1m', likesCount: '0', repliesCount: '0', retweetsCount: '0'
            })}><Plus size={17} /> Tambah balasan</button>
          </Section>
        </>}
      </>}

      {!modern && slide.type === 'ig_post' && <>
        <Section title="Postingan Instagram" target="post">
          <PersonChoice label="Akun" value={c.authorId} characters={project.characters} onChange={authorId => patch({ authorId })} />
          {image('Foto postingan', c.imageUrl, imageUrl => patch({ imageUrl }))}
          <Field label="Keterangan" value={c.caption} multiline onChange={caption => patch({ caption })} />
          <Field label="Jumlah suka" value={c.likesCount} onChange={likesCount => patch({ likesCount })} />
        </Section>
        {advanced && <Section title={'Komentar · ' + (c.comments?.length || 0)} target="comments">
          {(c.comments || []).map(comment => <div key={comment.id} className="edit-card" data-field-key={'comment:' + comment.id}>
            <div className="edit-card-heading"><strong>Komentar</strong><button onClick={() => removeItem('comments', comment.id)} aria-label="Hapus komentar"><Trash2 size={15} /></button></div>
            <PersonChoice label="Akun" value={comment.authorId} characters={project.characters}
              onChange={authorId => changeItem('comments', comment.id, { authorId })} />
            <Field label="Isi komentar" value={comment.text} onChange={text => changeItem('comments', comment.id, { text })} />
          </div>)}
          <button className="button secondary full" onClick={() => addItem('comments', { authorId: project.characters[0]?.id, text: '' })}><Plus size={17} /> Tambah komentar</button>
        </Section>}
      </>}

      {!modern && slide.type === 'ig_story' && <>
        <Section title="Story Instagram" target="story-caption">
          <PersonChoice label="Akun" value={c.authorId} characters={project.characters} onChange={authorId => patch({ authorId })} />
          {image('Latar story', c.backgroundUrl, backgroundUrl => patch({ backgroundUrl }))}
          <Field label="Warna latar" type="color" value={c.backgroundColor || '#715d72'}
            onChange={backgroundColor => patch({ backgroundColor })} />
          <Field label="Teks story" value={c.caption} multiline onChange={caption => patch({ caption })} />
          <Toggle label="Teman dekat" checked={c.isCloseFriends} onChange={isCloseFriends => patch({ isCloseFriends })} />
        </Section>
        {advanced && <Section title="Detail story" target="story-stickers">
          <Field label="Waktu story" value={c.storyTime} onChange={storyTime => patch({ storyTime })} placeholder="14m" />
          <Field label="Jumlah segmen" type="number" min={1} max={10} value={c.storySegments ?? 3}
            onChange={storySegments => patch({ storySegments: Math.max(1, Math.min(10, storySegments)) })} />
          <Toggle label="Stiker musik" checked={c.musicSticker?.enabled ?? !!c.musicSticker?.song}
            onChange={enabled => patchNested('musicSticker', { enabled })} />
          {(c.musicSticker?.enabled ?? !!c.musicSticker?.song) && <>
            <Field label="Judul lagu" value={c.musicSticker?.song} onChange={song => patchNested('musicSticker', { song })} />
            <Field label="Artis" value={c.musicSticker?.artist} onChange={artist => patchNested('musicSticker', { artist })} />
            {image('Sampul lagu', c.musicSticker?.albumArt, albumArt => patchNested('musicSticker', { albumArt }))}
          </>}
          <Toggle label="Stiker pertanyaan" checked={c.questionSticker?.enabled} onChange={enabled => patchNested('questionSticker', { enabled })} />
          {c.questionSticker?.enabled && <Field label="Pertanyaan" value={c.questionSticker.prompt}
            onChange={prompt => patchNested('questionSticker', { prompt })} />}
        </Section>}
      </>}

      {slide.type === 'lockscreen' && <>
        <Section title="Layar kunci" target="lock-clock">
          {image('Wallpaper', c.wallpaperUrl, wallpaperUrl => patch({ wallpaperUrl }))}
          <Field label="Warna latar" type="color" value={c.backgroundColor || '#455c69'}
            onChange={backgroundColor => patch({ backgroundColor })} />
          <Field label="Tanggal" value={c.dateString} onChange={dateString => patch({ dateString })} />
        </Section>
        <Section title={'Notifikasi · ' + (c.notifications?.length || 0)}>
          {(c.notifications || []).map((notification, index) => <div key={notification.id}
            className={selectedClass('notification:' + notification.id)} data-field-key={'notification:' + notification.id}>
            <div className="edit-card-heading"><strong>Notifikasi {index + 1}</strong><button onClick={() => removeItem('notifications', notification.id)} aria-label="Hapus notifikasi"><Trash2 size={15} /></button></div>
            <Choice label="Aplikasi" value={notification.app || 'whatsapp'}
              options={[[ 'whatsapp', 'WhatsApp' ], [ 'twitter', 'X' ], [ 'instagram', 'Instagram' ], [ 'messages', 'Pesan' ], [ 'custom', 'Aplikasi lain' ]]}
              onChange={app => changeItem('notifications', notification.id, { app })} />
            {notification.app === 'custom' && <Field label="Nama aplikasi" value={notification.appName}
              onChange={appName => changeItem('notifications', notification.id, { appName })} />}
            <Field label="Pengirim atau judul" value={notification.title} onChange={title => changeItem('notifications', notification.id, { title })} />
            <Field label="Isi notifikasi" value={notification.message} multiline onChange={message => changeItem('notifications', notification.id, { message })} />
            <Field label="Waktu" value={notification.time} onChange={time => changeItem('notifications', notification.id, { time })} />
          </div>)}
          <button className="button secondary full" onClick={() => addItem('notifications', {
            app: 'whatsapp', title: 'Pesan baru', message: '', time: 'Sekarang'
          })}><Plus size={17} /> Tambah notifikasi</button>
        </Section>
        {advanced && <Section title="Widget musik" target="lock-music">
          <Toggle label="Tampilkan musik" checked={c.music?.enabled ?? project.globalSettings.lockscreenMusic?.enabled}
            onChange={enabled => patchNested('music', { enabled })} />
          {(c.music?.enabled ?? project.globalSettings.lockscreenMusic?.enabled) && <>
            <Field label="Judul lagu" value={c.music?.title ?? project.globalSettings.lockscreenMusic?.title} onChange={title => patchNested('music', { title })} />
            <Field label="Artis" value={c.music?.artist ?? project.globalSettings.lockscreenMusic?.artist} onChange={artist => patchNested('music', { artist })} />
            {image('Sampul album', c.music?.albumArt ?? project.globalSettings.lockscreenMusic?.albumArt, albumArt => patchNested('music', { albumArt }))}
            <div className="field-row"><Field label="Posisi" value={c.music?.progress} onChange={progress => patchNested('music', { progress })} />
              <Field label="Durasi" value={c.music?.duration} onChange={duration => patchNested('music', { duration })} /></div>
            <Field label="Progress visual (%)" type="number" min={0} max={100}
              value={c.music?.progressPercent ?? project.globalSettings.lockscreenMusic?.progressPercent ?? 38}
              onChange={progressPercent => patchNested('music', { progressPercent: clamp(progressPercent, 0, 100) })} />
          </>}
        </Section>}
      </>}

      {slide.type === 'custom_app' && <>
        <Section title="Aplikasi bebas">
          <Field label="Nama aplikasi" value={c.appName} onChange={appName => patch({ appName })} />
          {image('Gambar dasar', c.backgroundUrl, backgroundUrl => patch({ backgroundUrl }))}
          <Field label="Warna latar" type="color" value={c.backgroundColor || '#f7f7f5'} onChange={backgroundColor => patch({ backgroundColor })} />
        </Section>
        <Section title={'Elemen · ' + (c.elements?.length || 0)}>
          <Choice label="Tambah elemen" value="" options={[[ '', 'Pilih jenis elemen' ], ...BLOCK_TYPES]}
            onChange={type => { if (type) addItem('elements', { type, text: '', title: '', src: '', x: 8, y: 16, width: 75,
              height: type === 'image' ? 25 : 8, fontSize: 16, color: '#202727', background: '', align: 'left', radius: 10 }); }} />
          {(c.elements || []).map((element, index) => <div key={element.id} className={selectedClass('element:' + element.id)}
            data-field-key={'element:' + element.id} onClick={() => selectCard('element:' + element.id)}>
            <div className="edit-card-heading"><strong>{BLOCK_TYPES.find(item => item[0] === element.type)?.[1]} {index + 1}</strong><div>
              <button onClick={() => moveItem('elements', index, -1)} disabled={index === 0} aria-label="Elemen ke belakang"><ArrowDown size={15} /></button>
              <button onClick={() => moveItem('elements', index, 1)} disabled={index === c.elements.length - 1} aria-label="Elemen ke depan"><ArrowUp size={15} /></button>
              <button onClick={() => removeItem('elements', element.id)} aria-label="Hapus elemen"><Trash2 size={15} /></button>
            </div></div>
            {['image', 'media'].includes(element.type)
              ? image('Gambar', element.src, src => changeItem('elements', element.id, { src }))
              : <Field label="Teks" value={element.text} multiline onChange={text => changeItem('elements', element.id, { text })} />}
            {element.type === 'media' && <><Choice label="Jenis media" value={element.mediaKind || 'video'} options={[[ 'video', 'Poster video' ], [ 'gif', 'GIF diam' ], [ 'image', 'Foto' ], [ 'sticker', 'Stiker' ], [ 'voice', 'Voice note' ], [ 'music', 'Musik' ]]}
              onChange={mediaKind => changeItem('elements', element.id, { mediaKind })} /><Field label="Durasi" value={element.duration} onChange={duration => changeItem('elements', element.id, { duration })} /></>}
            {element.type === 'notification' && <Field label="Judul" value={element.title}
              onChange={title => changeItem('elements', element.id, { title })} />}
            <div className="field-row">
              <Field label="X (%)" type="number" min={0} max={100} value={element.x}
                onChange={x => changeItem('elements', element.id, { x: clamp(x, 0, 100 - (element.width || 1)) })} />
              <Field label="Y (%)" type="number" min={0} max={100} value={element.y}
                onChange={y => changeItem('elements', element.id, { y: clamp(y, 0, 100 - (element.height || 1)) })} />
            </div>
            <div className="field-row">
              <Field label="Lebar (%)" type="number" min={1} max={100} value={element.width}
                onChange={width => changeItem('elements', element.id, { width: clamp(width, 1, 100 - (element.x || 0)) })} />
              <Field label="Tinggi (%)" type="number" min={1} max={100} value={element.height}
                onChange={height => changeItem('elements', element.id, { height: clamp(height, 1, 100 - (element.y || 0)) })} />
            </div>
            {advanced && <>
              <div className="field-row">
                <Field label="Ukuran huruf" type="number" min={8} max={72} value={element.fontSize}
                  onChange={fontSize => changeItem('elements', element.id, { fontSize: clamp(fontSize, 8, 72) })} />
                <Field label="Radius" type="number" min={0} max={60} value={element.radius}
                  onChange={radius => changeItem('elements', element.id, { radius: clamp(radius, 0, 60) })} />
              </div>
              <div className="field-row">
                <Field label="Warna teks" type="color" value={element.color || '#202727'} onChange={color => changeItem('elements', element.id, { color })} />
                <Field label="Warna blok" type="color" value={element.background || '#ffffff'} onChange={background => changeItem('elements', element.id, { background })} />
              </div>
              <Choice label="Rata teks" value={element.align || 'left'} onChange={align => changeItem('elements', element.id, { align })}
                options={[[ 'left', 'Kiri' ], [ 'center', 'Tengah' ], [ 'right', 'Kanan' ]]} />
            </>}
          </div>)}
        </Section>
      </>}

      <OutputSettings controls={controls} />
      {advanced && slide.type !== 'composition' && <Section title="Tampilan perangkat">
        <p className="field-hint">Kosongkan pilihan untuk mengikuti pengaturan proyek.</p>
        <Choice label="Model HP untuk slide ini" value={slide.customSettings?.phoneModel || ''}
          onChange={value => setOverride('phoneModel', value)}
          options={[[ '', 'Ikuti proyek' ], ...PHONE_MODELS.map(model => [model.id, model.name])]} />
        {modelId === 'frameless' && <Choice label="Sistem operasi" value={slide.customSettings?.os || 'ios'}
          onChange={value => setOverride('os', value)} options={[[ 'ios', 'iOS' ], [ 'android', 'Android' ]]} />}
        {(!slide.type.startsWith('wa_') || modern) && <Choice label="Tema aplikasi" value={slide.customSettings?.theme || ''} onChange={value => setOverride('theme', value)}
          options={[[ '', 'Ikuti proyek' ], [ 'light', 'Terang' ], [ 'dark', 'Gelap' ]]} />}
        <Field label="Jam pada slide" value={slide.customSettings?.time ?? ''} onChange={value => setOverride('time', value)}
          placeholder={project.globalSettings.time || '23:45'} />
        <Field label="Baterai (%)" type="number" min={1} max={100} value={slide.customSettings?.batteryLevel ?? project.globalSettings.batteryLevel}
          onChange={value => setOverride('batteryLevel', Math.max(1, Math.min(100, value)))} />
        <Choice label="Jaringan" value={slide.customSettings?.networkType || ''} onChange={value => setOverride('networkType', value)}
          options={[[ '', 'Ikuti proyek' ], [ 'WiFi', 'Wi-Fi' ], [ '5G', '5G' ], [ '4G', '4G' ], [ 'LTE', 'LTE' ]]} />
        {slide.type === 'lockscreen' && !isAndroid && <Choice label="Gaya jam" value={slide.customSettings?.lockscreenFont || ''}
          onChange={value => setOverride('lockscreenFont', value)}
          options={[[ '', 'Ikuti proyek' ], [ 'bold', 'Tebal' ], [ 'serif', 'Serif' ], [ 'modern', 'Modern' ]]} />}
      </Section>}
    </div>
    <AssetPickerModal isOpen={!!picker} onClose={() => setPicker(null)} type={picker?.type || 'wallpaper'} currentUrl={picker?.value || ''}
      onSelect={url => { picker?.apply(url); setPicker(null); }} />
  </aside>;
}
