import { useLayoutEffect, useState } from 'react';
import { useUI } from '../../context/UIContext';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { SCENE_APPS, SCREEN_LABELS, MESSAGE_KINDS, MESSAGE_LABELS, sceneIdentity } from '../../data/sceneCatalog';
import { captureScene, cropPreset, cropRectangle, sceneCrop, deviceMetrics, finite } from '../../services/sceneModel';
import { WHATSAPP_THEMES } from '../../data/whatsappThemes';
import { NATIVE_ICONS } from '../mockups/SceneParts';
import { contactFields, INBOX_FILTERS, sceneCapabilities, validOverlay } from '../../data/sceneCapabilities';

const uid = () => crypto.randomUUID();
const list = value => value.split(',').map(item => item.trim()).filter(Boolean);
const ICON_LABELS = {
  back: 'Kembali', close: 'Tutup', plus: 'Tambah', send: 'Kirim', phone: 'Telepon', video: 'Video', camera: 'Kamera', mic: 'Mikrofon',
  sticker: 'Stiker', heart: 'Hati', chat: 'Percakapan', play: 'Putar', pause: 'Jeda', search: 'Cari', more: 'Menu lainnya',
  check: 'Centang', checks: 'Dua centang', share: 'Bagikan', home: 'Beranda', bookmark: 'Simpan', person: 'Profil', bell: 'Notifikasi',
  image: 'Gambar', smile: 'Emoji', info: 'Info', arrow: 'Panah kanan', up: 'Panah atas', delete: 'Hapus', file: 'Dokumen', location: 'Lokasi',
  music: 'Musik', repeat: 'Ulang', like: 'Suka', speaker: 'Speaker', shuffle: 'Acak', previous: 'Sebelumnya', next: 'Berikutnya', return: 'Enter', keypad: 'Tombol angka'
};
const PALETTE = [['backgroundColor', 'Latar layar'], ['headerColor', 'Header'], ['headerTextColor', 'Teks header'],
  ['incomingColor', 'Bubble diterima'], ['incomingTextColor', 'Teks diterima'], ['outgoingColor', 'Bubble dikirim'],
  ['outgoingTextColor', 'Teks dikirim'], ['accentColor', 'Aksen / tombol'], ['inputColor', 'Kolom ketik'], ['inputTextColor', 'Teks kolom ketik'],
  ['keyboardBackground', 'Latar keyboard'], ['keyboardKeyColor', 'Tombol keyboard'], ['keyboardTextColor', 'Teks keyboard'],
  ['textColor', 'Teks utama'], ['mutedColor', 'Teks sekunder / waktu'], ['lineColor', 'Garis pemisah']];
const DEFAULT_COLORS = ['#ffffff', '#ffffff', '#111111', '#eeeeee', '#111111', '#007aff', '#ffffff', '#007aff', '#eeeeee', '#111111', '#d1d3d9', '#ffffff', '#111111', '#111111', '#888888', '#dddddd'];
const COLOR_VARIABLES = ['app-background', 'app-header', 'app-header-text', 'bubble-incoming', 'bubble-incoming-text', 'bubble-outgoing',
  'bubble-outgoing-text', 'app-accent', 'composer-background', 'composer-text', 'key-background', 'key-surface', 'key-text', 'app-text', 'app-muted', 'app-line'];
const colorHex = value => {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) return '#' + [...value.slice(1)].map(letter => letter + letter).join('');
  const rgb = value.match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);
  return rgb ? '#' + rgb.slice(1, 4).map(channel => Number(channel).toString(16).padStart(2, '0')).join('') : '';
};

export function OutputSettings({ controls, advanced }) {
  const { t } = useUI();
  const { activeSlide: slide, project, updateSlideMeta } = useProject();
  const { Field, Choice, Toggle, Section } = controls;
  if (slide.type === 'composition') return null;
  const size = deviceMetrics(slide, project.globalSettings), view = slide.viewport || {};
  const crop = cropRectangle(view.crop, size.width, size.height);
  const change = updates => updateSlideMeta(slide.id, { viewport: { ...view, ...updates } });
  return <Section title="Area layar dan hasil unduhan" target="viewport">
    <p className="field-hint">{t('Pilih bagian layar yang ingin dibagikan. Potongan tidak mengubah susunan teks.')}</p>
    <div className="crop-preview"><svg viewBox={`0 0 ${size.width} ${size.height}`} role="img" aria-label={t('Bagian layar yang akan diunduh')}><rect width={size.width} height={size.height} rx="16" fill="var(--bg-tertiary)" /><rect x={crop.x} y={crop.y} width={crop.width} height={crop.height} rx="4" fill="var(--bg-glass-active)" stroke="var(--accent-primary)" strokeWidth="5" /></svg><p>{t('Area hijau masuk ke gambar. Lihat hasil untuk memeriksa isi sebenarnya.')}</p></div>
    <Choice label="Potongan layar" value={view.cropPreset || 'full'} options={[
      ['full', 'Layar penuh'], ['top', 'Setengah atas'], ['bottom', 'Setengah bawah'], ['keyboard', 'Fokus keyboard'], ['manual', 'Atur sendiri']
    ]} onChange={name => change({ cropPreset: name, crop: name === 'manual' ? crop : cropPreset(name, size.width, size.height,
      finite(slide.content.keyboardHeight || size.width * .79, size.width * .79, 160, 600)) })} />
    {view.cropPreset === 'manual' && <>{[['x', 'Kiri'], ['y', 'Atas'], ['width', 'Lebar'], ['height', 'Tinggi']].map(([key, label]) =>
      <Field key={key} label={`${label} (px layar)`} type="number" min={0} value={crop[key]}
        onChange={value => change({ crop: cropRectangle({ ...crop, [key]: value }, size.width, size.height) })} />)}</>}
    <Choice label="Posisi awal percakapan" value={view.anchor || 'top'} options={[[ 'top', 'Dari atas' ], [ 'bottom', 'Pesan terbaru di bawah' ]]}
      onChange={anchor => change({ anchor, scroll: 0 })} />
    {advanced && <Field label="Jarak geser layar (px)" type="number" min={0} value={view.scroll || 0} onChange={scroll => change({ scroll: Math.max(0, scroll) })} />}
    <Toggle label="Sengaja hanya tampilkan sebagian isi" checked={view.intentional} onChange={intentional => change({ intentional })} />
    <p className="field-hint">{t('Matikan untuk mendapat peringatan bila ada isi yang keluar layar.')}</p>
  </Section>;
}

