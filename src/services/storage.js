import { openDB } from 'idb';

const DB_NAME = 'au_studio_db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_SETTINGS = 'app_settings';

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS);
      }
    }
  });
}

export async function saveProject(project) {
  try {
    const db = await getDb();
    const updated = { ...project, updatedAt: Date.now() };
    await db.put(STORE_PROJECTS, updated);
    return updated;
  } catch (err) {
    console.error('Failed to save project to IndexedDB:', err);
    return project;
  }
}

export async function loadProject(id) {
  try {
    const db = await getDb();
    return await db.get(STORE_PROJECTS, id);
  } catch (err) {
    console.error('Failed to load project from IndexedDB:', err);
    return null;
  }
}

export async function getAllProjects() {
  try {
    const db = await getDb();
    return await db.getAll(STORE_PROJECTS);
  } catch (err) {
    console.error('Failed to load all projects:', err);
    return [];
  }
}

export async function deleteProject(id) {
  try {
    const db = await getDb();
    await db.delete(STORE_PROJECTS, id);
    return true;
  } catch (err) {
    console.error('Failed to delete project:', err);
    return false;
  }
}

// Export Project as .aujson file for backup/sharing
export function downloadProjectAsJson(project) {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = (project.title || 'au_project').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  a.href = url;
  a.download = `${safeTitle}.aujson`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import Project from uploaded .aujson
export function parseProjectJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target.result);
        if (!project || !project.slides || !project.characters) {
          throw new Error('Format file proyek .aujson tidak valid.');
        }
        resolve(project);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsText(file);
  });
}
