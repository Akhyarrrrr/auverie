import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { DEFAULT_CHARACTERS, DEFAULT_GLOBAL_SETTINGS, SAMPLE_PROJECT } from '../data/samplePresets';
import { getAllProjects, getLastProjectId, loadProject, normalizeProject, saveProject } from '../services/storage';
import { sceneDefaults, sceneIdentity } from '../data/sceneCatalog';
import { captureScene, characterReferences, replaceCharacterReferences } from '../services/sceneModel';

const ProjectContext = createContext(null);
const copy = (value) => structuredClone(value);
const uid = () => crypto.randomUUID();

function historyReducer(state, action) {
  if (action.type === 'load') return { present: action.project, past: [], future: [] };
  if (action.type === 'undo' && state.past.length) return {
    present: state.past.at(-1), past: state.past.slice(0, -1), future: [state.present, ...state.future]
  };
  if (action.type === 'redo' && state.future.length) return {
    present: state.future[0], past: [...state.past, state.present], future: state.future.slice(1)
  };
  if (!['change', 'transient'].includes(action.type)) return state;
  const next = typeof action.value === 'function' ? action.value(state.present) : action.value;
  if (!next || next === state.present) return state;
  if (action.type === 'transient') return { present: next, past: state.past, future: [] };
  return { present: next, past: [...state.past.slice(-79), state.present].filter(Boolean), future: [] };
}

function initialContent(type) {
  if (type === 'lockscreen') return { wallpaperUrl: '', dateString: 'Hari ini', notifications: [], music: { enabled: false } };
  if (type === 'custom_app') return { appName: 'Aplikasi baru', backgroundUrl: '', elements: [] };
  return {};
}

function makeSlide(type, project, options = {}) {
  return { id: uid(), order: project.slides.length + 1, type, renderVersion: 3, title: `Slide ${project.slides.length + 1}`,
    customSettings: { ...project.globalSettings, ...(type === 'custom_app' ? { theme: 'light' } : {}) },
    charactersSnapshot: copy([...project.characters, { id: 'me', ...project.selfCharacter }]),
    sceneState: { screen: options.screen, overlay: null }, viewport: { anchor: 'bottom', scroll: 0, intentional: true },
    ...(type === 'composition' ? { composition: { width: 900, height: 1200, background: '#ffffff', items: [] } } : {}),
    content: type === 'app_scene' ? sceneDefaults(options.app || 'whatsapp', options.screen || 'chat', project) : initialContent(type) };
}

function makeProject(title = 'Cerita baru') {
  const project = normalizeProject({
    id: uid(), title, createdAt: Date.now(), updatedAt: Date.now(),
    globalSettings: copy(DEFAULT_GLOBAL_SETTINGS),
    selfCharacter: { name: 'Saya', handle: '@saya', avatar: '' },
    characters: [{ ...copy(DEFAULT_CHARACTERS[0]), name: 'Tokoh 1', handle: '@tokoh1', avatar: '' }], slides: []
  });
  project.slides = [makeSlide('app_scene', project, { app: 'whatsapp', screen: 'chat' })];
  return project;
}

