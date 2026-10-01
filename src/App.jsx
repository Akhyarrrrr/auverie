import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Layers3, MonitorSmartphone, Plus, Settings2, Users, ZoomIn, ZoomOut } from 'lucide-react';
import { useProject } from './context/ProjectContext';
import { readPreference, savePreference, useUI } from './context/UIContext';
import Onboarding from './components/Onboarding';
import Home, { InfoPage } from './components/Home';
import { Brand } from './components/InterfaceControls';
import StudioHeader from './components/studio/StudioHeader';
import StoryboardStrip from './components/studio/StoryboardStrip';
import CharacterManager from './components/studio/CharacterManager';
import DeviceSettingsPanel from './components/studio/DeviceSettingsPanel';
import SlideInspector from './components/studio/SlideInspector';
import PhoneContainer from './components/phone/PhoneContainer';
import QuickScriptModal from './components/studio/QuickScriptModal';
import OutputRenderer from './components/phone/OutputRenderer';
import { deviceMetrics, outputDimensions } from './services/sceneModel';
import { sceneIdentity } from './data/sceneCatalog';
const ExportDialog = lazy(() => import('./components/studio/ExportDialog'));

export default function App() {
  const { ready, loadError, retryLoad, project, activeSlide, activeSlideIndex, activeTab, setActiveTab, editTarget, setEditTarget,
    interactionMode, setInteractionMode, duplicateSlide } = useProject();
  const { t } = useUI();
  const [route, setRoute] = useState(() => location.hash || '#/');
  const [mobileView, setMobileView] = useState('preview');
  const [zoom, setZoom] = useState(1), [stageSize, setStageSize] = useState({ width: 380, height: 660 });
  const [scriptOpen, setScriptOpen] = useState(false), [exportOpen, setExportOpen] = useState(false);
  const [outputPreview, setOutputPreview] = useState(false), [outputSurface, setOutputSurface] = useState('screen');
  const [guideOpen, setGuideOpen] = useState(false);
  const stageRef = useRef(null);
  const editor = route === '#/editor' && Boolean(project);
  useEffect(() => {
    const changed = () => { setRoute(location.hash || '#/'); document.querySelector('.project-start')?.scrollTo(0, 0); };
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);
  useEffect(() => { if (route === '#/examples') document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' }); }, [route, ready]);
  useEffect(() => {
    if (!editor || !stageRef.current) return;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect; setStageSize({ width: rect.width, height: rect.height });
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [editor, mobileView]);
  useEffect(() => { if (editTarget && window.matchMedia('(max-width: 960px)').matches) setMobileView('edit'); }, [editTarget]);

  if (!ready) return <main className="loading-screen" role="status"><Brand /><span className="loading-line" /><p>{t('Menyiapkan ruang ceritamu…')}</p></main>;
  if (loadError) return <main className="loading-screen"><Brand /><p role="alert">{t('Penyimpanan browser tidak dapat dibuka. Coba muat ulang atau gunakan browser biasa.')}</p><button className="button primary" onClick={retryLoad}>{t('Coba lagi')}</button></main>;
  if (route === '#/help' || route === '#/about') return <InfoPage about={route === '#/about'} />;
  if (!editor && ['#/', '#/examples', '#/editor'].includes(route)) return <Home onEnter={first => { setMobileView('preview'); setZoom(1); setOutputPreview(false); if (first && !readPreference('auverie_onboarding_v1', '')) setGuideOpen(true); location.hash = '/editor'; }} />;
  if (!editor) return <main className="loading-screen"><Brand /><h1>{t('Halaman tidak ditemukan.')}</h1><p>{t('Buka beranda untuk melanjutkan ceritamu.')}</p><a className="button primary" href="#/">{t('Kembali ke beranda')}</a></main>;

  const isOutput = outputPreview || activeSlide?.type === 'composition';
  const metrics = deviceMetrics(activeSlide, project.globalSettings);
  const dimensions = isOutput ? outputDimensions(activeSlide, project.globalSettings, outputSurface) : { width: metrics.outerWidth, height: metrics.outerHeight };
  const fit = Math.min(1, Math.max(0.05, (stageSize.width - 36) / dimensions.width), Math.max(0.05, (stageSize.height - 24) / dimensions.height));
  const scale = Math.max(0.05, Math.min(1.5, fit * zoom));
  const onPreviewClick = event => {
    if (!isOutput && interactionMode !== 'edit') return;
    const target = activeSlide.type === 'composition' ? event.target.closest('.composition-part') : event.target.closest('[data-edit-target]');
    if (!target) return;
    setEditTarget(target.dataset.editTarget);
    if (window.matchMedia('(max-width: 960px)').matches) setMobileView('edit');
  };
  return <div className="studio-layout">
    <StudioHeader onOpenScript={() => setScriptOpen(true)} onOpenExport={() => setExportOpen(true)} onGuide={() => setGuideOpen(true)} />
    <div className="studio-body">
      <aside className={'workspace-left mobile-' + mobileView}>
        <div className="workspace-tabs" role="group" aria-label={t('Area kerja')}>
          {[[ 'scenes', 'Slide', Layers3 ], [ 'characters', 'Tokoh', Users ], [ 'device', 'HP', MonitorSmartphone ]].map(([tab, label, Icon]) => <button key={tab} aria-pressed={activeTab === tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}><Icon size={16} />{t(label)}</button>)}
        </div><div className="workspace-left-content">{activeTab === 'scenes' ? <StoryboardStrip onSelectSlide={() => setMobileView('preview')} /> : activeTab === 'characters' ? <CharacterManager /> : <DeviceSettingsPanel />}</div>
      </aside>
      <main className={'canvas-viewport mobile-' + mobileView}>
        <div className="preview-topline"><div><strong>{activeSlide?.title || t('Slide')}</strong><span>{t('Slide {current} dari {total}', { current: activeSlideIndex + 1, total: project.slides.length })}</span></div>
          <div className="preview-tools"><button className="icon-button" onClick={() => setZoom(value => Math.max(0.65, value - 0.1))} aria-label={t('Perkecil pratinjau')}><ZoomOut size={18} /></button><span>{Math.round(zoom * 100)}%</span>
            <button className="icon-button" onClick={() => setZoom(value => Math.min(1.6, value + 0.1))} aria-label={t('Perbesar pratinjau')}><ZoomIn size={18} /></button><button className="text-button" onClick={() => setZoom(1)}>{t('Pas')}</button></div>
        </div>
        <div className="simulation-toolbar"><div className="mode-switch" role="group" aria-label={t('Cara menggunakan pratinjau')}>
          <button className={!isOutput && interactionMode === 'operate' ? 'active' : ''} disabled={activeSlide.type === 'composition' || activeSlide.renderVersion === 2} onClick={() => { setOutputPreview(false); setInteractionMode('operate'); }}>{t('Coba layar HP')}</button>
          <button className={!isOutput && interactionMode === 'edit' ? 'active' : ''} disabled={activeSlide.type === 'composition'} onClick={() => { setOutputPreview(false); setInteractionMode('edit'); }}>{t('Ubah isi')}</button>
          <button className={isOutput ? 'active' : ''} onClick={() => setOutputPreview(true)}>{t('Lihat hasil')}</button>
        </div><button className="button secondary capture-scene" title={t('Slide sebelumnya tetap tersimpan; cerita berikutnya dimulai dari salinan layar ini.')} onClick={() => duplicateSlide(activeSlide.id)}><Plus size={15} />{t('Lanjutkan ke slide baru')}</button>
          {activeSlide.renderVersion === 2 && sceneIdentity(activeSlide).app && <button className="text-button" onClick={() => duplicateSlide(activeSlide.id, { modern: true })}>{t('Salin ke tampilan terbaru')}</button>}
          {isOutput && activeSlide.type !== 'composition' && <select aria-label={t('Bingkai hasil')} value={outputSurface} onChange={event => setOutputSurface(event.target.value)}><option value="screen">{t('Layar saja')}</option><option value="phone">{t('Dengan bingkai')}</option></select>}
        </div>
        <div className="phone-stage-wrapper" ref={stageRef} onClick={onPreviewClick}><div className="phone-scale-shell" style={{ width: dimensions.width * scale, height: dimensions.height * scale }}>
          {isOutput ? <OutputRenderer slide={activeSlide} surface={outputSurface} zoom={scale} editable={activeSlide.type === 'composition'} /> : <PhoneContainer slide={activeSlide} zoom={scale} interactive={interactionMode === 'operate'} editable={interactionMode === 'edit'} />}
        </div></div>
        <div className="preview-hint"><Settings2 size={15} />{t(isOutput ? 'Potongan dan kolase ini sama dengan hasil yang akan diunduh.' : interactionMode === 'operate' ? 'Ketik dan kirim sebagai bagian cerita. Gunakan slide baru untuk menyimpan momen berikutnya.' : 'Ketuk bagian layar untuk mengubah isi atau tampilannya.')}</div>
      </main><div className={'inspector-shell mobile-' + mobileView}><SlideInspector /></div>
    </div><nav className="mobile-nav" aria-label={t('Navigasi editor')}>
      {[[ 'slides', 'Slide', Layers3 ], [ 'preview', 'Pratinjau', MonitorSmartphone ], [ 'edit', 'Edit', Settings2 ]].map(([view, label, Icon]) => <button key={view} className={mobileView === view ? 'active' : ''} onClick={() => setMobileView(view)}><Icon size={19} />{t(label)}</button>)}
    </nav><QuickScriptModal isOpen={scriptOpen} onClose={() => setScriptOpen(false)} />
    {exportOpen && <Suspense fallback={<div className="dialog-backdrop"><div className="download-loading" role="status"><Brand compact /><p>{t('Menyiapkan unduhan…')}</p></div></div>}><ExportDialog onClose={() => setExportOpen(false)} /></Suspense>}
    {guideOpen && <Onboarding onClose={() => { setGuideOpen(false); savePreference('auverie_onboarding_v1', 'seen'); }} />}
  </div>;
}
