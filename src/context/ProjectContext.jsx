import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SAMPLE_PROJECT, DEFAULT_CHARACTERS, DEFAULT_GLOBAL_SETTINGS } from '../data/samplePresets';
import { saveProject, loadProject } from '../services/storage';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(() => {
    return SAMPLE_PROJECT;
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('characters'); // 'characters' | 'device' | 'script'
  const saveTimeoutRef = useRef(null);

  // Load from IndexedDB on first mount
  useEffect(() => {
    async function initDb() {
      try {
        const saved = await loadProject(SAMPLE_PROJECT.id);
        if (saved && saved.slides && saved.slides.length > 0) {
          setProject(saved);
        }
      } catch (e) {
        console.warn('Could not restore from IndexedDB:', e);
      }
    }
    initDb();
  }, []);

  // Auto-save debounced to IndexedDB
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveProject(project);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [project]);

  // Ensure activeSlideIndex stays valid
  const safeIndex = Math.min(Math.max(0, activeSlideIndex), Math.max(0, project.slides.length - 1));
  const activeSlide = project.slides[safeIndex] || null;

  // Project Title
  const updateTitle = (newTitle) => {
    setProject(prev => ({ ...prev, title: newTitle }));
  };

  // Global Settings
  const updateGlobalSettings = (updates) => {
    setProject(prev => ({
      ...prev,
      globalSettings: { ...prev.globalSettings, ...updates }
    }));
  };

  // Character Management
  const addCharacter = (newChar) => {
    const char = {
      id: newChar.id || `char-${Date.now()}`,
      name: newChar.name || "Karakter Baru",
      handle: newChar.handle || "@user",
      avatar: newChar.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      verified: newChar.verified || false,
      color: newChar.color || "#00a884"
    };
    setProject(prev => ({
      ...prev,
      characters: [...prev.characters, char]
    }));
    return char;
  };

  const updateCharacter = (charId, updates) => {
    setProject(prev => ({
      ...prev,
      characters: prev.characters.map(c => c.id === charId ? { ...c, ...updates } : c)
    }));
  };

  const deleteCharacter = (charId) => {
    setProject(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== charId)
    }));
  };

  // Slide Management
  const addSlide = (type = "wa_chat") => {
    let defaultContent = {};
    const firstChar = project.characters[0] || DEFAULT_CHARACTERS[0];

    if (type === "wa_chat" || type === "wa_group") {
      defaultContent = {
        targetCharacterId: firstChar.id,
        statusText: "online",
        messages: [
          {
            id: `m-${Date.now()}-1`,
            senderId: firstChar.id,
            text: "Halo! Ini pesan baru.",
            time: project.globalSettings.time || "23:45",
            status: "read"
          },
          {
            id: `m-${Date.now()}-2`,
            senderId: "me",
            text: "Iyaa, halo juga!",
            time: project.globalSettings.time || "23:46",
            status: "read"
          }
        ]
      };
    } else if (type === "x_tweet") {
      defaultContent = {
        authorId: firstChar.id,
        text: "Tulis tweet AU kamu di sini... #AURA",
        timestamp: `${project.globalSettings.time || "11:45 PM"} · 26 Sep 26`,
        client: "Twitter for iPhone",
        likesCount: "542",
        retweetsCount: "89",
        bookmarksCount: "45",
        viewsCount: "12.8K",
        mediaUrl: "",
        replies: []
      };
    } else if (type === "ig_dm") {
      defaultContent = {
        targetCharacterId: firstChar.id,
        messages: [
          {
            id: `igm-${Date.now()}-1`,
            senderId: firstChar.id,
            text: "Hai, lagi apa?",
            time: project.globalSettings.time || "23:45"
          }
        ],
        seenText: "Dilihat baru saja"
      };
    } else if (type === "ig_post") {
      defaultContent = {
        authorId: firstChar.id,
        caption: "Hari yang menyenangkan ✨",
        likesCount: "1,240 suka",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
      };
    } else if (type === "lockscreen") {
      defaultContent = {
        dateString: "Jumat, 26 September",
        wallpaperUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        notifications: [
          {
            id: `notif-${Date.now()}`,
            app: "whatsapp",
            title: firstChar.name,
            message: "Kamu udah baca pesanku belum?",
            time: "Baru saja"
          }
        ]
      };
    }

    const newSlide = {
      id: `slide-${Date.now()}`,
      order: project.slides.length + 1,
      type,
      title: `Slide ${project.slides.length + 1}`,
      content: defaultContent
    };

    setProject(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setActiveSlideIndex(project.slides.length);
  };

  const updateSlideContent = (slideId, newContent) => {
    setProject(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === slideId ? {
        ...s,
        content: typeof newContent === 'function' ? newContent(s.content) : { ...s.content, ...newContent }
      } : s)
    }));
  };

  const updateSlideMeta = (slideId, updates) => {
    setProject(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === slideId ? { ...s, ...updates } : s)
    }));
  };

  const deleteSlide = (slideId) => {
    if (project.slides.length <= 1) {
      alert("Proyek harus memiliki minimal 1 slide.");
      return;
    }
    const idx = project.slides.findIndex(s => s.id === slideId);
    setProject(prev => ({
      ...prev,
      slides: prev.slides.filter(s => s.id !== slideId).map((s, i) => ({ ...s, order: i + 1 }))
    }));
    if (idx <= safeIndex && safeIndex > 0) {
      setActiveSlideIndex(safeIndex - 1);
    }
  };

  const duplicateSlide = (slideId) => {
    const slideToCopy = project.slides.find(s => s.id === slideId);
    if (!slideToCopy) return;

    const copy = {
      ...JSON.parse(JSON.stringify(slideToCopy)),
      id: `slide-${Date.now()}`,
      title: `${slideToCopy.title || 'Slide'} (Salinan)`,
      order: project.slides.length + 1
    };

    setProject(prev => ({
      ...prev,
      slides: [...prev.slides, copy]
    }));
    setActiveSlideIndex(project.slides.length);
  };

  const reorderSlides = (newSlides) => {
    setProject(prev => ({
      ...prev,
      slides: newSlides.map((s, i) => ({ ...s, order: i + 1 }))
    }));
  };

  // Reset to default sample
  const resetToSample = () => {
    if (window.confirm("Muat ulang contoh cerita preset? Perubahan saat ini akan diganti.")) {
      setProject(SAMPLE_PROJECT);
      setActiveSlideIndex(0);
    }
  };

  // Helper to get character by ID
  const getCharacter = (id) => {
    if (!id || id === 'me') {
      return {
        id: 'me',
        name: 'Saya',
        handle: '@saya',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        color: '#00a884'
      };
    }
    return project.characters.find(c => c.id === id) || {
      id: 'unknown',
      name: 'User',
      handle: '@user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    };
  };

  return (
    <ProjectContext.Provider value={{
      project,
      setProject,
      activeSlideIndex: safeIndex,
      setActiveSlideIndex,
      activeSlide,
      activeTab,
      setActiveTab,
      updateTitle,
      updateGlobalSettings,
      addCharacter,
      updateCharacter,
      deleteCharacter,
      addSlide,
      updateSlideContent,
      updateSlideMeta,
      deleteSlide,
      duplicateSlide,
      reorderSlides,
      resetToSample,
      getCharacter,
      isExporting,
      setIsExporting,
      exportProgress,
      setExportProgress
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
