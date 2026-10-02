import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Download, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useUI } from '../../context/UIContext';
import { storyError } from '../../services/errors';
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
  const { t, errorText } = useUI();
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
    if (slide.type === 'composition' && !slide.composition.items.length) throw storyError('Kolase belum memiliki bagian. Tambahkan adegan dari panel Edit.');
    if (slide.type === 'ig_post' && !slide.content?.imageUrl) {
      throw storyError('Slide {n} belum memiliki foto postingan. Tambahkan foto lewat panel Edit.', { n: index + 1 });
    }
    if (slide.type === 'custom_app' && slide.content?.elements?.some(item => item.type === 'image' && !item.src)) {
      throw storyError('Slide {n} memiliki blok gambar kosong. Pilih gambar lewat panel Edit.', { n: index + 1 });
    }
    flushSync(() => setRenderSlide(slide));
    await document.fonts.ready;
    const target = screenRef.current;
    await checkExportAssets(target);
    if (hasHiddenContent(target)) {
      throw storyError('Slide {n} memiliki isi di luar layar. Atur posisi layar, bagi ke adegan berikutnya, atau tandai pemotongan yang disengaja di panel Edit.', { n: index + 1 });
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
          setProgress(t('Memproses slide {current} dari {total}', { current: index + 1, total: project.slides.length }));
          return renderBlob(slide, index);
        }, project.title + '_' + surface);
        setProgress(t('ZIP berhasil diunduh.'));
      } else {
        const slide = project.slides[activeSlideIndex];
        setProgress(t('Membuat gambar…'));
        const blob = await renderBlob(slide, activeSlideIndex);
        saveBlob(blob, String(activeSlideIndex + 1).padStart(2, '0') + '_' + slide.type + '_' + surface + '.png');
        setProgress(t('PNG berhasil diunduh.'));
      }
    } catch (cause) {
      setError(errorText(cause));
      setProgress('');
    } finally {
      setBusy(false);
      setRenderSlide(project.slides[activeSlideIndex]);
    }
  };

  return <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section ref={dialog} className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
      <div className="dialog-heading"><div><h2 id="export-title">{t('Unduh gambar')}</h2><p>{t('Gambar siap dibagikan. Untuk melanjutkan edit, pilih Simpan file cerita.')}</p></div>
        <button className="icon-button" onClick={onClose} disabled={busy} aria-label={t('Tutup')}><X size={19} /></button></div>
      <div className="export-options">
        <p className="field-hint">{t('Potongan dan kolase mengikuti pratinjau Lihat hasil.')}</p>
        <fieldset disabled={busy}><legend>{t('Bagian yang diunduh')}</legend>
          <label><input type="radio" checked={scope === 'current'} onChange={() => setScope('current')} />{t('Slide ini · gambar PNG')}</label>
          <label><input type="radio" checked={scope === 'all'} onChange={() => setScope('all')} />{t('Semua slide · kumpulan gambar ZIP')}</label>
        </fieldset>
        <fieldset disabled={busy}><legend>{t('Tampilan gambar')}</legend>
          <label><input type="radio" checked={surface === 'screen'} onChange={() => setSurface('screen')} />{t('Layar saja')}</label>
          <label><input type="radio" checked={surface === 'phone'} onChange={() => setSurface('phone')} />{t('HP dengan bingkai')}</label>
        </fieldset>
        <label className="field"><span>{t('Ketajaman gambar')}</span><select aria-label={t('Ketajaman gambar')} disabled={busy} value={resolution} onChange={event => setResolution(Number(event.target.value))}>
          <option value="1">{t('Standar · 1×')}</option><option value="2">{t('Tajam · 2×')}</option><option value="3">{t('Paling tajam · 3×')}</option></select></label>
        <p className="field-hint">{t('Ukuran gambar: {width} × {height} piksel. Sisi terpanjang maksimal 4096 piksel.', { width: Math.round(dimensions.width * Math.min(resolution, 4096 / Math.max(dimensions.width, dimensions.height))), height: Math.round(dimensions.height * Math.min(resolution, 4096 / Math.max(dimensions.width, dimensions.height))) })}</p>
      </div>
      {error && <div className="export-error" role="alert">{error}<button className="text-button" onClick={() => {
        setActiveSlideIndex(failedIndex ?? activeSlideIndex); setEditTarget('viewport'); onClose();
      }}>{t('Perbaiki slide atau unggah gambar pengganti')}</button></div>}
      {progress && <p className="export-progress" role="status">{progress}</p>}
      <div className="dialog-footer"><button className="button secondary" onClick={onClose} disabled={busy}>{t('Tutup')}</button>
        <button className="button primary" onClick={exportNow} disabled={busy}><Download size={17} />{busy ? t('Membuat gambar…') : t('Unduh {format}', { format: scope === 'all' ? 'ZIP' : 'PNG' })}</button></div>
    </section>
    <div className="offscreen-export" aria-hidden="true"><OutputRenderer ref={screenRef} slide={renderSlide} surface={surface} /></div>
  </div>;
}