export function ProjectProvider({ children, previewProject = null }) {
  const saveQueue = useRef(Promise.resolve()), saveTimer = useRef(null), saveRevision = useRef(0);
  const persist = value => {
    const pending = saveQueue.current.catch(() => {}).then(() => saveProject(value));
    saveQueue.current = pending;
    return pending;
  };
  const [history, dispatch] = useReducer(historyReducer, { present: previewProject, past: [], future: [] });
  const project = history.present;
  const [ready, setReady] = useState(Boolean(previewProject));
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('scenes');
  const [editTarget, setEditTarget] = useState(null);
  const [interactionMode, setInteractionMode] = useState('operate');

  useEffect(() => {
    if (previewProject) return;
    setReady(false);
    setLoadError(false);
    let cancelled = false;
    (async () => {
      try {
        const projects = await getAllProjects();
        const lastId = await getLastProjectId();
        const last = projects.find(item => item.id === lastId)
          || projects.find(item => item.id === SAMPLE_PROJECT.id);
        if (!cancelled) {
          setRecentProjects(projects);
          if (last) dispatch({ type: 'load', project: last });
        }
      } catch (error) {
        console.error('Gagal membaca proyek:', error);
        if (!cancelled) { setSaveStatus('error'); setLoadError(true); }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [previewProject, loadAttempt]);

  useEffect(() => {
    if (previewProject || !ready || !project) return;
    const revision = ++saveRevision.current;
    setSaveStatus('saving');
    saveTimer.current = setTimeout(async () => {
      try {
        const saved = await persist(project);
        setRecentProjects(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
        if (revision === saveRevision.current) setSaveStatus('saved');
      } catch (error) {
        console.error('Gagal menyimpan proyek:', error);
        if (revision === saveRevision.current) setSaveStatus('error');
      }
    }, 600);
    return () => { clearTimeout(saveTimer.current); saveRevision.current++; };
  }, [project, ready, previewProject]);

  const setProject = (value, recordHistory = true) => dispatch({ type: recordHistory ? 'change' : 'transient', value });
  const replaceProject = async (next) => {
    const saved = await persist(normalizeProject(next));
    dispatch({ type: 'load', project: saved });
    setRecentProjects(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
    setSaveStatus('saved');
    setActiveSlideIndex(0);
    setEditTarget(null);
  };
  const flushCurrent = async () => {
    clearTimeout(saveTimer.current); saveRevision.current++;
    if (project) await persist(project);
  };
  const saveNow = async () => {
    clearTimeout(saveTimer.current);
    const revision = ++saveRevision.current;
    if (!project) return;
    setSaveStatus('saving');
    try {
      const saved = await persist(project);
      setRecentProjects(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
      if (revision === saveRevision.current) setSaveStatus('saved');
    } catch (error) {
      if (revision === saveRevision.current) setSaveStatus('error');
      throw error;
    }
  };
  const createProject = async (title) => { await flushCurrent(); await replaceProject(makeProject(title)); };
  const startExample = async () => {
    await flushCurrent();
    await replaceProject({ ...copy(SAMPLE_PROJECT), id: uid(), createdAt: Date.now(), updatedAt: Date.now() });
  };
  const openProject = async (id) => {
    await flushCurrent();
    const selected = await loadProject(id);
    if (!selected) throw new Error('Proyek tidak ditemukan di browser ini.');
    await replaceProject(selected);
  };
  const importProject = async (imported) => {
    await flushCurrent();
    await replaceProject({ ...normalizeProject(imported), id: uid(), createdAt: Date.now(), updatedAt: Date.now(),
      title: `${imported.title || 'Cerita'} (impor)` });
  };
  const closeProject = async () => {
    await flushCurrent();
    dispatch({ type: 'load', project: null }); setEditTarget(null);
  };

  const slides = project?.slides || [];
  const safeIndex = Math.min(Math.max(0, activeSlideIndex), Math.max(0, slides.length - 1));
  const activeSlide = slides[safeIndex] || null;

  const updateTitle = title => setProject(prev => ({ ...prev, title }));
  const updateGlobalSettings = updates => setProject(prev => ({
    ...prev, globalSettings: { ...prev.globalSettings, ...updates },
    slides: prev.slides.map((slide, index) => index === safeIndex ? { ...slide,
      customSettings: { ...slide.customSettings, ...updates } } : slide)
  }));
  const updateSelfCharacter = updates => setProject(prev => ({
    ...prev, selfCharacter: { ...(prev.selfCharacter || {}), ...updates },
    slides: prev.slides.map((slide, index) => index === safeIndex && slide.charactersSnapshot ? { ...slide,
      charactersSnapshot: slide.charactersSnapshot.map(c => c.id === 'me' ? { ...c, ...updates } : c) } : slide)
  }));
  const addCharacter = value => {
    const character = { id: uid(), name: value.name || 'Karakter baru', handle: value.handle || '@karakter',
      avatar: value.avatar || '', verified: false, verifiedType: 'none', color: '#087e72', ...value };
    setProject(prev => ({ ...prev, characters: [...prev.characters, character],
      slides: prev.slides.map((slide, index) => index === safeIndex && slide.charactersSnapshot ? { ...slide,
        charactersSnapshot: [...slide.charactersSnapshot, copy(character)] } : slide) }));
    return character;
  };
  const updateCharacter = (id, updates) => setProject(prev => ({
    ...prev, characters: prev.characters.map(c => c.id === id ? { ...c, ...updates } : c),
    slides: prev.slides.map((slide, index) => index === safeIndex && slide.charactersSnapshot ? { ...slide,
      charactersSnapshot: slide.charactersSnapshot.map(c => c.id === id ? { ...c, ...updates } : c) } : slide)
  }));
  const getCharacterUsage = id => slides.reduce((count, slide) => count + characterReferences(slide, id), 0);
  const deleteCharacter = (id, replacementId) => {
    if (getCharacterUsage(id) && !replacementId) return false;
    setProject(prev => ({ ...prev,
      characters: prev.characters.filter(c => c.id !== id),
      slides: prev.slides.map(slide => replaceCharacterReferences(slide, id, replacementId))
    }));
    return true;
  };

  const addSlide = (type, options) => {
    const next = makeSlide(type, project, options);
    setProject(prev => ({ ...prev, slides: [...prev.slides, next] }));
    setActiveSlideIndex(slides.length);
    setEditTarget(null);
    return next;
  };
  const updateSlideContent = (id, value, recordHistory = true) => setProject(prev => ({ ...prev, slides: prev.slides.map(slide =>
    slide.id === id ? { ...slide, content: typeof value === 'function' ? value(slide.content) : { ...slide.content, ...value } } : slide
  ) }), recordHistory);
  const updateSlideMeta = (id, updates) => setProject(prev => ({ ...prev,
    slides: prev.slides.map(slide => slide.id === id ? { ...slide, ...(typeof updates === 'function' ? updates(slide) : updates) } : slide)
  }));
  const deleteSlide = id => {
    if (slides.length <= 1) return false;
    const removedIndex = slides.findIndex(slide => slide.id === id);
    if (removedIndex < 0) return false;
    setProject(prev => ({ ...prev, slides: prev.slides.filter(slide => slide.id !== id).map((slide, i) => ({ ...slide, order: i + 1 })) }));
    setActiveSlideIndex(removedIndex < safeIndex ? safeIndex - 1 :
      Math.min(safeIndex, slides.length - 2));
    return true;
  };
  const duplicateSlide = (id, { modern = false } = {}) => {
    const source = slides.find(slide => slide.id === id);
    if (!source) return;
    const captured = source.type === 'composition' ? copy(source) : captureScene(source, project).slide;
    const duplicate = { ...copy(captured), id: uid(), title: `${source.title} (adegan berikutnya)` };
    if (modern && sceneIdentity(source).app) {
      const { app, screen } = sceneIdentity(source);
      Object.assign(duplicate, { type: 'app_scene', renderVersion: 3, content: { ...duplicate.content, app, screen },
        viewport: { ...duplicate.viewport, crop: null, cropPreset: 'full' } });
    }
    const index = slides.indexOf(source) + 1;
    setProject(prev => ({ ...prev, slides: [...prev.slides.slice(0, index).map(s => s.id === id ? captured : s), duplicate, ...prev.slides.slice(index)]
      .map((slide, i) => ({ ...slide, order: i + 1 })) }));
    setActiveSlideIndex(index);
  };
  const reorderSlides = values => setProject(prev => ({ ...prev,
    slides: values.map((slide, i) => ({ ...slide, order: i + 1 }))
  }));
  const getCharacter = id => id === 'me' || !id
    ? { id: 'me', name: project?.selfCharacter?.name || 'Saya', handle: project?.selfCharacter?.handle || '@saya',
        avatar: project?.selfCharacter?.avatar || '' }
    : project?.characters.find(c => c.id === id) || { id, name: 'Karakter tidak ditemukan', handle: '@tidakada', avatar: '' };

  return <ProjectContext.Provider value={{
    ready, loadError, retryLoad: () => setLoadAttempt(value => value + 1), project, setProject, replaceProject, createProject, startExample, openProject, importProject,
    closeProject, saveNow, recentProjects, saveStatus, canUndo: history.past.length > 0, canRedo: history.future.length > 0,
    undo: () => dispatch({ type: 'undo' }), redo: () => dispatch({ type: 'redo' }),
    activeSlideIndex: safeIndex, setActiveSlideIndex, activeSlide, activeTab, setActiveTab,
    editTarget, setEditTarget, interactionMode, setInteractionMode, updateTitle, updateGlobalSettings, updateSelfCharacter,
    addCharacter, updateCharacter, getCharacterUsage, deleteCharacter, getCharacter,
    addSlide, updateSlideContent, updateSlideMeta, deleteSlide, duplicateSlide, reorderSlides
  }}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject harus digunakan di dalam ProjectProvider');
  return context;
}
