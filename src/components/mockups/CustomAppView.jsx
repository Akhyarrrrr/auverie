import { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { MediaContent } from './SceneParts';

function blockContent(element) {
  if (element.type === 'media') return <MediaContent message={{ ...element, kind: element.mediaKind || 'video', mediaUrl: element.src }} />;
  if (element.type === 'image') return element.src ? <img src={element.src} alt={element.text || 'Gambar'} /> : <span data-missing-asset="true">Pilih gambar</span>;
  if (element.type === 'notification') return <><strong>{element.title || 'Notifikasi'}</strong><span>{element.text || 'Isi notifikasi'}</span></>;
  if (element.type === 'chat') return <span>{element.text || 'Pesan'}</span>;
  return element.text || (element.type === 'appbar' ? 'Nama aplikasi' : element.type === 'button' ? 'Tombol' : 'Teks');
}

export default function CustomAppView({ slide, interactive = false }) {
  const { updateSlideContent, setEditTarget, editTarget } = useProject();
  const content = slide.content || {};
  const [drag, setDrag] = useState(null);

  const startDrag = (event, element) => {
    if (!interactive || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setEditTarget(`element:${element.id}`);
    setDrag({ id: element.id, startX: event.clientX, startY: event.clientY,
      x: element.x || 0, y: element.y || 0, width: event.currentTarget.parentElement.getBoundingClientRect().width,
      height: event.currentTarget.parentElement.getBoundingClientRect().height,
      currentX: element.x || 0, currentY: element.y || 0 });
  };
  const moveDrag = event => {
    if (!drag) return;
    const element = (content.elements || []).find(item => item.id === drag.id);
    if (!element) return;
    const x = Math.max(0, Math.min(100 - (element.width || 30), drag.x + (event.clientX - drag.startX) / drag.width * 100));
    const y = Math.max(0, Math.min(100 - (element.height || 8), drag.y + (event.clientY - drag.startY) / drag.height * 100));
    setDrag({ ...drag, currentX: Math.round(x * 10) / 10, currentY: Math.round(y * 10) / 10 });
  };
  const endDrag = () => {
    if (!drag) return;
    updateSlideContent(slide.id, previous => ({ ...previous,
      elements: (previous.elements || []).map(item => item.id === drag.id
        ? { ...item, x: drag.currentX, y: drag.currentY } : item)
    }));
    setDrag(null);
  };

  return <div className="custom-app-screen" style={{ backgroundColor: content.backgroundColor || '#f7f7f5',
    backgroundImage: content.backgroundUrl ? `url(${content.backgroundUrl})` : undefined }}>
    {!(content.elements || []).length && <div className="custom-empty no-export">Tambahkan elemen lewat panel Edit.</div>}
    {(content.elements || []).map((element, index) => {
      const position = drag?.id === element.id ? { x: drag.currentX, y: drag.currentY } : element;
      return <div key={element.id} data-edit-target={`element:${element.id}`}
        className={`custom-block block-${element.type} ${interactive && editTarget === `element:${element.id}` ? 'selected' : ''}`}
        style={{ left: `${position.x || 0}%`, top: `${position.y || 0}%`, width: `${element.width || 40}%`,
          height: `${element.height || 8}%`, color: element.color || '#202727',
          backgroundColor: element.background || undefined, fontSize: `${element.fontSize || 16}px`,
          textAlign: element.align || 'left', borderRadius: `${element.radius ?? 10}px`, zIndex: index + 1 }}
        onPointerDown={event => startDrag(event, element)} onPointerMove={moveDrag} onPointerUp={endDrag}
        onPointerCancel={endDrag}>
        {blockContent(element)}
      </div>;
    })}
  </div>;
}
