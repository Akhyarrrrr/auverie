import { forwardRef, useRef, useState } from 'react';
import { ProjectProvider, useProject } from '../../context/ProjectContext';
import { useUI } from '../../context/UIContext';
import { sceneCrop, deviceMetrics, outputDimensions } from '../../services/sceneModel';
import PhoneContainer from './PhoneContainer';

const OutputRenderer = forwardRef(function RenderedOutput({ slide, surface = 'screen', zoom = 1, interactive = false, editable = false }, ref) {
  const { project, updateSlideMeta, setEditTarget, editTarget } = useProject();
  const ui = useUI();
  const gesture = useRef(null), [drag, setDrag] = useState(null);
  const movePart = (id, updates) => updateSlideMeta(slide.id, previous => ({ composition: { ...previous.composition,
    items: previous.composition.items.map(item => item.id === id ? { ...item, ...updates } : item) } }));
  if (!slide) return null;
  const dimensions = outputDimensions(slide, project.globalSettings, surface);
  if (slide.type === 'composition') return <div ref={ref} className="composition-canvas" data-output="composition"
    data-intentional-composition={slide.composition.intentional ? 'true' : undefined}
    style={{ width: dimensions.width, height: dimensions.height, background: slide.composition.background,
      transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
    {slide.composition.items.map(item => {
      const snapshot = item.snapshot, source = { ...snapshot.slide, viewport: { ...snapshot.slide.viewport,
        ...(item.crop ? { crop: item.crop, cropPreset: 'manual' } : {}) } };
      const sourceSurface = item.surface || surface;
      const size = outputDimensions(source, snapshot.globalSettings, sourceSurface);
      return <div className={`composition-part ${editable && editTarget === `part:${item.id}` ? 'selected' : ''}`} key={item.id} data-edit-target={`part:${item.id}`}
        tabIndex={editable ? 0 : undefined} aria-label={editable ? ui?.t('Bagian kolase {title}. Gunakan tombol panah untuk menggeser.', { title: snapshot.slide.title }) || `Bagian kolase ${snapshot.slide.title}` : undefined}
        onPointerDown={editable ? event => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId);
          gesture.current = { id: item.id, x: item.x, y: item.y, clientX: event.clientX, clientY: event.clientY }; setEditTarget(`part:${item.id}`); } : undefined}
        onPointerMove={editable ? event => { const g = gesture.current; if (!g || g.id !== item.id) return;
          setDrag({ id: item.id, x: g.x + (event.clientX - g.clientX) / zoom, y: g.y + (event.clientY - g.clientY) / zoom }); } : undefined}
        onPointerUp={editable ? () => { if (drag?.id === item.id) movePart(item.id, { x: Math.round(drag.x), y: Math.round(drag.y) }); gesture.current = null; setDrag(null); } : undefined}
        onPointerCancel={() => { gesture.current = null; setDrag(null); }}
        onKeyDown={editable ? event => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault();
          const delta = event.shiftKey ? 10 : 1; movePart(item.id, { x: item.x + (event.key === 'ArrowLeft' ? -delta : event.key === 'ArrowRight' ? delta : 0),
            y: item.y + (event.key === 'ArrowUp' ? -delta : event.key === 'ArrowDown' ? delta : 0) }); } : undefined}
        style={{ left: drag?.id === item.id ? drag.x : item.x, top: drag?.id === item.id ? drag.y : item.y, width: item.width, height: item.height, zIndex: item.zIndex || 0, overflow: 'hidden' }}>
        <ProjectProvider previewProject={{ ...snapshot, id: item.id, slides: [source] }}>
          <div style={{ transform: `scale(${item.width / size.width}, ${item.height / size.height})`, transformOrigin: 'top left' }}>
            <OutputRenderer slide={source} surface={sourceSurface} />
          </div>
        </ProjectProvider>
      </div>;
    })}
  </div>;
  const metrics = deviceMetrics(slide, project.globalSettings), crop = sceneCrop(slide, project.globalSettings);
  const frame = surface === 'phone' ? metrics.inset : 0;
  return <div ref={ref} className={`scene-output output-${surface}`} data-output="screen"
    style={{ width: dimensions.width, height: dimensions.height, padding: frame,
      background: surface === 'phone' ? slide.customSettings?.bezelColor || project.globalSettings.bezelColor || '#28292b' : 'transparent',
      borderRadius: surface === 'phone' ? 32 : 0, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
    <div className="output-crop" style={{ width: crop.width, height: crop.height, borderRadius: surface === 'phone' ? 24 : 0 }}>
      <div className="output-source" style={{ left: -crop.x, top: -crop.y }}>
        <PhoneContainer slide={slide} bare interactive={interactive} showHardware={surface === 'phone' && crop.y === 0} />
      </div>
    </div>
  </div>;
});
export default OutputRenderer;
