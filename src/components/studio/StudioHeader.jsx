import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Download, FileUp, FileDown, Moon, Redo2, Sun, Undo2, WandSparkles } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { downloadProjectAsJson, parseProjectJsonFile } from '../../services/storage';

export default function StudioHeader({ onOpenScript, onOpenExport, studioTheme, onToggleStudioTheme }) {
  const { project, updateTitle, closeProject, createProject, importProject, saveStatus,
    canUndo, canRedo, undo, redo } = useProject();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [backupBusy, setBackupBusy] = useState(false);
  const fileRef = useRef(null);
  useEffect(() => {
    const key = event => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.target.closest('input,textarea,[contenteditable=true]')) return;
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      else if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [undo, redo]);
  const run = async action => {
    try { setError(''); await action(); setMenuOpen(false); }
    catch (cause) { setError(cause.message || 'Proyek tidak dapat disimpan.'); }
  };

  const loadFile = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      await importProject(await parseProjectJsonFile(file));
      setMenuOpen(false);
      setError('');
    } catch (cause) {
      setError(cause.message || 'Proyek tidak dapat dibuka.');
    }
  };

  return <header className="studio-header">
    <div className="header-project">
      <button className="icon-button header-back" onClick={() => run(closeProject)} aria-label="Lihat semua proyek" title="Lihat semua proyek"><ArrowLeft size={18} /></button>
      <div className="brand-mark" aria-hidden="true">au<span>.</span></div>
      <div className="project-heading">
        <label htmlFor="project-title">Judul cerita</label>
        <input id="project-title" value={project.title} onChange={e => updateTitle(e.target.value)} aria-label="Judul cerita" />
      </div>
      <span className={`save-indicator ${saveStatus}`} role="status">
        {saveStatus === 'saving' ? 'Menyimpan…' : saveStatus === 'error' ? 'Gagal menyimpan' : 'Tersimpan'}
      </span>
    </div>

    <div className="header-actions">
      <div className="history-actions">
        <button className="icon-button" onClick={undo} disabled={!canUndo} title="Urungkan" aria-label="Urungkan"><Undo2 size={18} /></button>
        <button className="icon-button" onClick={redo} disabled={!canRedo} title="Ulangi" aria-label="Ulangi"><Redo2 size={18} /></button>
      </div>
      <button className="button secondary header-script" onClick={onOpenScript} aria-label="Naskah Cepat"><WandSparkles size={17} /> <span>Naskah Cepat</span></button>
      <button className="icon-button header-theme" onClick={onToggleStudioTheme} title="Ganti tema studio" aria-label="Ganti tema studio">
        {studioTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="menu-anchor">
        <button className="button secondary header-project-menu" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen}>
          Proyek <ChevronDown size={16} />
        </button>
        {menuOpen && <div className="menu-popover" role="menu">
          <button role="menuitem" onClick={() => run(closeProject)}>Semua proyek</button>
          <button role="menuitem" onClick={() => run(createProject)}>Buat proyek baru</button>
          <button role="menuitem" disabled={backupBusy} onClick={() => run(async () => {
            setBackupBusy(true);
            try { const failures = await downloadProjectAsJson(project);
              if (failures.length) setError(`Cadangan diunduh. ${failures.length} gambar masih memakai tautan luar: ${failures[0].slice(0, 100)}. Unggah berkasnya agar cadangan sepenuhnya portabel.`);
            } finally { setBackupBusy(false); }
          })}><FileDown size={16} /> {backupBusy ? 'Menyiapkan cadangan…' : 'Simpan cadangan .aujson'}</button>
          <button role="menuitem" onClick={() => fileRef.current?.click()}><FileUp size={16} /> Impor proyek .aujson</button>
        </div>}
      </div>
      <button className="button primary" onClick={onOpenExport}><Download size={17} /> <span>Ekspor</span></button>
    </div>
    <input ref={fileRef} className="visually-hidden" type="file" accept=".aujson,application/json" onChange={loadFile} />
    {error && <div className="header-error" role="alert">{error}<button onClick={() => setError('')} aria-label="Tutup pesan">×</button></div>}
  </header>;
}
