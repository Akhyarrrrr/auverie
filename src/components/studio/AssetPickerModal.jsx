import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AESTHETIC_AVATARS, AESTHETIC_WALLPAPERS } from '../../data/samplePresets';
import { useProject } from '../../context/ProjectContext';
import StickerEditor from './StickerEditor';

const STICKERS = [
  { id: 'builtin-heart', name: 'Hati', url: `${import.meta.env.BASE_URL}stickers/heart.svg` },
  { id: 'builtin-star', name: 'Bintang', url: `${import.meta.env.BASE_URL}stickers/star.svg` },
  { id: 'builtin-wave', name: 'Sapaan', url: `${import.meta.env.BASE_URL}stickers/wave.svg` }
];

export function useDialogFocus(dialog, onClose, open = true) {
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement;
    dialog.current?.querySelector('button,input,select,textarea')?.focus();
    const key = event => {
      if (event.key === 'Escape') { event.stopPropagation(); close.current(); }
      if (event.key !== 'Tab' || !dialog.current) return;
      const focusable = [...dialog.current.querySelectorAll('button:not(:disabled),input,select,textarea')].filter(node => node.offsetParent !== null);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); before?.focus(); };
  }, [dialog, open]);
}

export default function AssetPickerModal({ isOpen, onClose, onSelect, type = 'avatar', currentUrl = '' }) {
  const [tab, setTab] = useState('upload');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState('');
  const { project, setProject } = useProject();
  const dialog = useRef(null);
  useDialogFocus(dialog, onClose, isOpen);
  useEffect(() => {
    if (!isOpen) return;
    setError(''); setEditing('');
  }, [isOpen]);
  useEffect(() => { if (isOpen) setTab(type === 'sticker' ? 'gallery' : 'upload'); }, [isOpen, type]);
  if (!isOpen) return null;

  const chooseFile = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 20 * 1024 * 1024) {
      setError('Pilih JPG, PNG, WebP, atau GIF berukuran maksimal 20 MB.'); return;
    }
    const reader = new FileReader();
    reader.onload = () => type === 'sticker' ? setEditing(reader.result) : finish(reader.result);
    reader.onerror = () => setError('Gambar gagal dibaca. Coba berkas lain.');
    reader.readAsDataURL(file);
  };
  const chooseUrl = async () => {
    setError('');
    let parsed;
    try { parsed = new URL(url.trim()); }
    catch { setError('Masukkan alamat gambar yang valid.'); return; }
    if (!['http:', 'https:'].includes(parsed.protocol)) { setError('Gunakan tautan HTTPS atau HTTP.'); return; }
    setBusy(true);
    try {
      const response = await fetch(parsed.href, { mode: 'cors' });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error();
      const blob = await response.blob();
      if (blob.size > 20 * 1024 * 1024) throw new Error();
      const data = await toData(blob);
      if (type === 'sticker') setEditing(data); else await finish(data);
    } catch {
      setError('Tautan ini tidak bisa dipakai untuk ekspor. Unduh gambar lalu unggah berkasnya.');
    } finally { setBusy(false); }
  };
  const chooseSample = async item => {
    setBusy(true);
    try {
      const blob = await (await fetch(item.url)).blob();
      await finish(await toData(blob));
    } catch { setError('Stiker gagal dimuat. Coba unggah gambar sendiri.'); }
    finally { setBusy(false); }
  };
  const toData = blob => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
  const finish = async source => {
    try {
      // Freeze GIFs to a portable static poster; animation is never part of an exported scene.
      if (/^data:image\/gif/.test(source)) {
        const image = new Image(); image.src = source; await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        canvas.getContext('2d').drawImage(image, 0, 0); source = canvas.toDataURL('image/png');
      }
      onSelect(source); onClose();
    } catch { setError('Gambar gagal dibaca. Coba unggah berkas lain.'); }
  };
  const samples = type === 'sticker' ? [...(project?.stickerLibrary || []), ...STICKERS] : type === 'avatar' ? AESTHETIC_AVATARS : AESTHETIC_WALLPAPERS;

  return createPortal(<div className="dialog-backdrop no-export" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialog} className="asset-dialog" role="dialog" aria-modal="true" aria-labelledby="asset-title">
      <div className="dialog-heading"><div><h2 id="asset-title">Pilih gambar</h2><p>Gambar yang diunggah tersimpan bersama proyek di browser ini.</p></div>
        <button className="icon-button" onClick={onClose} aria-label="Tutup"><X size={19} /></button></div>
      {editing ? <StickerEditor source={editing} onCancel={() => setEditing('')} onSave={sticker => {
        setProject(previous => ({ ...previous, stickerLibrary: [...(previous.stickerLibrary || []), sticker] })); finish(sticker.url);
      }} /> : <><div className="asset-tabs">
        <button className={tab === 'upload' ? 'active' : ''} onClick={() => setTab('upload')}>Unggah</button>
        <button className={tab === 'gallery' ? 'active' : ''} onClick={() => setTab('gallery')}>{type === 'sticker' ? 'Koleksi dan contoh' : 'Contoh gambar'}</button>
        <button className={tab === 'url' ? 'active' : ''} onClick={() => setTab('url')}>Tautan</button>
      </div>
      <div className="asset-body">
        {tab === 'upload' && <label className="upload-drop"><strong>Pilih gambar dari HP atau laptop</strong><span>JPG, PNG, WebP, GIF diam · maksimal 20 MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseFile} /></label>}
        {tab === 'gallery' && <div className="asset-grid">{samples.map(item => <div className="asset-item" key={item.id}>
          <button disabled={busy} className={currentUrl === item.url ? 'active' : ''} onClick={() => chooseSample(item)}><img src={item.url} alt="" /><span>{item.name}</span></button>
          {type === 'sticker' && project?.stickerLibrary?.some(sticker => sticker.id === item.id) && <div className="asset-item-tools">
            <button onClick={() => setEditing(item.url)} aria-label={`Edit stiker ${item.name}`}>Edit</button>
            <button onClick={() => setProject(previous => ({ ...previous, stickerLibrary: previous.stickerLibrary.filter(sticker => sticker.id !== item.id) }))} aria-label={`Hapus stiker ${item.name}`}>Hapus</button>
          </div>}
        </div>)}</div>}
        {tab === 'url' && <div className="url-input"><label className="field"><span>Alamat gambar langsung</span><input type="url" value={url}
          placeholder="https://contoh.com/gambar.jpg" onChange={event => setUrl(event.target.value)} /></label>
          <button className="button primary" disabled={busy} onClick={chooseUrl}>{busy ? 'Memeriksa…' : 'Gunakan tautan'}</button></div>}
        {error && <p className="inline-error" role="alert">{error}</p>}
        {type === 'sticker' && currentUrl && <button className="button secondary" onClick={async () => {
          try { setEditing(await toData(await (await fetch(currentUrl)).blob())); } catch { setError('Unggah stiker sebagai berkas untuk mengeditnya.'); }
        }}>Edit stiker saat ini</button>}
      </div></>}
    </section>
  </div>, document.body);
}
