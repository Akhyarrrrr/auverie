import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, FileUp, FolderOpen, Layers3, MonitorSmartphone, Plus, Settings2, Users, ZoomIn, ZoomOut } from 'lucide-react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { SAMPLE_PROJECT } from './data/samplePresets';
import { parseProjectJsonFile } from './services/storage';
import StudioHeader from './components/studio/StudioHeader';
import StoryboardStrip from './components/studio/StoryboardStrip';
import CharacterManager from './components/studio/CharacterManager';
import DeviceSettingsPanel from './components/studio/DeviceSettingsPanel';
import SlideInspector from './components/studio/SlideInspector';
import PhoneContainer from './components/phone/PhoneContainer';
import QuickScriptModal from './components/studio/QuickScriptModal';
const ExportDialog = lazy(() => import('./components/studio/ExportDialog'));
import OutputRenderer from './components/phone/OutputRenderer';
import { deviceMetrics, outputDimensions } from './services/sceneModel';
import { SCENE_APPS, sceneDefaults, sceneIdentity } from './data/sceneCatalog';

const homeSlides = [
  { label: 'WhatsApp', detail: 'Chat dan grup', slide: SAMPLE_PROJECT.slides[1] },
  { label: 'X Chat', detail: 'Pesan dan postingan', slide: {
    id: 'home-x-chat', type: 'x_dm', title: 'X Chat', customSettings: { theme: 'dark' },
    content: { targetCharacterId: 'char-reyhan', messages: [
      { id: 'home-x-1', senderId: 'char-reyhan', text: 'Kamu masih bangun?', time: '23.42' },
      { id: 'home-x-2', senderId: 'me', text: 'Masih. Ada apa?', time: '23.43', status: 'read' },
      { id: 'home-x-3', senderId: 'char-reyhan', text: 'Besok ketemu sebentar, ya. Ada yang ingin aku ceritakan.', time: '23.44' }
    ] }
  } },
  { label: 'Instagram', detail: 'DM, post, dan story', slide: SAMPLE_PROJECT.slides[4] },
  { label: 'Layar kunci', detail: 'Notifikasi cerita', slide: SAMPLE_PROJECT.slides[0] },
  { label: 'Aplikasi bebas', detail: 'Rancang layar sendiri', slide: {
    id: 'home-custom', type: 'custom_app', title: 'Aplikasi bebas', customSettings: { theme: 'light', phoneModel: 'samsung-s24-ultra' },
    content: { appName: 'Catatan', backgroundColor: '#f2eee5', elements: [
      { id: 'home-appbar', type: 'appbar', text: 'catatan.', x: 0, y: 0, width: 100, height: 10, background: '#ffffff', fontSize: 19, radius: 0 },
      { id: 'home-title', type: 'text', text: 'Hal-hal yang belum sempat kita katakan', x: 7, y: 17, width: 86, height: 18, fontSize: 27, color: '#2b3933' },
      { id: 'home-note', type: 'notification', title: 'Draf baru', text: 'Sebuah cerita dimulai dari pesan yang belum terkirim.', x: 7, y: 43, width: 86, height: 14, fontSize: 15, background: '#ffffff' },
      { id: 'home-button', type: 'button', text: 'Buka catatan', x: 7, y: 80, width: 86, height: 8, fontSize: 14, background: '#176c59', color: '#ffffff' }
    ] }
  } }
];
homeSlides.forEach(item => { item.slide = { ...item.slide, renderVersion: 3 }; });
SCENE_APPS.filter(app => !['whatsapp', 'x', 'instagram'].includes(app.id)).forEach(app => {
  const screen = app.id === 'spotify' ? 'player' : app.id === 'notes' ? 'note' : app.id === 'phone' ? 'call' : app.id === 'tiktok' ? 'reel' : app.id === 'facebook' ? 'feed' : 'chat';
  homeSlides.push({ label: app.name, detail: 'Contoh adegan ' + app.name, slide: { id: 'home-' + app.id, type: 'app_scene', renderVersion: 3,
    title: app.name, customSettings: { theme: 'light' }, sceneState: { screen }, viewport: { anchor: 'bottom' }, content: {
      ...sceneDefaults(app.id, screen, SAMPLE_PROJECT), text: 'Ada cerita yang dimulai dari satu pesan sederhana. Malam ini, kita mulai lagi.',
      caption: 'Menyimpan sedikit cerita dari hari ini.', albumArt: SAMPLE_PROJECT.slides[4].content?.imageUrl,
      mediaUrl: SAMPLE_PROJECT.slides[4].content?.imageUrl,
      messages: [{ id: 'demo-1', kind: 'text', senderId: SAMPLE_PROJECT.characters[0].id, text: 'Besok kita ketemu di tempat biasa?', time: '21:30' },
        { id: 'demo-2', kind: 'text', senderId: 'me', text: 'Iya. Ada banyak cerita yang ingin kubagikan.', time: '21:31', status: 'read' }]
    } } });
});
const homeDemoProject = { ...SAMPLE_PROJECT, slides: homeSlides.map(item => item.slide) };

