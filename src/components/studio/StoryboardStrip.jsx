import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, ImagePlus, Layers3, LockKeyhole, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { SCENE_APPS, SCREEN_LABELS, sceneIdentity } from '../../data/sceneCatalog';

const EXTRA_SLIDES = [
  ['lockscreen', 'Layar kunci'],
  ['custom_app', 'Aplikasi bebas'], ['composition', 'Kolase']
];

const labelFor = slide => {
  const { app, screen } = sceneIdentity(slide);
  return app ? `${SCENE_APPS.find(item => item.id === app)?.name || app} · ${SCREEN_LABELS[screen] || screen}`
    : EXTRA_SLIDES.find(item => item[0] === slide.type)?.[1] || 'Slide';
};
const iconFor = type => type === 'lockscreen' ? <LockKeyhole size={16} />
  : type === 'custom_app' ? <Layers3 size={16} />
  : type === 'ig_post' || type === 'ig_story' ? <ImagePlus size={16} />
  : <MessageCircle size={16} />;

function summary(slide) {
  if (slide.type === 'composition') return `${slide.composition?.items?.length || 0} bagian · salinan adegan`;
  const c = slide.content || {};
  return c.text || c.caption || c.messages?.[0]?.text || c.notifications?.[0]?.message || c.appName || 'Belum ada konten';
}

export default function StoryboardStrip({ onSelectSlide }) {
  const { project, activeSlideIndex, setActiveSlideIndex, addSlide, duplicateSlide, deleteSlide, reorderSlides } = useProject();
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState('');
  const [app, setApp] = useState('whatsapp');

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= project.slides.length) return;
    const next = [...project.slides];
    [next[index], next[target]] = [next[target], next[index]];
    reorderSlides(next);
    setActiveSlideIndex(next.findIndex(slide => slide.id === project.slides[activeSlideIndex]?.id));
  };

  return <div className="scene-list">
    <div className="scene-list-heading">
      <div><h2>Alur cerita</h2><p>{project.slides.length} slide · pilih untuk mengedit</p></div>
      <button className="icon-button" onClick={() => setShowAdd(value => !value)} aria-label="Tambah slide" aria-expanded={showAdd}><Plus size={19} /></button>
    </div>
    {showAdd && <div className="add-type-list">
      <label className="field"><span>1. Pilih aplikasi</span><select value={app} onChange={event => setApp(event.target.value)}>
        {SCENE_APPS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
      <p className="field-hint">2. Pilih adegan</p>
      {SCENE_APPS.find(item => item.id === app).screens.map(screen => <button key={screen} onClick={() => {
        addSlide('app_scene', { app, screen }); setShowAdd(false); setNotice(''); onSelectSlide?.();
      }}>{iconFor(screen)}<span>{SCREEN_LABELS[screen]}</span></button>)}
      {EXTRA_SLIDES.map(([type, label]) => <button key={type} onClick={() => {
        addSlide(type); setShowAdd(false); setNotice(''); onSelectSlide?.();
      }}>{iconFor(type)}<span>{label}</span></button>)}
    </div>}
    <div className="scene-scroll">
      {project.slides.map((slide, index) => <div key={slide.id} className={`scene-item ${index === activeSlideIndex ? 'active' : ''}`}>
        <button className="scene-select" onClick={() => { setActiveSlideIndex(index); onSelectSlide?.(); }} aria-current={index === activeSlideIndex ? 'step' : undefined}>
          <span className={`scene-thumb type-${slide.type}`}>{iconFor(slide.type)}<small>{index + 1}</small></span>
          <span className="scene-copy"><strong>{slide.title || `Slide ${index + 1}`}</strong><span>{labelFor(slide)}</span><em>{summary(slide)}</em></span>
        </button>
        <div className="scene-actions">
          <button onClick={() => move(index, -1)} disabled={index === 0} title="Pindah ke atas" aria-label={`Pindah slide ${index + 1} ke atas`}><ChevronUp size={15} /></button>
          <button onClick={() => move(index, 1)} disabled={index === project.slides.length - 1} title="Pindah ke bawah" aria-label={`Pindah slide ${index + 1} ke bawah`}><ChevronDown size={15} /></button>
          <button onClick={() => duplicateSlide(slide.id)} title="Duplikasi" aria-label={`Duplikasi slide ${index + 1}`}><Copy size={14} /></button>
          <button onClick={() => {
            if (!deleteSlide(slide.id)) setNotice('Cerita harus memiliki setidaknya satu slide.');
          }} title="Hapus" aria-label={`Hapus slide ${index + 1}`}><Trash2 size={14} /></button>
        </div>
      </div>)}
    </div>
    {notice && <p className="inline-notice" role="status">{notice}</p>}
    <button className="button add-scene-button" onClick={() => setShowAdd(value => !value)}><Plus size={18} /> Tambah slide</button>
  </div>;
}