export default function SceneInspector({ controls, image, advanced }) {
  const { t } = useUI();
  const { project, activeSlide: slide, updateSlideContent, updateSlideMeta, editTarget, setEditTarget } = useProject();
  const { Field, Choice, Toggle, PersonChoice, Section } = controls;
  const [sourceId, setSourceId] = useState('');
  const c = slide.content || {}, { app, screen } = sceneIdentity(slide);
  const capabilities = sceneCapabilities(app, screen, c, slide.sceneState || {});
  const [visibleColors, setVisibleColors] = useState({});
  useLayoutEffect(() => {
    const root = document.querySelector('.phone-stage-wrapper .app-scene');
    if (!root || !app) return;
    const next = Object.fromEntries(PALETTE.map(([key], index) => {
      const source = index >= 10 && index <= 12 ? root.querySelector('.native-keyboard') || root : root;
      return [key, colorHex(getComputedStyle(source).getPropertyValue(`--${COLOR_VARIABLES[index]}`).trim())];
    }));
    setVisibleColors(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
  }, [app, screen, slide.id, slide.customSettings?.theme, c]);
  const people = slide.charactersSnapshot?.filter(person => person.id !== 'me') || project.characters;
  const patch = updates => updateSlideContent(slide.id, updates);
  const changeItem = (key, id, updates) => updateSlideContent(slide.id, previous => ({ ...previous,
    [key]: (previous[key] || []).map(item => item.id === id ? { ...item, ...updates } : item) }));
  const changeState = updates => updateSlideMeta(slide.id, { sceneState: { ...slide.sceneState, ...updates } });
  const setting = (key, value) => updateSlideMeta(slide.id, { customSettings: { ...slide.customSettings, [key]: value } });
  const nested = (key, updates) => patch({ [key]: { ...c[key], ...updates } });
  const targetFor = (key, id) => `${({ messages: 'message', comments: 'comment', posts: 'post', tracks: 'track', storyStickers: 'storySticker' })[key] || key}:${id}`;
  const collection = (key, title, fields, options = {}) => <Section title={`${t(title)} · ${c[key]?.length || 0}`} target={key}>
    {(c[key] || []).map((item, index) => <details key={item.id} className={'edit-card ' + (editTarget === targetFor(key, item.id) ? 'selected' : '')}
      open={editTarget === targetFor(key, item.id)} data-field-key={targetFor(key, item.id)}>
      <summary onClick={event => { event.preventDefault(); setEditTarget(editTarget === targetFor(key, item.id) ? null : targetFor(key, item.id)); }}>{index + 1}. {item.name || item.title || item.text?.slice(0, 32) || title}</summary>
      <div className="edit-card-heading"><span>{t('Susun urutan')}</span><div>
        <button aria-label={t('Ke atas')} disabled={!index} onClick={() => reorder(key, index, -1)}><ArrowUp size={15} /></button>
        <button aria-label={t('Ke bawah')} disabled={index === c[key].length - 1} onClick={() => reorder(key, index, 1)}><ArrowDown size={15} /></button>
        <button aria-label={t('Hapus')} onClick={() => patch({ [key]: c[key].filter(value => value.id !== item.id) })}><Trash2 size={15} /></button>
      </div></div>
      {options.person && <PersonChoice label={options.person === 'senderId' ? 'Pengirim' : 'Tokoh'} value={item[options.person]} characters={people} self
        onChange={value => changeItem(key, item.id, { [options.person]: value })} />}
      {fields.map(([name, label, type]) => <Field key={name} label={label} value={item[name]} type={type || 'text'} multiline={name === 'text'} min={type === 'integer' ? 0 : undefined}
        onChange={value => changeItem(key, item.id, { [name]: value })} />)}
      {options.media && mediaFields(item, updates => changeItem(key, item.id, updates), key === 'posts' ? 'post' : key === 'storyStickers' ? 'sticker' : 'message')}
      {key === 'contacts' && screen === 'calls' && <Choice label="Status panggilan" value={item.callStatus || 'incoming'} options={[[ 'incoming', 'Masuk' ], [ 'outgoing', 'Keluar' ], [ 'missed', 'Tidak terjawab' ], [ 'rejected', 'Ditolak' ]]}
        onChange={callStatus => changeItem(key, item.id, { callStatus })} />}
      {key === 'contacts' && capabilities.inboxFilters && <>
        <Toggle label="Percakapan grup" checked={item.isGroup} onChange={isGroup => changeItem(key, item.id, { isGroup })} />
        {item.isGroup && image('Foto grup', item.imageUrl, imageUrl => changeItem(key, item.id, { imageUrl }), 'avatar')}
        <Toggle label="Favorit" checked={item.isFavorite} onChange={isFavorite => changeItem(key, item.id, { isFavorite })} />
        <p className="field-hint">{t('Grup menampilkan penanda grup. Favorit menampilkan bintang. Keduanya bisa dipakai untuk menyaring daftar chat.')}</p>
      </>}
    </details>)}
    <button className="button secondary full" onClick={() => patch({ [key]: [...(c[key] || []), { id: uid(),
      ...(options.person ? { [options.person]: people[0]?.id } : {}), ...options.defaults }] })}><Plus size={16} />{t('Tambah {item}', { item: t(title).toLowerCase() })}</button>
  </Section>;
  const reorder = (key, index, direction) => {
    const items = [...(c[key] || [])], other = index + direction;
    if (other < 0 || other >= items.length) return;
    [items[index], items[other]] = [items[other], items[index]];
    patch({ [key]: items });
  };
  const photos = (value, apply) => <div className="field" data-field-key="scene-images"><span>{t('Foto / album')} · {value?.length || 0}</span>
    {(value || []).map((item, index) => <div className="edit-card" key={item.id || index}>
      {image(`Foto ${index + 1}`, item.src || item.url || item, src => apply(value.map((entry, i) => i === index ? { id: item.id || uid(), src } : entry)))}
      <button className="text-button" onClick={() => apply(value.filter((_, i) => i !== index))}>{t('Hapus foto {n}', { n: index + 1 })}</button>
    </div>)}
    {image('Tambah foto', '', src => { if (src) apply([...(value || []), { id: uid(), src }]); })}
  </div>;
  const mediaFields = (item, apply, context = 'message') => {
    const post = context === 'post', main = context === 'screen';
    const kinds = main || post ? capabilities.mediaKinds : context === 'sticker' ? ['text', 'image', 'sticker'] : MESSAGE_KINDS[app] || ['text', 'image'];
    const storedKind = main || post ? item.mediaKind : item.kind;
    const kind = kinds.includes(storedKind) ? storedKind : main ? capabilities.album ? 'album' : capabilities.reel ? 'video' : 'image'
      : storedKind || (item.imageUrl || item.mediaUrl ? 'image' : 'text');
    return <>
      {kinds.length > 1 && <Choice label="Jenis konten" value={kind} options={kinds.map(value => [value, MESSAGE_LABELS[value]])}
        onChange={value => apply({ [main || post ? 'mediaKind' : 'kind']: value, ...(main || post ? {} : { isDeleted: false, isVoiceNote: false }) })} />}
      {['image', 'video', 'gif', 'sticker', 'music', 'link', 'post', 'location'].includes(kind) && image(kind === 'sticker' ? 'Stiker transparan' : 'Gambar / poster',
        kind === 'sticker' ? item.stickerUrl : item.imageUrl || item.mediaUrl, url => apply(kind === 'sticker' ? { stickerUrl: url } : { mediaUrl: url, imageUrl: url }), kind === 'sticker' ? 'sticker' : 'wallpaper')}
      {kind === 'album' && <>
        {(capabilities.album || context === 'message') && <><Field label="Nama album (album bersama)" value={item.albumTitle || (capabilities.album ? item.title : '')} onChange={albumTitle => apply({ albumTitle })} />
          {capabilities.album && <Field label="Pembuat album" value={item.albumOwnerName} onChange={albumOwnerName => apply({ albumOwnerName })} />}</>}
        {photos(item.images, images => apply({ images }))}
      </>}
      {(['video', 'voice'].includes(kind) && !capabilities.reel) && <Field label="Durasi" value={item.voiceDuration || item.duration} onChange={duration => apply({ duration, voiceDuration: duration })} />}
      {['image', 'album', 'video'].includes(kind) && advanced && (context === 'message' || main) && <>
        {capabilities.hd && <><Toggle label="Tanda HD" checked={item.isHD} onChange={isHD => apply({ isHD })} />
          <p className="field-hint">{t('Menampilkan badge HD pada media. Ketajaman PNG diatur saat Unduh gambar.')}</p></>}
        {capabilities.once && (context === 'message' || kind !== 'album') && <Choice label="Media sekali lihat" value={item.onceState || 'normal'} options={[[ 'normal', 'Media biasa' ], [ 'hidden', 'Belum dibuka' ], [ 'opened', 'Sudah dibuka' ]]}
          onChange={onceState => apply({ onceState })} />}
      </>}
      {kind === 'sticker' && advanced && <><Field label="Ukuran stiker (px)" type="number" min={24} max={400} value={item.stickerSize || 155} onChange={stickerSize => apply({ stickerSize })} />
        <Field label="Tebal outline (px)" type="number" min={0} max={20} value={item.outline || 0} onChange={outline => apply({ outline })} />
        <Field label="Warna outline" type="color" value={item.outlineColor || '#ffffff'} onChange={outlineColor => apply({ outlineColor })} /></>}
      {kind === 'voice' && <><Field label="Progres (%)" type="number" min={0} max={100} value={item.progressPercent || 0} onChange={progressPercent => apply({ progressPercent })} />
        <Field label="Kecepatan putar" value={item.playbackSpeed || '1×'} onChange={playbackSpeed => apply({ playbackSpeed })} /><Toggle label="Ikon jeda" checked={item.isPlaying} onChange={isPlaying => apply({ isPlaying })} /></>}
      {['document', 'contact', 'location', 'link', 'music', 'post', 'poll'].includes(kind) && <Field label="Judul kartu" value={item.title} onChange={title => apply({ title })} />}
      {kind === 'document' && [['fileName', 'Nama berkas'], ['fileSize', 'Ukuran berkas'], ['fileType', 'Tipe berkas']].map(([key, label]) => <Field key={key} label={label} value={item[key]} onChange={value => apply({ [key]: value })} />)}
      {kind === 'contact' && <Field label="Nomor telepon" type="tel" value={item.phoneNumber} onChange={phoneNumber => apply({ phoneNumber })} />}
      {kind === 'location' && <Field label="Alamat" value={item.address} onChange={address => apply({ address })} />}
      {['link', 'post'].includes(kind) && <><Field label="URL yang terlihat" value={item.url} onChange={url => apply({ url })} /><Field label="Deskripsi" value={item.description} onChange={description => apply({ description })} /></>}
      {kind === 'music' && <><Field label="Lagu" value={item.song} onChange={song => apply({ song })} /><Field label="Artis" value={item.artist} onChange={artist => apply({ artist })} /></>}
      {kind === 'poll' && <>{(item.options || []).map((option, index) => <div className="edit-card" key={index}>
        {[['text', 'Pilihan', 'text'], ['votes', 'Suara', 'text'], ['percent', 'Persen', 'number']].map(([key, label, type]) => <Field key={key} label={label} type={type} value={option[key]}
          onChange={value => apply({ options: item.options.map((row, i) => i === index ? { ...row, [key]: value } : row) })} />)}
        <button className="text-button" onClick={() => apply({ options: item.options.filter((_, i) => i !== index) })}>{t('Hapus pilihan')}</button>
      </div>)}<button className="button secondary" onClick={() => apply({ options: [...(item.options || []), { text: 'Pilihan baru', votes: '0', percent: 0 }] })}>{t('Tambah pilihan')}</button>
        <Field label="Jumlah suara" value={item.totalVotes} onChange={totalVotes => apply({ totalVotes })} /></>}
    </>;
  };

  if (slide.type === 'composition') {
    const composition = slide.composition, items = composition.items || [];
    const set = updates => updateSlideMeta(slide.id, { composition: { ...composition, ...updates } });
    const sources = project.slides.filter(item => item.type !== 'composition');
    const add = () => {
      const source = sources.find(item => item.id === sourceId) || sources[0];
      if (!source) return;
      const snapshot = captureScene(source, project);
      const crop = sceneCrop(snapshot.slide, snapshot.globalSettings);
      const width = Math.min(crop.width, composition.width - 32), height = width * crop.height / crop.width;
      set({ items: [...items, { id: uid(), snapshot, crop, surface: 'screen', x: 16, y: 16 + items.length * 24, width, height }] });
    };
    const itemChange = (id, updates) => set({ items: items.map(item => item.id === id ? { ...item, ...updates } : item) });
    const layout = direction => {
      const gap = finite(composition.gap, 16, 0, 300), horizontal = direction === 'horizontal';
      let offset = gap;
      const arranged = items.map(item => {
        const available = horizontal ? composition.height - gap * 2 : composition.width - gap * 2;
        const ratio = horizontal ? available / item.height : available / item.width;
        const width = item.width * ratio, height = item.height * ratio;
        const next = { ...item, x: horizontal ? offset : gap, y: horizontal ? gap : offset, width, height };
        offset += (horizontal ? width : height) + gap;
        return next;
      });
      const scale = Math.min(1, 4096 / offset);
      set({ items: arranged.map(item => ({ ...item, x: item.x * scale, y: item.y * scale, width: item.width * scale, height: item.height * scale })),
        [horizontal ? 'width' : 'height']: Math.min(4096, Math.ceil(offset)) });
    };
    return <>
      <Section title="Kanvas kolase" target="composition"><div className="field-row">
        <Field label="Lebar (px)" type="number" min={100} max={4096} value={composition.width} onChange={width => set({ width: finite(width, 900, 100, 4096) })} />
        <Field label="Tinggi (px)" type="number" min={100} max={4096} value={composition.height} onChange={height => set({ height: finite(height, 1200, 100, 4096) })} /></div>
        <Field label="Warna latar" type="color" value={composition.background} onChange={background => set({ background })} />
        <Choice label="Ambil salinan adegan" value={sourceId || sources[0]?.id} translateOptions={false} options={sources.map(item => [item.id, `${item.order}. ${item.title}`])} onChange={setSourceId} />
        <button className="button secondary full" onClick={add} disabled={!sources.length}><Plus size={16} />{t('Tambah ke kolase')}</button>
        <p className="field-hint">{t('Setiap bagian menyimpan salinan layar. Mengedit slide sumber tidak mengubah kolase.')}</p>
        <Toggle label="Sengaja potong bagian di luar kanvas" checked={composition.intentional} onChange={intentional => set({ intentional })} />
        {items.some(item => item.x < 0 || item.y < 0 || item.x + item.width > composition.width || item.y + item.height > composition.height) && <p className="inline-error" role="status">{t('Ada bagian di luar kanvas. Geser, kecilkan, atau tandai pemotongan yang disengaja.')}</p>}
        <Field label="Jarak susunan otomatis (px)" type="number" min={0} max={300} value={composition.gap ?? 16} onChange={gap => set({ gap })} />
        <div className="field-row"><button className="button secondary" onClick={() => layout('vertical')} disabled={!items.length}>{t('Susun ke bawah')}</button><button className="button secondary" onClick={() => layout('horizontal')} disabled={!items.length}>{t('Susun ke samping')}</button></div>
      </Section>
      {items.map((item, index) => {
        const size = deviceMetrics(item.snapshot.slide, item.snapshot.globalSettings);
        const crop = cropRectangle(item.crop, size.width, size.height);
        return <Section key={item.id} title={`${t('Bagian {n}', { n: index + 1 })} · ${item.snapshot.slide.title}`} target={`part:${item.id}`}>
          <div className="edit-card-heading"><span>{t('Lapisan {n}', { n: index + 1 })}</span><div>{[-1, 1].map(direction => <button key={direction} aria-label={t(direction < 0 ? 'Ke belakang' : 'Ke depan')}
            disabled={index + direction < 0 || index + direction >= items.length} onClick={() => { const next = [...items]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; set({ items: next }); }}>{direction < 0 ? <ArrowDown size={15} /> : <ArrowUp size={15} />}</button>)}
            <button aria-label={t('Hapus bagian')} onClick={() => set({ items: items.filter(value => value.id !== item.id) })}><Trash2 size={15} /></button></div></div>
          <Choice label="Bingkai" value={item.surface || 'screen'} options={[[ 'screen', 'Layar saja' ], [ 'phone', 'HP dengan bingkai' ]]} onChange={surface => itemChange(item.id, { surface })} />
          {[['x', 'Kiri'], ['y', 'Atas'], ['width', 'Lebar'], ['height', 'Tinggi']].map(([key, label]) => <Field key={key} label={`${label} (px kanvas)`} type="number" value={Math.round(item[key])}
            onChange={value => itemChange(item.id, { [key]: finite(value, 0, key === 'width' || key === 'height' ? 1 : -4096, 4096) })} />)}
          <Choice label="Crop bagian" value="" options={[[ '', 'Pilih potongan' ], [ 'full', 'Layar penuh' ], [ 'top', 'Setengah atas' ], [ 'bottom', 'Setengah bawah' ], [ 'keyboard', 'Fokus keyboard' ]]}
            onChange={name => { if (name) { const next = cropPreset(name, size.width, size.height, item.snapshot.slide.content.keyboardHeight || size.width * .79); itemChange(item.id, { crop: next, height: item.width * next.height / next.width }); } }} />
          {advanced && [['x', 'Potongan kiri'], ['y', 'Potongan atas'], ['width', 'Lebar potongan'], ['height', 'Tinggi potongan']].map(([key, label]) => <Field key={key} label={`${label} (px layar)`} type="number" value={crop[key]}
            onChange={value => itemChange(item.id, { crop: cropRectangle({ ...crop, [key]: value }, size.width, size.height) })} />)}
          <button className="text-button" onClick={() => { const dims = item.surface === 'phone' ? { width: crop.width + 2 * size.inset, height: crop.height + 2 * size.inset } : crop;
            itemChange(item.id, { height: item.width * dims.height / dims.width }); }}>{t('Pulihkan proporsi layar')}</button>
        </Section>;
      })}
    </>;
  }
  if (!app) return null;
  const { chat, social, media } = capabilities;
  const state = slide.sceneState || {};
  const displayedMedia = capabilities.viewer && state.media ? state.media : c;
  const patchMedia = updates => capabilities.viewer && state.media
    ? changeState({ media: { ...state.media, ...updates } }) : patch(updates);
  const metrics = { likesCount: 'Suka', repliesCount: 'Balasan', retweetsCount: 'Repost', viewsCount: 'Tayangan', bookmarksCount: 'Markah', sharesCount: 'Dibagikan' };
  const profileFields = [['profileTitle', 'Judul header'], ['bio', 'Bio'], ['phoneNumber', 'Nomor telepon', 'tel'],
    ...(!capabilities.socialProfile ? [['statusText', 'Status']] : []),
    ...(capabilities.members ? [['membersText', 'Anggota']] : []),
    ...(capabilities.socialProfile ? [['postsCount', 'Jumlah postingan'], ['followersCount', 'Pengikut'], ['followingCount', 'Mengikuti']] : [])];
  return <>
    <Section title="Aplikasi dan adegan" target="header">
      <Choice label="Aplikasi" value={app} options={SCENE_APPS.map(item => [item.id, item.name])} onChange={next => {
         patch({ app: next }); changeState({ screen: SCENE_APPS.find(item => item.id === next).screens[0], overlay: null, history: [], media: null, messageId: null });
      }} />
      <Choice label="Layar yang ditampilkan" value={screen} options={SCENE_APPS.find(item => item.id === app).screens.map(key => [key, SCREEN_LABELS[key]])}
         onChange={screen => { changeState({ screen, overlay: null, history: [], media: null, messageId: null }); updateSlideMeta(slide.id, { viewport: { ...slide.viewport, scroll: 0 } }); }} />
      {capabilities.mainPerson && <PersonChoice label={chat ? 'Lawan bicara' : 'Tokoh / akun utama'} value={state.personId || c.targetCharacterId || c.authorId} characters={people} self
        onChange={value => { patch({ targetCharacterId: value, authorId: value }); changeState({ personId: null }); }} />}
      {['group', 'group_feed', 'channel'].includes(screen) && <><Field label="Nama grup / kanal" value={c.groupTitle} onChange={groupTitle => patch({ groupTitle })} />
        {image('Foto grup', c.groupAvatar, groupAvatar => patch({ groupAvatar }))}<Field label="Anggota / deskripsi grup" value={c.membersText} onChange={membersText => patch({ membersText })} /></>}
    </Section>
    <Section title="Tampilan adegan"><Choice label="Bahasa layar HP" value={slide.customSettings?.locale || 'id'} options={[[ 'id', 'Indonesia' ], [ 'en', 'English' ]]} onChange={value => setting('locale', value)} />
      <Choice label="Tema layar" value={slide.customSettings?.theme || project.globalSettings.theme} options={[[ 'light', 'Terang' ], [ 'dark', 'Gelap' ]]} onChange={value => setting('theme', value)} /></Section>
    {chat && <>
      <Section title="Header percakapan" target="chat-header"><Field label="Nama di layar (opsional)" value={c.contactName} onChange={contactName => patch({ contactName })} />
        {image('Avatar khusus slide', c.contactAvatar, contactAvatar => patch({ contactAvatar }), 'avatar')}
        {app !== 'messages' && <Field label="Status / anggota di bawah nama" value={c.statusText} onChange={statusText => patch({ statusText })} />}
        {app === 'whatsapp' && <Field label="Jumlah chat pada tombol kembali" type="integer" min={0} value={c.backCount} onChange={backCount => patch({ backCount })} />}
        <Field label="Pemisah hari" value={c.dateLabel} onChange={dateLabel => patch({ dateLabel })} />
        <Field label="Pesan belum dibaca" type="integer" min={0} value={c.unreadCount ?? 0} onChange={unreadCount => patch({ unreadCount })} />
        {advanced && <><Field label="Letak penanda belum dibaca (mulai 0)" type="integer" min={0} max={Math.max(0, (c.messages?.length || 1) - 1)} value={c.unreadStartIndex ?? 0} onChange={unreadStartIndex => patch({ unreadStartIndex })} />
          <Field label="Pesan disematkan" value={c.pinnedMessage} onChange={pinnedMessage => patch({ pinnedMessage })} /><Field label="Label dilihat" value={c.seenText} onChange={seenText => patch({ seenText })} /></>}
        <Toggle label="Lawan bicara sedang mengetik" checked={c.showTypingIndicator} onChange={showTypingIndicator => patch({ showTypingIndicator })} />
      </Section>
      {collection('messages', 'Pesan', [['text', 'Isi / keterangan'], ['time', 'Waktu (HH:mm)', 'clock']], { person: 'senderId', media: true,
        defaults: { senderId: 'me', kind: 'text', text: '', time: slide.customSettings?.time || project.globalSettings.time, status: 'read' } })}
      {advanced && (c.messages || []).filter(item => editTarget === `messages:${item.id}` || editTarget === `message:${item.id}`).map(item => <Section key={item.id} title="Detail pesan terpilih" target={`message:${item.id}`}>
        <Choice label="Tanda terkirim" value={item.status || 'sent'} options={[[ 'pending', 'Mengirim' ], [ 'sent', 'Terkirim' ], [ 'delivered', 'Sampai' ], [ 'read', 'Dibaca' ], [ 'failed', 'Gagal' ]]} onChange={status => changeItem('messages', item.id, { status })} />
        <Toggle label="Diteruskan" checked={item.isForwarded} onChange={isForwarded => changeItem('messages', item.id, { isForwarded })} />
        <Toggle label="Diedit" checked={item.isEdited} onChange={isEdited => changeItem('messages', item.id, { isEdited })} />
        {!['whatsapp', 'telegram', 'line'].includes(app) && <Toggle label="Tampilkan waktu pesan" checked={item.showTime} onChange={showTime => changeItem('messages', item.id, { showTime })} />}
        <Field label="Pemisah waktu sebelum pesan" value={item.timeLabel} onChange={timeLabel => changeItem('messages', item.id, { timeLabel })} />
        {['whatsapp', 'telegram', 'line', 'messages', 'x'].includes(app) && <Toggle label="Ekor bubble" checked={item.hasTail !== false} onChange={hasTail => changeItem('messages', item.id, { hasTail })} />}
        <Field label="Reaksi (pisahkan koma)" value={(item.reactions || []).join(', ')} onChange={value => changeItem('messages', item.id, { reactions: list(value) })} />
        <Field label="Nama pengirim kutipan" value={item.replyTo?.senderName} onChange={senderName => changeItem('messages', item.id, { replyTo: { ...item.replyTo, senderName } })} />
        <Field label="Teks kutipan" value={item.replyTo?.textPreview} onChange={textPreview => changeItem('messages', item.id, { replyTo: textPreview ? { ...item.replyTo, textPreview } : null })} />
      </Section>)}
    </>}
    {social && <>
      {(!capabilities.posts || !c.posts?.length) && <Section title="Postingan utama" target="post">
        <Field label={app === 'instagram' ? 'Keterangan foto' : 'Isi postingan'} value={app === 'instagram' ? c.caption || c.text : c.text || c.caption} multiline onChange={value => patch({ [app === 'instagram' ? 'caption' : 'text']: value })} />
        {app !== 'x' && <Field label="Lokasi" value={c.location} onChange={location => patch({ location })} />}
        <Field label="Waktu / tanggal" value={c.timestamp} onChange={timestamp => patch({ timestamp })} />
        {mediaFields(c, patch, 'post')}
        {advanced && capabilities.metrics.map(key => <Field key={key} label={metrics[key]} value={c[key]} onChange={value => patch({ [key]: value })} />)}
        {advanced && <>
          {app === 'facebook' && <Field label="Reaksi Facebook" value={c.reaction} onChange={reaction => patch({ reaction })} />}
          <Toggle label="Disukai" checked={c.isLiked} onChange={isLiked => patch({ isLiked })} />
          {app !== 'facebook' && <Toggle label="Disimpan" checked={c.isBookmarked} onChange={isBookmarked => patch({ isBookmarked })} />}
          {app === 'x' && <><Field label="Kutip postingan: isi" value={c.quoteTweet?.text} multiline onChange={text => nested('quoteTweet', { enabled: !!text, text })} />
            {!!c.quoteTweet?.text && <PersonChoice label="Penulis kutipan" value={c.quoteTweet?.authorId} characters={people} self onChange={authorId => nested('quoteTweet', { authorId })} />}</>}
        </>}
      </Section>}
      {capabilities.posts && collection('posts', 'Postingan', [[app === 'instagram' ? 'caption' : 'text', 'Isi'], ['timestamp', 'Waktu'], ...(app !== 'x' ? [['location', 'Lokasi']] : []), ...capabilities.metrics.map(key => [key, metrics[key]])], { person: 'authorId', media: true })}
      {screen === 'thread' && collection('replies', 'Balasan utas', [['text', 'Isi'], ['timestamp', 'Waktu'], ['likesCount', 'Suka'], ['replyText', 'Teks balasan']], { person: 'authorId' })}
      {screen === 'comments' && collection('comments', 'Komentar', [['text', 'Isi'], ['timestamp', 'Waktu'], ['likesCount', 'Suka'], ['replyText', 'Teks balasan']], { person: 'authorId' })}
    </>}
    {['profile', 'info'].includes(screen) && <Section title="Profil dan info" target="profile">
      <Field label="Nama khusus layar" value={c.contactName} onChange={contactName => patch({ contactName })} />
      {image('Avatar', c.contactAvatar, contactAvatar => patch({ contactAvatar }), 'avatar')}
      {capabilities.profileCover && image('Sampul profil', c.coverUrl, coverUrl => patch({ coverUrl }))}
      {profileFields.map(([key, label, type]) => <Field key={key} label={label} type={type || 'text'} value={c[key]} multiline={key === 'bio'} onChange={value => patch({ [key]: value })} />)}
      {capabilities.profileImages && photos(c.images, images => patch({ images }))}
    </Section>}
    {capabilities.profilePosts && <>
      {collection('posts', 'Postingan', [['text', 'Isi'], ['timestamp', 'Waktu'], ...capabilities.metrics.map(key => [key, metrics[key]])], { person: 'authorId', media: true })}
    </>}
    {['inbox', 'requests', 'contacts', 'calls'].includes(screen) && <>
      {capabilities.inboxFilters && <Section title="Filter daftar chat" target="chat-filters">
        <Choice label="Filter aktif" value={state.inboxFilter || 'all'} options={INBOX_FILTERS} onChange={inboxFilter => changeState({ inboxFilter })} />
      </Section>}
      {['instagram', 'messenger'].includes(app) && ['inbox', 'requests'].includes(screen) && <Section title="Notes dan permintaan" target="notes">
        <Field label="Teks Notes" value={c.noteText} onChange={noteText => patch({ noteText })} />
        <Field label="Jumlah permintaan pesan" type="integer" min={0} value={c.requestsCount ?? 0} onChange={requestsCount => patch({ requestsCount })} />
      </Section>}
      <Section title="Pencarian" target="search"><Field label="Teks pencarian" value={c.searchText} onChange={searchText => patch({ searchText })} /></Section>
      {collection('contacts', screen === 'calls' ? 'Riwayat panggilan' : screen === 'contacts' ? 'Daftar kontak' : 'Daftar kontak / chat', contactFields(screen),
        { person: 'characterId', defaults: { time: slide.customSettings?.time || project.globalSettings.time, unread: 0, ...(screen === 'calls' ? { callStatus: 'incoming', duration: '00:24' } : {}) } })}
    </>}
    {screen === 'info' && collection('contacts', 'Anggota', contactFields(screen), { person: 'characterId' })}
    {screen === 'notifications' && collection('notifications', 'Notifikasi', [['name', 'Judul'], ['text', 'Isi'], ['time', 'Waktu'], ['unread', 'Jumlah', 'number']], { person: 'characterId' })}
    {media && <Section title={capabilities.story ? 'Media dan story' : capabilities.album ? 'Album' : capabilities.reel ? 'Reels / video' : 'Penampil media'} target="media">
      {mediaFields({ ...displayedMedia, mediaKind: displayedMedia.kind || displayedMedia.mediaKind }, patchMedia, 'screen')}
      <Field label={capabilities.story ? 'Teks story' : capabilities.album ? 'Keterangan album' : 'Keterangan media'} value={displayedMedia.caption ?? displayedMedia.text ?? ''} multiline onChange={caption => patchMedia({ caption, ...(state.media ? { text: '' } : {}) })} />
      {(capabilities.story || capabilities.viewer) && <Field label={capabilities.story ? 'Waktu story' : 'Waktu media'} value={displayedMedia.storyTime || displayedMedia.time || c.timestamp} onChange={storyTime => patchMedia({ storyTime })} />}
      {capabilities.story && <>
        <Field label="Segmen story" type="integer" min={1} max={15} value={c.storySegments ?? 1} hint="Jumlah segmen: 1 sampai 15." onChange={storySegments => {
          patch({ storySegments }); changeState({ storyIndex: Math.min(state.storyIndex || 0, Math.max(0, storySegments - 1)) });
        }} />
        <Field label="Segmen aktif" type="integer" min={1} max={c.storySegments || 1} value={(state.storyIndex || 0) + 1} hint="Nomor segmen yang ditampilkan, mulai dari 1." onChange={value => changeState({ storyIndex: Math.max(0, value - 1) })} />
      </>}
      {capabilities.story && <><Toggle label="Stiker musik" checked={c.musicSticker?.enabled ?? !!c.musicSticker?.song} onChange={enabled => nested('musicSticker', { enabled })} />
      {(c.musicSticker?.enabled ?? !!c.musicSticker?.song) && <><Field label="Lagu" value={c.musicSticker?.song} onChange={song => nested('musicSticker', { song })} /><Field label="Artis" value={c.musicSticker?.artist} onChange={artist => nested('musicSticker', { artist })} />
        {image('Sampul lagu', c.musicSticker?.albumArt, albumArt => nested('musicSticker', { albumArt }))}</>}
      <Toggle label="Stiker pertanyaan" checked={c.questionSticker?.enabled} onChange={enabled => nested('questionSticker', { enabled })} />
      {c.questionSticker?.enabled && <><Field label="Pertanyaan" value={c.questionSticker.prompt} onChange={prompt => nested('questionSticker', { prompt })} /><Field label="Jawaban / placeholder" value={c.questionSticker.answer} onChange={answer => nested('questionSticker', { answer })} /></>}</>}
      {state.media && <button className="button secondary" onClick={() => changeState({ media: null })}>{t('Pakai media utama slide')}</button>}
    </Section>}
    {capabilities.story && collection('storyStickers', 'Stiker / teks story', [['text', 'Teks'], ['x', 'Kiri (%)', 'number'], ['y', 'Atas (%)', 'number'], ['width', 'Lebar (px)', 'number'], ['rotation', 'Rotasi', 'number'], ['color', 'Warna teks', 'color'], ['background', 'Warna blok', 'color']], { media: true, defaults: { kind: 'text', x: 10, y: 30, width: 120, color: '#ffffff', background: '#000000' } })}
    {screen === 'call' && <Section title="Keadaan panggilan" target="call-status">
      <Choice label="Keadaan" value={c.callStatus || 'incoming'} options={[[ 'incoming', 'Masuk' ], [ 'outgoing', 'Keluar' ], [ 'ringing', 'Berdering' ], [ 'active', 'Aktif' ], [ 'missed', 'Tidak terjawab' ], [ 'ended', 'Berakhir' ]]} onChange={callStatus => patch({ callStatus })} />
      <Choice label="Jenis" value={c.callKind || 'voice'} options={[[ 'voice', 'Suara' ], [ 'video', 'Video' ]]} onChange={callKind => patch({ callKind })} />
      <Field label="Nama kontak" value={c.contactName} onChange={contactName => patch({ contactName })} />
      {c.callStatus === 'active' && <Field label="Durasi" value={c.callDuration} onChange={callDuration => patch({ callDuration })} />}
      {image('Latar / poster kamera', c.callImageUrl, callImageUrl => patch({ callImageUrl }))}
      {c.callKind === 'video' && c.callImageUrl && image('Pratinjau kamera saya', c.selfVideoUrl, selfVideoUrl => patch({ selfVideoUrl }))}
      <Field label="Warna latar" type="color" value={c.callBackground || '#20262c'} onChange={callBackground => patch({ callBackground })} />
      {c.callStatus !== 'incoming' && <><Toggle label="Mikrofon dibisukan" checked={c.callMuted} onChange={callMuted => patch({ callMuted })} /><Toggle label="Speaker aktif" checked={c.callSpeaker} onChange={callSpeaker => patch({ callSpeaker })} /></>}
    </Section>}
    {app === 'spotify' && ['player', 'share', 'playlist', 'album', 'queue', 'lyrics'].includes(screen) && <>
      {screen !== 'queue' && <Section title="Musik" target="player">
        {['playlist', 'album'].includes(screen) && <><Field label="Judul playlist / album" value={c.title} onChange={title => patch({ title })} /><Field label="Nama artis" value={c.artist} onChange={artist => patch({ artist })} />{image('Sampul album', c.albumArt, albumArt => patch({ albumArt }))}</>}
        {['player', 'share'].includes(screen) && <>{[['playlistName', 'Memutar dari'], ['song', 'Lagu'], ['artist', 'Artis'], ['duration', 'Durasi'], ['progress', 'Waktu berjalan']].map(([key, label]) => <Field key={key} label={label} value={c[key]} onChange={value => patch({ [key]: value })} />)}
          {image('Sampul album', c.albumArt, albumArt => patch({ albumArt }))}<Field label="Progres (%)" type="number" min={0} max={100} value={c.progressPercent || 0} onChange={progressPercent => patch({ progressPercent })} />
          <Toggle label="Sedang diputar (ikon jeda)" checked={c.isPlaying} onChange={isPlaying => patch({ isPlaying })} />
          {screen === 'share' && <Field label="Teks berbagi" value={c.shareCaption} multiline onChange={shareCaption => patch({ shareCaption })} />}</>}
        {screen === 'lyrics' && <><Field label="Lirik (satu baris per kalimat)" multiline value={c.lyrics} onChange={lyrics => patch({ lyrics })} /><Field label="Baris lirik aktif (mulai 0)" type="integer" min={0} value={c.lyricActiveLine || 0} onChange={lyricActiveLine => patch({ lyricActiveLine })} /></>}
      </Section>}
      {['playlist', 'album', 'queue'].includes(screen) && collection('tracks', 'Lagu', [['title', 'Judul'], ['artist', 'Artis'], ['duration', 'Durasi']])}
    </>}
    {app === 'notes' && screen === 'note' && <><Section title="Catatan" target="note"><Field label="Judul" value={c.title} onChange={title => patch({ title })} /><Field label="Isi catatan" value={c.text} multiline onChange={text => patch({ text })} />
      <Field label="Tanggal / waktu" value={c.timestamp} onChange={timestamp => patch({ timestamp })} /><Toggle label="Isi tebal" checked={c.noteBold} onChange={noteBold => patch({ noteBold })} />{photos(c.images, images => patch({ images }))}</Section>
      <Section title="Daftar centang">{(c.checklist || []).map(item => <div className="edit-card" key={item.id}><Field label="Isi" value={item.text} onChange={text => changeItem('checklist', item.id, { text })} /><Toggle label="Selesai" checked={item.checked} onChange={checked => changeItem('checklist', item.id, { checked })} /><button className="text-button" onClick={() => patch({ checklist: c.checklist.filter(value => value.id !== item.id) })}>{t('Hapus')}</button></div>)}
        <button className="button secondary" onClick={() => patch({ checklist: [...(c.checklist || []), { id: uid(), text: '', checked: false }] })}>{t('Tambah centang')}</button></Section>
    </>}
    {app === 'notes' && screen === 'note_list' && collection('notes', 'Catatan', [['title', 'Judul'], ['text', 'Isi'], ['time', 'Waktu']])}
    {screen === 'notes' && <Section title="Notes" target="notes"><Field label="Teks Notes" value={c.noteText || c.text} multiline onChange={noteText => patch({ noteText })} /></Section>}
    {capabilities.composer && <Section title="Kolom ketik dan keyboard" target="composer">
      <Field label={capabilities.story ? 'Teks balasan belum dikirim' : 'Draft belum dikirim'} value={c.draftText} multiline onChange={draftText => patch({ draftText, caretPosition: draftText.length })} />
      {!capabilities.story && <PersonChoice label="Kirim sebagai" value={c.composerSenderId || 'me'} characters={people} self onChange={composerSenderId => patch({ composerSenderId })} />}
      <Toggle label="Keyboard terbuka" checked={c.showKeyboard} onChange={showKeyboard => patch({ showKeyboard })} />
      {c.showKeyboard && <>
      <Choice label="Keyboard" value={c.keyboardProfile || 'auto'} options={[[ 'auto', 'Sesuai perangkat' ], [ 'ios', 'iPhone' ], [ 'gboard', 'Gboard' ], [ 'samsung', 'Samsung' ]]} onChange={keyboardProfile => patch({ keyboardProfile })} />
      <Choice label="Isi keyboard" value={c.keyboardMode || 'letters'} options={[[ 'letters', 'Huruf' ], [ 'numbers', 'Angka' ], [ 'symbols', 'Simbol' ], [ 'emoji', 'Emoji' ]]} onChange={keyboardMode => patch({ keyboardMode })} />
      {(c.keyboardMode || 'letters') === 'letters' && <Toggle label="Huruf kapital" checked={c.keyboardCaps} onChange={keyboardCaps => patch({ keyboardCaps })} />}
      <Field label="Saran kata (pisahkan koma)" value={(c.keyboardSuggestions || []).join(', ')} onChange={value => patch({ keyboardSuggestions: list(value) })} />
      {advanced && <><Field label="Posisi kursor" type="number" min={0} max={c.draftText?.length || 0} value={c.caretPosition ?? c.draftText?.length ?? 0} onChange={caretPosition => patch({ caretPosition })} />
        <Field label="Tinggi keyboard (px, 0 = standar)" type="number" min={0} max={600} value={c.keyboardHeight || 0} onChange={keyboardHeight => patch({ keyboardHeight })} />
        <Field label="Label tombol spasi" value={c.spaceLabel} onChange={spaceLabel => patch({ spaceLabel })} />
        </>}
      </>}
      {advanced && chat && <>
        {!c.showKeyboard && <Field label="Placeholder pesan" value={c.composerPlaceholder} onChange={composerPlaceholder => patch({ composerPlaceholder })} />}
        <Toggle label="Sedang merekam" checked={c.isRecording} onChange={isRecording => patch({ isRecording, showKeyboard: false })} />
        {c.isRecording && <Field label="Durasi rekaman" value={c.recordingDuration} onChange={recordingDuration => patch({ recordingDuration })} />}
      </>}
    </Section>}
    {(capabilities.colors.length > 0 || capabilities.wallpaper) && <Section title="Warna dan wallpaper" target="palette">
      {app === 'whatsapp' && <Choice label="Warna awal WhatsApp" value={c.chatPalette || 'classic'} options={WHATSAPP_THEMES} onChange={chatPalette => patch({ chatPalette, ...Object.fromEntries(PALETTE.map(([key]) => [key, ''])) })} />}
      {capabilities.wallpaper && image('Wallpaper sendiri', c.customWallpaper, customWallpaper => patch({ customWallpaper }))}
      {advanced && PALETTE.map(([key, label], index) => capabilities.colors.includes(key) && <Field key={key} label={label} type="color" value={c[key] || visibleColors[key] || DEFAULT_COLORS[index]} onChange={value => patch({ [key]: value })} />)}
      {!advanced && <p className="field-hint">{t('Buka Mode lanjut untuk mengganti setiap warna.')}</p>}
      <button className="button secondary full" onClick={() => patch({ chatPalette: 'classic', customWallpaper: '', ...Object.fromEntries(PALETTE.map(([key]) => [key, ''])) })}>{t('Reset warna standar aplikasi')}</button>
    </Section>}
    {advanced && <>
      {capabilities.overlays.length > 1 && <Section title="Menu dan lapisan layar" target="overlay">
        <Choice label="Lapisan aktif" value={validOverlay(app, screen, c, state) || ''} options={capabilities.overlays}
          onChange={overlay => changeState({ overlay: overlay || null, ...(overlay === 'message-menu' ? { messageId: c.messages?.find(item => item.id === state.messageId)?.id || c.messages?.[0]?.id } : {}) })} />
        {capabilities.messageMenu && <Choice label="Pesan untuk menu" value={c.messages?.find(item => item.id === state.messageId)?.id || c.messages?.[0]?.id || ''} translateOptions={false} options={(c.messages || []).map((item, i) => [item.id, `${i + 1}. ${item.text || t(MESSAGE_LABELS[item.kind])}`])}
          onChange={messageId => changeState({ messageId })} />}
        {chat && !c.messages?.length && <p className="field-hint">{t('Tambahkan pesan di bagian Pesan agar Menu pesan memiliki pilihan.')}</p>}
        {validOverlay(app, screen, c, state) && <Field label="Judul menu khusus" value={c.overlayTitle} onChange={overlayTitle => patch({ overlayTitle })} />}
      </Section>}
      <Section title="Ukuran dan font layar">
        <Choice label="Font" value={slide.customSettings?.font || 'system'} options={[[ 'system', 'Sistem perangkat' ], [ 'Inter', 'Inter' ], [ 'Roboto', 'Roboto' ], [ 'Georgia', 'Serif / Georgia' ]]}
          onChange={font => setting('font', font)} />
        {[['screenWidth', 'Lebar layar', 240, 1200], ['screenHeight', 'Tinggi layar', 400, 2400]].map(([key, label, min, max]) => <Field key={key} label={`${label} (px logis)`} type="number" min={min} max={max}
          value={slide.customSettings?.[key] || deviceMetrics(slide, project.globalSettings)[key === 'screenWidth' ? 'width' : 'height']} onChange={value => setting(key, finite(value, min, min, max))} />)}
      </Section>
      {editTarget && <Section title="Pengaturan elemen" target="element-style">
        <p className="field-hint">{t('Pilih Ubah isi lalu ketuk elemen. Perubahan hanya berlaku di adegan ini.')}</p>
        {editTarget.startsWith('control:') && <Choice label="Ganti ikon" value={c.iconOverrides?.[editTarget.slice(8)] || ''} options={[[ '', 'Ikon standar' ], ...NATIVE_ICONS.map(name => [name, ICON_LABELS[name]])]}
          onChange={value => patch({ iconOverrides: { ...c.iconOverrides, [editTarget.slice(8)]: value } })} />}
        {[['fontSize', 'Ukuran huruf', 'number'], ['weight', 'Ketebalan (100–900)', 'number'], ['x', 'Geser horizontal (px)', 'number'], ['y', 'Geser vertikal (px)', 'number'],
          ['width', 'Lebar (px)', 'number'], ['height', 'Tinggi (px)', 'number'], ['iconSize', 'Ukuran ikon (px)', 'number'], ['radius', 'Radius (px)', 'number'], ['rotation', 'Rotasi', 'number'], ['color', 'Warna teks', 'color'], ['background', 'Warna latar', 'color']].map(([key, label, type]) => <Field key={key} label={label} type={type}
            value={slide.customSettings?.elementStyles?.[editTarget]?.[key] ?? (type === 'color' ? '#ffffff' : '')} onChange={value => setting('elementStyles', { ...slide.customSettings?.elementStyles,
              [editTarget]: { ...slide.customSettings?.elementStyles?.[editTarget], [key]: value } })} />)}
        <Toggle label="Sembunyikan elemen" checked={slide.customSettings?.elementStyles?.[editTarget]?.hidden} onChange={hidden => setting('elementStyles', { ...slide.customSettings?.elementStyles,
          [editTarget]: { ...slide.customSettings?.elementStyles?.[editTarget], hidden } })} />
        <button className="text-button" onClick={() => { const values = { ...slide.customSettings?.elementStyles }; delete values[editTarget]; setting('elementStyles', values); }}>{t('Reset elemen ini')}</button>
      </Section>}
      {Object.keys(capabilities.labels).length > 0 && <Section title="Label layar khusus"><p className="field-hint">{t('Isi hanya label yang ingin diganti. Kosongkan untuk bahasa standar.')}</p>
        {Object.entries(capabilities.labels).map(([key, label]) => <Field key={key} label={label}
          value={c.labels?.[key]} onChange={value => nested('labels', { [key]: value || undefined })} />)}
      </Section>}
    </>}
  </>;
}
