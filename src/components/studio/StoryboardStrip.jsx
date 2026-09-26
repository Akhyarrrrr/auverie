import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Lock,
  Smartphone
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

const InstagramIcon = ({ size = 20, color = "#e1306c" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function StoryboardStrip() {
  const {
    project,
    activeSlideIndex,
    setActiveSlideIndex,
    addSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlides
  } = useProject();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSlideIcon = (type) => {
    switch (type) {
      case 'wa_chat':
      case 'wa_group':
        return <MessageCircle size={20} color="#25d366" />;
      case 'x_tweet':
      case 'x_dm':
        return <span style={{ fontSize: '16px', fontWeight: 900 }}>𝕏</span>;
      case 'ig_dm':
      case 'ig_post':
        return <InstagramIcon size={20} color="#e1306c" />;
      case 'lockscreen':
        return <Lock size={18} color="#60a5fa" />;
      default:
        return <Smartphone size={18} />;
    }
  };

  const getSlideBadge = (type) => {
    switch (type) {
      case 'wa_chat': return 'WA';
      case 'wa_group': return 'GRUP';
      case 'x_tweet': return 'POST 𝕏';
      case 'x_dm': return 'DM 𝕏';
      case 'ig_dm': return 'IG DM';
      case 'ig_post': return 'IG POST';
      case 'lockscreen': return 'LOCK';
      default: return 'SLIDE';
    }
  };

  const moveSlide = (e, index, direction) => {
    e.stopPropagation();
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= project.slides.length) return;

    const updated = [...project.slides];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    reorderSlides(updated);
    setActiveSlideIndex(newIndex);
  };

  return (
    <div className="storyboard-strip">
      <div className="storyboard-slides-container">
        {project.slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;

          return (
            <div
              key={slide.id}
              className={`slide-card-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveSlideIndex(idx)}
              title={`${slide.title || 'Slide'} (${getSlideBadge(slide.type)})`}
            >
              <span className="slide-card-badge">
                {getSlideBadge(slide.type)}
              </span>

              <div className="slide-card-icon">
                {getSlideIcon(slide.type)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span className="slide-card-number">#{idx + 1}</span>

                <div style={{ display: 'flex', gap: 2 }}>
                  {idx > 0 && (
                    <button
                      className="no-export"
                      style={{ padding: 1, opacity: 0.7 }}
                      onClick={(e) => moveSlide(e, idx, -1)}
                      title="Pindah ke kiri"
                    >
                      <ChevronLeft size={12} />
                    </button>
                  )}
                  {idx < project.slides.length - 1 && (
                    <button
                      className="no-export"
                      style={{ padding: 1, opacity: 0.7 }}
                      onClick={(e) => moveSlide(e, idx, 1)}
                      title="Pindah ke kanan"
                    >
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Delete Button on Hover */}
              <button
                className="slide-delete-hover-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSlide(slide.id);
                }}
                title="Hapus slide"
              >
                ×
              </button>
            </div>
          );
        })}

        {/* Add Slide Menu */}
        <div className="add-slide-menu-wrapper" ref={menuRef}>
          <button
            className="btn-add-slide"
            onClick={() => setMenuOpen(!menuOpen)}
            title="Tambah adegan / slide baru"
          >
            <Plus size={20} />
            <span>Tambah</span>
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute',
              bottom: '96px',
              left: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '6px',
              width: '210px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 70
            }}>
              <button
                className="canvas-toolbar-btn"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                onClick={() => { addSlide('wa_chat'); setMenuOpen(false); }}
              >
                <MessageCircle size={16} color="#25d366" />
                <span>WhatsApp Chat</span>
              </button>

              <button
                className="canvas-toolbar-btn"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                onClick={() => { addSlide('wa_group'); setMenuOpen(false); }}
              >
                <MessageCircle size={16} color="#00a884" />
                <span>WhatsApp Group</span>
              </button>

              <button
                className="canvas-toolbar-btn"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                onClick={() => { addSlide('x_tweet'); setMenuOpen(false); }}
              >
                <span style={{ fontWeight: 900, width: 16, textAlign: 'center' }}>𝕏</span>
                <span>Twitter / X Tweet</span>
              </button>

              <button
                className="canvas-toolbar-btn"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                onClick={() => { addSlide('ig_dm'); setMenuOpen(false); }}
              >
                <InstagramIcon size={16} color="#e1306c" />
                <span>Instagram DM</span>
              </button>

              <button
                className="canvas-toolbar-btn"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                onClick={() => { addSlide('ig_post'); setMenuOpen(false); }}
              >
                <InstagramIcon size={16} color="#f77737" />
                <span>Instagram Post</span>
              </button>

              <button
                className="canvas-toolbar-btn"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                onClick={() => { addSlide('lockscreen'); setMenuOpen(false); }}
              >
                <Lock size={16} color="#60a5fa" />
                <span>iPhone Lockscreen</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