function ProjectStart() {
  const { recentProjects, createProject, startExample, openProject, importProject } = useProject();
  const [error, setError] = useState('');
  const [demoIndex, setDemoIndex] = useState(0);
  const demoSize = deviceMetrics(homeSlides[demoIndex].slide, SAMPLE_PROJECT.globalSettings);
  const demoScale = Math.min(544 / demoSize.outerHeight, 285 / demoSize.outerWidth);
  const fileRef = useRef(null);
  const run = async action => {
    try { setError(''); await action(); }
    catch (cause) { setError(cause.message || 'Proyek tidak dapat dibuka.'); }
  };
  const loadFile = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) await run(async () => importProject(await parseProjectJsonFile(file)));
  };
  return <main className="project-start">
    <header><div className="brand-mark" aria-hidden="true">au<span>.</span></div><span>Studio cerita visual</span></header>
    <div className="start-content">
      <section className="start-hero" aria-labelledby="start-title">
        <div className="start-intro">
          <h1 id="start-title">Buat cerita AU yang terlihat seperti layar HP sungguhan.</h1>
          <p>Susun percakapan, postingan, profil, media, dan panggilan lewat simulasi HP. Tangkap adegan ceritamu, lalu unduh layar, potongan, atau kolase.</p>
          <div className="start-actions">
            <button className="start-main-action" onClick={() => run(() => createProject())}><Plus size={19} /> Buat cerita <ArrowRight size={18} /></button>
            <button className="start-example-action" onClick={() => run(() => startExample())}>Coba cerita contoh</button>
          </div>
          <button className="start-import-action" onClick={() => fileRef.current?.click()}><FileUp size={16} /> Sudah punya proyek? Impor .aujson</button>
          <p className="start-format-note">iPhone & Android · Warna bebas · Keyboard & stiker · PNG & ZIP</p>
        </div>
        <div className="start-demo" aria-label="Contoh tampilan AU">
          <div className="start-demo-heading"><strong>Begini hasilnya</strong><span>{homeSlides[demoIndex].detail}</span></div>
          <div className="start-demo-stage">
            <div className="start-demo-phone" aria-hidden="true" style={{ width: demoSize.outerWidth * demoScale, height: demoSize.outerHeight * demoScale }}>
              <ProjectProvider previewProject={homeDemoProject}>
                <PhoneContainer slide={homeSlides[demoIndex].slide} zoom={demoScale} />
              </ProjectProvider>
            </div>
          </div>
          <div className="start-demo-picker" aria-label="Pilih contoh format">
            {homeSlides.slice(0, 5).map((item, index) => <button key={item.label} type="button" aria-pressed={demoIndex === index}
              className={demoIndex === index ? 'active' : ''} onClick={() => setDemoIndex(index)}>{item.label}</button>)}
          </div>
          <label className="field start-more-demos"><span>Lihat aplikasi lainnya</span><select value={demoIndex} onChange={event => setDemoIndex(Number(event.target.value))}>
            {homeSlides.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}
          </select></label>
        </div>
      </section>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <section className="start-steps" aria-labelledby="start-steps-title"><h2 id="start-steps-title">Dari ide menjadi slide cerita</h2>
        <ol><li><strong>Pilih tampilan</strong><span>Mulai dari aplikasi yang cocok dengan adeganmu.</span></li>
          <li><strong>Susun dan tangkap adegan</strong><span>Kirim konten cerita lewat HP atau edit setiap detail dari panel.</span></li>
          <li><strong>Atur hasil dan unduh</strong><span>Pilih layar penuh, crop keyboard, atau kolase. Unduh PNG dan ZIP.</span></li></ol>
      </section>
      <section className="start-categories" aria-labelledby="categories-title"><h2 id="categories-title">Satu cerita, berbagai bentuk adegan</h2><div>
        {[['Percakapan', 'Pesan, foto, album, stiker, voice note, draft, dan keyboard.', 0], ['Postingan dan profil', 'Feed, komentar, metrik, story, Reels, dan halaman akun.', 2],
          ['Notifikasi dan panggilan', 'Layar kunci, panggilan masuk, aktif, dan berakhir.', 3], ['Musik dan narasi', 'Lagu, playlist, lirik, catatan, dan daftar centang.', homeSlides.findIndex(item => item.slide.content?.app === 'spotify')],
          ['Aplikasi bebas', 'Susun elemen di atas latar sendiri.', 4], ['Potongan dan kolase', 'Ambil bagian layar yang bercerita, lalu susun salinan adegan.', 0]].map(([title, detail, index]) =>
            <button key={title} onClick={() => setDemoIndex(index)}><strong>{title}</strong><span>{detail}</span></button>)}
      </div></section>
      {!!recentProjects.length && <section className="recent-projects"><h2>Proyek di browser ini</h2>
        <div>{recentProjects.map(item => <button key={item.id} onClick={() => run(() => openProject(item.id))}>
          <FolderOpen size={18} /><span><strong>{item.title}</strong><small>{item.slides.length} slide</small></span>
        </button>)}</div></section>}
    </div>
    <input ref={fileRef} type="file" accept=".aujson,application/json" className="visually-hidden" onChange={loadFile} />
  </main>;
}

