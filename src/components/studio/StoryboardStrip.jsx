import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, ImagePlus, Layers3, LockKeyhole, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useUI } from '../../context/UIContext';
import { SCENE_APPS, SCREEN_LABELS, sceneIdentity } from '../../data/sceneCatalog';

const EXTRA_SLIDES = [
  ['lockscreen', 'Layar kunci'],
  ['custom_app', 'Aplikasi bebas'], ['composition', 'Kolase']
];

const labelFor = (slide, t) => {
  const { app, screen } = sceneIdentity(slide);
  return app ? `${t(SCENE_APPS.find(item => item.id === app)?.name || app)} · ${t(SCREEN_LABELS[screen] || screen)}`
    : t(EXTRA_SLIDES.find(item => item[0] === slide.type)?.[1] || 'Slide');
};
const iconFor = type => type === 'lockscreen' ? <LockKeyhole size={16} />
  : type === 'custom_app' ? <Layers3 size={16} />
  : type === 'ig_post' || type === 'ig_story' ? <ImagePlus size={16} />
  : <MessageCircle size={16} />;

function summary(slide, t) {
  if (slide.type === 'composition') return t('{n} bagian · salinan adegan', { n: slide.composition?.items?.length || 0 });
  const c = slide.content || {};
  return c.text || c.caption || c.messages?.[0]?.text || c.notifications?.[0]?.message || c.appName || t('Belum ada konten');
}

export default function StoryboardStrip({ onSelectSlide }) {
  const { t } = useUI();
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
      <div><h2>{t('Alur cerita')}</h2><p>{t('{n} slide · pilih untuk mengedit', { n: project.slides.length })}</p></div>
      <button className="icon-button" onClick={() => setShowAdd(value => !value)} aria-label={t('Tambah slide')} aria-expanded={showAdd}><Plus size={19} /></button>
    </div>
    {showAdd && <div className="add-type-list">
      <label className="field"><span>{t('1. Pilih aplikasi')}</span><select aria-label={t('1. Pilih aplikasi')} value={app} onChange={event => setApp(event.target.value)}>
        {SCENE_APPS.map(item => <option key={item.id} value={item.id}>{t(item.name)}</option>)}
      </select></label>
      <p className="field-hint">{t('2. Pilih adegan')}</p>
      {SCENE_APPS.find(item => item.id === app).screens.map(screen => <button key={screen} onClick={() => {
        addSlide('app_scene', { app, screen }); setShowAdd(false); setNotice(''); onSelectSlide?.();
      }}>{iconFor(screen)}<span>{t(SCREEN_LABELS[screen])}</span></button>)}
      {EXTRA_SLIDES.map(([type, label]) => <button key={type} onClick={() => {
        addSlide(type); setShowAdd(false); setNotice(''); onSelectSlide?.();
      }}>{iconFor(type)}<span>{t(label)}</span></button>)}
    </div>}
    <div className="scene-scroll">
      {project.slides.map((slide, index) => <div key={slide.id} className={`scene-item ${index === activeSlideIndex ? 'active' : ''}`}>
        <button className="scene-select" onClick={() => { setActiveSlideIndex(index); onSelectSlide?.(); }} aria-current={index === activeSlideIndex ? 'step' : undefined}>
          <span className={`scene-thumb type-${slide.type}`}>{iconFor(slide.type)}<small>{index + 1}</small></span>
          <span className="scene-copy"><strong>{slide.title || `Slide ${index + 1}`}</strong><span>{labelFor(slide, t)}</span><em>{summary(slide, t)}</em></span>
        </button>
        <div className="scene-actions">
          <button onClick={() => move(index, -1)} disabled={index === 0} title={t('Ke atas')} aria-label={t('Pindah slide {n} ke atas', { n: index + 1 })}><ChevronUp size={15} /></button>
          <button onClick={() => move(index, 1)} disabled={index === project.slides.length - 1} title={t('Ke bawah')} aria-label={t('Pindah slide {n} ke bawah', { n: index + 1 })}><ChevronDown size={15} /></button>
          <button onClick={() => duplicateSlide(slide.id)} title={t('Duplikasi slide')} aria-label={t('Duplikasi slide {n}', { n: index + 1 })}><Copy size={14} /></button>
          <button onClick={() => {
            if (!deleteSlide(slide.id)) setNotice('Cerita harus memiliki setidaknya satu slide.');
          }} title={t('Hapus')} aria-label={t('Hapus slide {n}', { n: index + 1 })}><Trash2 size={14} /></button>
        </div>
      </div>)}
    </div>
    {notice && <p className="inline-notice" role="status">{t(notice)}</p>}
    <button className="button add-scene-button" onClick={() => setShowAdd(value => !value)}><Plus size={18} />{t('Tambah slide')}</button>
  </div>;
}
