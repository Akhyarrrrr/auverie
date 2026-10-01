import { openDB } from 'idb';
import { DEFAULT_GLOBAL_SETTINGS } from '../data/samplePresets.js';
import { normalizePerson, normalizeSlide, SCHEMA_VERSION } from './sceneModel.js';
import { storyError } from './errors.js';

const DB_NAME = 'au_studio_db';
const DB_VERSION = 1;
const PROJECTS = 'projects';
const SETTINGS = 'app_settings';
const LAST_PROJECT = 'last_project_id';

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(PROJECTS)) db.createObjectStore(PROJECTS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(SETTINGS)) db.createObjectStore(SETTINGS);
    }
  });
}

export function normalizeProject(input) {
  if (!input || !Array.isArray(input.slides) || !Array.isArray(input.characters)) {
    throw storyError('Berkas proyek tidak memiliki daftar slide dan karakter yang valid.');
  }
  if (input.characters.some(person => !person || typeof person !== 'object' || Array.isArray(person))) throw storyError('Daftar karakter berisi data yang tidak valid.');
  if (!input.slides.length) throw storyError('Cerita harus memiliki setidaknya satu slide.');
  const settings = { ...DEFAULT_GLOBAL_SETTINGS, ...(input.globalSettings || {}) };
  settings.phoneModel = String(settings.phoneModel || DEFAULT_GLOBAL_SETTINGS.phoneModel);
  const characters = input.characters.map((character, index) => normalizePerson(character, `karakter-${index}`));
  const selfCharacter = normalizePerson(input.selfCharacter || { name: 'Saya', handle: '@saya' }, 'me');
  return {
    ...input,
    schemaVersion: SCHEMA_VERSION,
    id: String(input.id || crypto.randomUUID()),
    title: String(input.title || 'Cerita tanpa judul'),
    globalSettings: settings, characters, selfCharacter,
    stickerLibrary: Array.isArray(input.stickerLibrary) ? input.stickerLibrary.filter(item => item && typeof item.url === 'string') : [],
    slides: input.slides.map((slide, index) => {
      const normalized = normalizeSlide(slide, index);
      return { ...normalized, customSettings: { ...settings, ...normalized.customSettings },
        charactersSnapshot: normalized.charactersSnapshot || structuredClone([...characters, { ...selfCharacter, id: 'me' }]) };
    })
  };
}

export async function saveProject(project) {
  const db = await getDb();
  const updated = { ...project, updatedAt: Date.now() };
  const transaction = db.transaction([PROJECTS, SETTINGS], 'readwrite');
  await Promise.all([
    transaction.objectStore(PROJECTS).put(updated),
    transaction.objectStore(SETTINGS).put(updated.id, LAST_PROJECT),
    transaction.done
  ]);
  return updated;
}

export async function loadProject(id) {
  const db = await getDb();
  const saved = await db.get(PROJECTS, id);
  return saved ? normalizeProject(saved) : null;
}

export async function getLastProjectId() {
  return (await getDb()).get(SETTINGS, LAST_PROJECT);
}

export async function getAllProjects() {
  const projects = await (await getDb()).getAll(PROJECTS);
  return projects.map(normalizeProject).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function downloadProjectAsJson(project) {
  const assets = new Set(['avatar', 'mediaUrl', 'imageUrl', 'backgroundUrl', 'coverUrl', 'stickerUrl', 'albumArt', 'wallpaperUrl',
    'groupAvatar', 'contactAvatar', 'callImageUrl', 'selfVideoUrl', 'customWallpaper', 'src']);
  const failures = [], cache = new Map();
  const embed = async source => {
    if (!cache.has(source)) cache.set(source, (async () => {
      try {
        const response = await fetch(source, { mode: 'cors', signal: AbortSignal.timeout(8000) });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error();
        const blob = await response.blob();
        return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
      } catch { failures.push(source); return source; }
    })());
    return cache.get(source);
  };
  const portable = async (value, key = '') => {
    if (typeof value === 'string') return /^(https?:|\/)/.test(value) && (assets.has(key) || ['images', 'stickerLibrary'].includes(key)) ? embed(value) : value;
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) return Promise.all(value.map(item => portable(item, key)));
    return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([name, item]) => [name, await portable(item, name === 'url' && ['stickerLibrary', 'images'].includes(key) ? key : name)])));
  };
  const blob = new Blob([JSON.stringify(await portable(project), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(project.title || 'cerita-au').replace(/[^a-z0-9_-]/gi, '_')}.aujson`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return failures;
}

export async function parseProjectJsonFile(file) {
  try {
    return normalizeProject(JSON.parse(await file.text()));
  } catch (error) {
    throw error instanceof SyntaxError ? storyError('File cerita tidak dapat dibuka. Pilih file .aujson yang pernah kamu simpan.') : error;
  }
}