export default function App() {
  const { ready, project, activeSlide, activeSlideIndex, activeTab, setActiveTab, editTarget, setEditTarget,
    interactionMode, setInteractionMode, duplicateSlide } = useProject();
  const [mobileView, setMobileView] = useState('preview');
  const [zoom, setZoom] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 380, height: 660 });
  const [scriptOpen, setScriptOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [outputPreview, setOutputPreview] = useState(false);
  const [outputSurface, setOutputSurface] = useState('screen');
  const [studioTheme, setStudioTheme] = useState(() => localStorage.getItem('au_studio_theme') || 'light');
  const stageRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.studioTheme = studioTheme;
    localStorage.setItem('au_studio_theme', studioTheme);
  }, [studioTheme]);
  useEffect(() => {
    if (!project || !stageRef.current) return;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setStageSize({ width: rect.width, height: rect.height });
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [project, mobileView]);
  useEffect(() => {
    if (editTarget && window.matchMedia('(max-width: 960px)').matches) setMobileView('edit');
  }, [editTarget]);

  if (!ready) return <div className="loading-screen" role="status">Membuka AU Studio…</div>;
  if (!project) return <ProjectStart />;

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
    <StudioHeader onOpenScript={() => setScriptOpen(true)} onOpenExport={() => setExportOpen(true)}
      studioTheme={studioTheme} onToggleStudioTheme={() => setStudioTheme(value => value === 'light' ? 'dark' : 'light')} />
    <div className="studio-body">
      <aside className={'workspace-left mobile-' + mobileView}>
        <div className="workspace-tabs" role="tablist" aria-label="Area kerja">
          <button role="tab" aria-selected={activeTab === 'scenes'} className={activeTab === 'scenes' ? 'active' : ''} onClick={() => setActiveTab('scenes')}><Layers3 size={16} /> Slide</button>
          <button role="tab" aria-selected={activeTab === 'characters'} className={activeTab === 'characters' ? 'active' : ''} onClick={() => setActiveTab('characters')}><Users size={16} /> Tokoh</button>
          <button role="tab" aria-selected={activeTab === 'device'} className={activeTab === 'device' ? 'active' : ''} onClick={() => setActiveTab('device')}><MonitorSmartphone size={16} /> HP</button>
        </div>
        <div className="workspace-left-content">
          {activeTab === 'scenes' ? <StoryboardStrip onSelectSlide={() => setMobileView('preview')} />
            : activeTab === 'characters' ? <CharacterManager />
              : <DeviceSettingsPanel />}
        </div>
      </aside>
      <main className={'canvas-viewport mobile-' + mobileView}>
        <div className="preview-topline"><div><strong>{activeSlide?.title || 'Slide'}</strong><span>Slide {activeSlideIndex + 1} dari {project.slides.length}</span></div>
          <div className="preview-tools"><button className="icon-button" onClick={() => setZoom(value => Math.max(0.65, value - 0.1))} aria-label="Perkecil pratinjau"><ZoomOut size={18} /></button>
            <span>{Math.round(zoom * 100)}%</span>
            <button className="icon-button" onClick={() => setZoom(value => Math.min(1.6, value + 0.1))} aria-label="Perbesar pratinjau"><ZoomIn size={18} /></button>
            <button className="text-button" onClick={() => setZoom(1)}>Pas</button></div>
        </div>
        <div className="simulation-toolbar"><div className="mode-switch" role="group" aria-label="Cara menggunakan pratinjau">
          <button className={!isOutput && interactionMode === 'operate' ? 'active' : ''} disabled={activeSlide.type === 'composition' || activeSlide.renderVersion === 2} onClick={() => { setOutputPreview(false); setInteractionMode('operate'); }}>Gunakan HP</button>
          <button className={!isOutput && interactionMode === 'edit' ? 'active' : ''} disabled={activeSlide.type === 'composition'} onClick={() => { setOutputPreview(false); setInteractionMode('edit'); }}>Edit elemen</button>
          <button className={isOutput ? 'active' : ''} onClick={() => setOutputPreview(true)}>Hasil unduhan</button>
        </div><button className="button secondary capture-scene" onClick={() => duplicateSlide(activeSlide.id)}><Plus size={15} /> Tangkap adegan baru</button>
          {activeSlide.renderVersion === 2 && sceneIdentity(activeSlide).app && <button className="text-button" onClick={() => duplicateSlide(activeSlide.id, { modern: true })}>Salin ke tampilan terbaru</button>}
          {isOutput && activeSlide.type !== 'composition' && <select aria-label="Bingkai hasil" value={outputSurface} onChange={event => setOutputSurface(event.target.value)}><option value="screen">Layar saja</option><option value="phone">Dengan bingkai</option></select>}
        </div>
        <div className="phone-stage-wrapper" ref={stageRef} onClick={onPreviewClick}>
          <div className="phone-scale-shell" style={{ width: dimensions.width * scale, height: dimensions.height * scale }}>
            {isOutput ? <OutputRenderer slide={activeSlide} surface={outputSurface} zoom={scale} editable={activeSlide.type === 'composition'} />
              : <PhoneContainer slide={activeSlide} zoom={scale} interactive={interactionMode === 'operate'} editable={interactionMode === 'edit'} />}
          </div>
        </div>
        <div className="preview-hint"><Settings2 size={15} /> {isOutput ? 'Crop dan kolase sesuai hasil ekspor. Atur di panel Edit.'
          : interactionMode === 'operate' ? 'Kirim pesan cerita dan buka layar. Tangkap adegan baru untuk melanjutkan.' : 'Ketuk elemen untuk membuka pengaturannya.'}</div>
      </main>
      <div className={'inspector-shell mobile-' + mobileView}><SlideInspector /></div>
    </div>
    <nav className="mobile-nav" aria-label="Navigasi editor">
      <button className={mobileView === 'slides' ? 'active' : ''} onClick={() => setMobileView('slides')}><Layers3 size={19} /> Slide</button>
      <button className={mobileView === 'preview' ? 'active' : ''} onClick={() => setMobileView('preview')}><MonitorSmartphone size={19} /> Pratinjau</button>
      <button className={mobileView === 'edit' ? 'active' : ''} onClick={() => setMobileView('edit')}><Settings2 size={19} /> Edit</button>
    </nav>
    <QuickScriptModal isOpen={scriptOpen} onClose={() => setScriptOpen(false)} />
    {exportOpen && <Suspense fallback={<div className="dialog-backdrop" role="status">Menyiapkan ekspor…</div>}><ExportDialog onClose={() => setExportOpen(false)} /></Suspense>}
  </div>;
}
