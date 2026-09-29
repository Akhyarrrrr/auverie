import { useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { paginateByHeight, parseChatScript } from '../../services/scriptParser';
import PhoneContainer from '../phone/PhoneContainer';
import { useDialogFocus } from './AssetPickerModal';

export default function QuickScriptModal({ isOpen, onClose }) {
  const { project, setProject, setActiveSlideIndex } = useProject();
  const [script, setScript] = useState('');
  const [platform, setPlatform] = useState('wa_chat');
  const [draft, setDraft] = useState(null);
  const [pages, setPages] = useState([]);
  const [oversized, setOversized] = useState([]);
  const [error, setError] = useState('');
  const measureRef = useRef(null);
  const dialog = useRef(null);
  useDialogFocus(dialog, onClose, isOpen);

  useLayoutEffect(() => {
    if (!draft || !measureRef.current) return;
    const screen = measureRef.current;
    let cancelled = false;
    const measure = async () => {
    await document.fonts.ready;
    if (cancelled) return;
    const body = screen.querySelector('.scene-viewport');
    const selector = '.native-message-row';
    const nodes = [...(body?.querySelectorAll(selector) || [])];
    if (!body || nodes.length !== draft.messages.length) return;
    const style = getComputedStyle(body.querySelector('.scene-stream'));
    const date = body.querySelector('.native-date');
    const available = body.clientHeight - parseFloat(style.paddingTop || 0) - parseFloat(style.paddingBottom || 0)
      - (date?.getBoundingClientRect().height || 0) - parseFloat(style.gap || 0) - 6;
    const heights = nodes.map(node => {
      const itemStyle = getComputedStyle(node);
      return node.getBoundingClientRect().height + parseFloat(itemStyle.marginTop || 0)
        + parseFloat(itemStyle.marginBottom || 0) + 6;
    });
    try {
      const result = paginateByHeight(draft.messages, heights, available);
      setPages(result.pages); setOversized(result.oversized);
    } catch (cause) { setError(cause.message); }
    };
    measure();
    return () => { cancelled = true; };
  }, [draft, platform]);

  if (!isOpen) return null;
  const preview = () => {
    setError(''); setPages([]); setOversized([]);
    if (!script.trim()) { setError('Tulis paling tidak satu baris dialog.'); return; }
    const result = parseChatScript(script, project.characters, {
      platformType: platform, startTime: project.globalSettings.time
    });
    if (!result.messages.length) { setError('Belum ada pesan yang dapat dibuat. Gunakan format Nama: Pesan.'); return; }
    setDraft(result);
  };
  const create = () => {
    if (!draft || !pages.length || draft.invalidLines.length || oversized.length) return;
    const first = project.slides.length;
    const slides = pages.map((messages, index) => ({
      id: crypto.randomUUID(), order: first + index + 1, type: platform, renderVersion: 3,
      charactersSnapshot: structuredClone([...project.characters, ...draft.newCharacters, { id: 'me', ...project.selfCharacter }]),
      viewport: { anchor: 'top', scroll: 0, intentional: false }, sceneState: { overlay: null },
      title: 'Naskah · bagian ' + (index + 1), customSettings: { ...project.globalSettings },
      content: { targetCharacterId: draft.targetCharacterId, groupTitle: platform === 'wa_group' ? 'Grup obrolan' : undefined,
        statusText: 'online', messages: messages.map(message => ({ ...message, kind: message.isVoiceNote ? 'voice' : 'text' })) }
    }));
    setProject(previous => ({ ...previous, characters: [...previous.characters, ...draft.newCharacters],
      slides: [...previous.slides, ...slides] }));
    setActiveSlideIndex(first);
    onClose();
  };
  const measureSlide = draft && { id: 'script-measure', type: platform, renderVersion: 3, viewport: { anchor: 'top' }, customSettings: { ...project.globalSettings }, content: {
    targetCharacterId: draft.targetCharacterId, groupTitle: 'Grup obrolan', statusText: 'online', messages: draft.messages
  } };

  return <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialog} className="script-dialog" role="dialog" aria-modal="true" aria-labelledby="script-title">
      <div className="dialog-heading"><div><h2 id="script-title">Naskah Cepat</h2>
        <p>Tulis satu pesan per baris. Lihat pembagian slide sebelum menambahkan ke cerita.</p></div>
        <button className="icon-button" onClick={onClose} aria-label="Tutup"><X size={19} /></button></div>
      <div className="script-content">
        <label className="field"><span>Tampilan chat</span><select aria-label="Tampilan chat" value={platform} onChange={event => { setPlatform(event.target.value); setDraft(null); }}>
          <option value="wa_chat">WhatsApp chat</option><option value="wa_group">WhatsApp grup</option>
          <option value="ig_dm">Instagram DM</option></select></label>
        <label className="field"><span>Dialog</span><textarea aria-label="Dialog" rows={9} value={script} onChange={event => { setScript(event.target.value); setDraft(null); }}
          placeholder={'Aku: Kamu sudah sampai?\nReyhan: Sudah, tunggu sebentar.\nReyhan: [vn:0:24]'} /></label>
        <p className="field-hint">Gunakan <code>Nama: Pesan</code>. Untuk WhatsApp, <code>[vn:0:24]</code> membuat tampilan voice note.</p>
        <button className="button secondary" onClick={preview}>Pratinjau pembagian</button>
        {error && <p className="inline-error" role="alert">{error}</p>}
        {draft && <div className="script-preview">
          {!!draft.invalidLines.length && <div className="inline-error" role="alert"><strong>Perbaiki baris berikut:</strong>
            {draft.invalidLines.map(item => <p key={item.line}>Baris {item.line}: {item.text}</p>)}</div>}
          {!!oversized.length && <p className="inline-error" role="alert">Pesan {oversized.join(', ')} lebih tinggi dari layar. Ringkas pesan tersebut.</p>}
          <h3>{pages.length ? pages.length + ' slide akan dibuat' : 'Mengukur isi slide…'}</h3>
          {pages.map((page, index) => <div className="script-page" key={index}>
            <strong>Slide {index + 1} · {page.length} pesan</strong>
            <span>{page.map(item => item.text || '[voice note]').join(' · ')}</span>
          </div>)}
        </div>}
      </div>
      <div className="dialog-footer"><button className="button secondary" onClick={onClose}>Batal</button>
        <button className="button primary" disabled={!pages.length || !!draft?.invalidLines.length || !!oversized.length} onClick={create}>Tambahkan slide</button></div>
    </section>
    {measureSlide && <div className="offscreen-export script-measure"><PhoneContainer slide={measureSlide}
      previewCharacters={draft.newCharacters} ref={measureRef} zoom={1} /></div>}
  </div>;
}
