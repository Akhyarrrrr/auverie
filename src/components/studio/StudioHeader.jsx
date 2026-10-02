import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Download, FileUp, FileDown, HelpCircle, Redo2, Undo2, FileText } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useUI } from '../../context/UIContext';
import { downloadProjectAsJson, parseProjectJsonFile } from '../../services/storage';
import InterfaceControls, { Brand } from '../InterfaceControls';

export default function StudioHeader({ onOpenScript, onOpenExport, onGuide }) {
  const { project, updateTitle, saveNow, createProject, importProject, saveStatus, canUndo, canRedo, undo, redo } = useProject();
  const { t, errorText } = useUI();
  const [menuOpen, setMenuOpen] = useState(false), [error, setError] = useState(''), [backupBusy, setBackupBusy] = useState(false);
  const fileRef = useRef(null), menuRef = useRef(null), triggerRef = useRef(null);
  useEffect(() => {
    const key = event => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.target.closest('input,textarea,[contenteditable=true]')) return;
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      else if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [undo, redo]);
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector('button')?.focus();
    const key = event => { if (event.key === 'Escape') { setMenuOpen(false); triggerRef.current?.focus(); } };
    const outside = event => { if (!menuRef.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener('keydown', key); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); };
  }, [menuOpen]);
  const run = async action => {
    try { setError(''); await action(); setMenuOpen(false); }
    catch (cause) { setError(cause); }
  };
  const goHome = async () => { await saveNow(); location.hash = '/'; };
  const loadFile = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (file) await run(async () => importProject(await parseProjectJsonFile(file)));
  };
  return <header className="studio-header">
    <div className="header-project"><button className="icon-button header-back" onClick={() => run(goHome)} aria-label={t('Kembali ke beranda')} title={t('Kembali ke beranda')}><ArrowLeft size={18} /></button>
      <span className="editor-brand"><Brand compact /></span><div className="project-heading"><label htmlFor="project-title">{t('Judul cerita')}</label><input id="project-title" value={project.title} onChange={event => updateTitle(event.target.value)} /></div>
      <span className={`save-indicator ${saveStatus}`} role="status">{t(saveStatus === 'saving' ? 'Menyimpan…' : saveStatus === 'error' ? 'Gagal menyimpan' : 'Tersimpan')}</span>
    </div>
    <div className="header-actions"><div className="history-actions">
      <button className="icon-button" onClick={undo} disabled={!canUndo} title={t('Urungkan')} aria-label={t('Urungkan')}><Undo2 size={18} /></button>
      <button className="icon-button" onClick={redo} disabled={!canRedo} title={t('Ulangi')} aria-label={t('Ulangi')}><Redo2 size={18} /></button>
    </div><button className="icon-button header-script" onClick={onOpenScript} title={t('Naskah Cepat')} aria-label={t('Naskah Cepat')}><FileText size={18} /></button>
      <InterfaceControls />
      <div className="menu-anchor" ref={menuRef}><button ref={triggerRef} className="button secondary header-project-menu" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="story-menu">{t('Cerita')}<ChevronDown size={16} /></button>
        {menuOpen && <div className="menu-popover" id="story-menu">
          <button onClick={() => run(goHome)}>{t('Semua cerita')}</button>
          <button onClick={() => run(() => createProject(t('Cerita baru')))}>{t('Buat cerita')}</button>
          <button onClick={() => { setMenuOpen(false); onOpenScript(); }}><FileText size={16} />{t('Naskah Cepat')}</button>
          <button disabled={backupBusy} onClick={() => run(async () => {
            setBackupBusy(true);
            try { const failures = await downloadProjectAsJson(project); if (failures.length) setError({ code: 'File tersimpan. {n} gambar masih memakai tautan luar. Unggah gambar tersebut agar ikut tersimpan dalam file cerita.', details: { n: failures.length } }); }
            finally { setBackupBusy(false); }
          })}><FileDown size={16} />{t(backupBusy ? 'Menyiapkan file…' : 'Simpan file cerita')}</button>
          <p>{t('File untuk melanjutkan edit, bukan gambar. Format .aujson.')}</p>
          <button onClick={() => fileRef.current?.click()}><FileUp size={16} />{t('Buka file cerita')}</button>
          <button onClick={() => { setMenuOpen(false); if (onGuide) onGuide(); else location.hash = '/help'; }}><HelpCircle size={16} />{t('Panduan singkat')}</button>
          <a href="#/help">{t('Bantuan')}</a>
        </div>}
      </div><button className="button primary header-download" aria-label={t('Unduh gambar')} onClick={onOpenExport}><Download size={17} /><span>{t('Unduh gambar')}</span></button>
    </div>
    <input ref={fileRef} className="visually-hidden" type="file" accept=".aujson,.json,application/json" tabIndex={-1} aria-label={t('Buka file cerita')} onChange={loadFile} />
    {saveStatus === 'error' && <div className="save-warning" role="alert"><span>{t('Cerita tidak dapat disimpan. Unduh file cerita sebagai cadangan, lalu coba lagi.')}</span><button className="text-button" onClick={() => run(saveNow)}>{t('Coba lagi')}</button></div>}
    {error && <div className="header-error" role="alert">{errorText(error)}<button onClick={() => setError('')} aria-label={t('Tutup pesan')}>×</button></div>}
  </header>;
}
