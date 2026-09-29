import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Download, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import OutputRenderer from '../phone/OutputRenderer';
import { outputDimensions } from '../../services/sceneModel';
import { useDialogFocus } from './AssetPickerModal';
import { batchExportSlidesAsZip, checkExportAssets, exportElementAsBlob, hasHiddenContent } from '../../services/exportService';

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ExportDialog({ onClose }) {
  const { project, activeSlideIndex, setActiveSlideIndex, setEditTarget } = useProject();
  const [surface, setSurface] = useState('screen');
  const [scope, setScope] = useState('current');
  const [renderSlide, setRenderSlide] = useState(project.slides[activeSlideIndex]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const screenRef = useRef(null);
  const dialog = useRef(null);
  useDialogFocus(dialog, () => { if (!busy) onClose(); });
  const [failedIndex, setFailedIndex] = useState(null);
  const [resolution, setResolution] = useState(2);
  const dimensions = outputDimensions(project.slides[activeSlideIndex], project.globalSettings, surface);

  const renderBlob = async (slide, index) => {
    setFailedIndex(index);
    if (slide.type === 'composition' && !slide.composition.items.length) throw new Error('Kolase belum memiliki bagian. Tambahkan adegan dari panel Edit.');
    if (slide.type === 'ig_post' && !slide.content?.imageUrl) {
      throw new Error('Slide ' + (index + 1) + ' belum memiliki foto postingan. Tambahkan foto lewat panel Edit.');
    }
    if (slide.type === 'custom_app' && slide.content?.elements?.some(item => item.type === 'image' && !item.src)) {
      throw new Error('Slide ' + (index + 1) + ' memiliki blok gambar kosong. Pilih gambar lewat panel Edit.');
    }
    flushSync(() => setRenderSlide(slide));
    await document.fonts.ready;
    const target = screenRef.current;
    await checkExportAssets(target);
    if (hasHiddenContent(target)) {
      throw new Error('Slide ' + (index + 1) + ' memiliki isi di luar layar. Atur posisi layar, bagi ke adegan berikutnya, atau tandai pemotongan yang disengaja di panel Edit.');
    }
    const size = outputDimensions(slide, project.globalSettings, surface);
    return exportElementAsBlob(target, Math.min(resolution, 4096 / Math.max(size.width, size.height)));
  };

  const exportNow = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      if (scope === 'all') {
        await batchExportSlidesAsZip(project.slides, async (slide, index) => {
          setProgress('Memproses slide ' + (index + 1) + ' dari ' + project.slides.length);
          return renderBlob(slide, index);
        }, project.title + '_' + surface);
        setProgress('ZIP berhasil diunduh.');
      } else {
        const slide = project.slides[activeSlideIndex];
        setProgress('Membuat gambar…');
        const blob = await renderBlob(slide, activeSlideIndex);
        saveBlob(blob, String(activeSlideIndex + 1).padStart(2, '0') + '_' + slide.type + '_' + surface + '.png');
        setProgress('PNG berhasil diunduh.');
      }
    } catch (cause) {
      setError(cause.message || 'Ekspor gagal. Coba lagi.');
      setProgress('');
    } finally {
      setBusy(false);
      setRenderSlide(project.slides[activeSlideIndex]);
    }
  };

  return <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section ref={dialog} className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
      <div className="dialog-heading"><div><h2 id="export-title">Ekspor cerita</h2><p>Unduh hasil tanpa kontrol editor.</p></div>
        <button className="icon-button" onClick={onClose} disabled={busy} aria-label="Tutup"><X size={19} /></button></div>
      <div className="export-options">
        <p className="field-hint">Crop dan salinan kolase ikut diekspor. Lihat “Hasil unduhan” di pratinjau untuk memeriksa komposisinya.</p>
        <fieldset><legend>Bagian yang diunduh</legend>
          <label><input type="radio" checked={scope === 'current'} onChange={() => setScope('current')} /> Slide ini</label>
          <label><input type="radio" checked={scope === 'all'} onChange={() => setScope('all')} /> Semua slide (.zip)</label>
        </fieldset>
        <fieldset><legend>Tampilan gambar</legend>
          <label><input type="radio" checked={surface === 'screen'} onChange={() => setSurface('screen')} /> Layar saja</label>
          <label><input type="radio" checked={surface === 'phone'} onChange={() => setSurface('phone')} /> HP dengan bingkai</label>
        </fieldset>
        <label className="field"><span>Resolusi PNG</span><select value={resolution} onChange={event => setResolution(Number(event.target.value))}>
          <option value="1">1× ukuran layar</option><option value="2">2× · tajam</option><option value="3">3× · paling tajam</option></select></label>
        <p className="field-hint">Slide ini: {dimensions.width} × {dimensions.height} px logis. Sisi terpanjang hasil dibatasi 4096 px.</p>
      </div>
      {error && <div className="export-error" role="alert">{error}<button className="text-button" onClick={() => {
        setActiveSlideIndex(failedIndex ?? activeSlideIndex); setEditTarget('viewport'); onClose();
      }}>Buka slide bermasalah / unggah gambar pengganti</button></div>}
      {progress && <p className="export-progress" role="status">{progress}</p>}
      <div className="dialog-footer"><button className="button secondary" onClick={onClose} disabled={busy}>Tutup</button>
        <button className="button primary" onClick={exportNow} disabled={busy}><Download size={17} /> {busy ? 'Mengekspor…' : 'Unduh ' + (scope === 'all' ? 'ZIP' : 'PNG')}</button></div>
    </section>
    <div className="offscreen-export" aria-hidden="true"><OutputRenderer ref={screenRef} slide={renderSlide} surface={surface} /></div>
  </div>;
}
