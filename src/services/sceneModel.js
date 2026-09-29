import { messageKind, appDefinition, sceneIdentity } from '../data/sceneCatalog.js';

export const SCHEMA_VERSION = 3;
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
export const finite = (value, fallback, min = -Infinity, max = Infinity) => value != null && value !== '' && Number.isFinite(Number(value))
  ? Math.max(min, Math.min(max, Number(value))) : fallback;

export function deviceMetrics(slide, settings = {}) {
  const model = String(slide?.customSettings?.phoneModel || settings.phoneModel || 'iphone-16-pro');
  const os = model.startsWith('samsung') ? 'android' : model.startsWith('iphone') ? 'ios'
    : slide?.customSettings?.os || settings.os || 'ios';
  // Logical screen sizes. Android density is a calibrated profile, not physical pixels.
  const dimensions = slide?.renderVersion === 2 ? model === 'frameless' ? [380, 800] : os === 'android' ? [364, 784] : [360, 780] : model === 'iphone-16-pro' ? [440, 956] : model === 'iphone-14-notch' ? [390, 844]
    : model === 'samsung-s24-ultra' ? [412, 893] : [390, 844];
  const width = finite(slide?.customSettings?.screenWidth, dimensions[0], 240, 1200);
  const height = finite(slide?.customSettings?.screenHeight, dimensions[1], 400, 2400);
  const inset = model === 'frameless' ? 0 : os === 'android' ? 8 : 10;
  return { model, os, width, height, inset, outerWidth: width + inset * 2, outerHeight: height + inset * 2 };
}

export function cropRectangle(crop, width, height) {
  const source = object(crop);
  const x = finite(source.x, 0, 0, width - 1);
  const y = finite(source.y, 0, 0, height - 1);
  return { x, y, width: finite(source.width, width - x, 1, width - x), height: finite(source.height, height - y, 1, height - y) };
}
export function cropPreset(name, width, height, keyboardHeight = 290) {
  if (name === 'top') return { x: 0, y: 0, width, height: height / 2 };
  if (name === 'bottom') return { x: 0, y: height / 2, width, height: height / 2 };
  if (name === 'keyboard') return cropRectangle({ x: 0, y: height - keyboardHeight - 110, width, height: keyboardHeight + 110 }, width, height);
  return { x: 0, y: 0, width, height };
}
export function sceneCrop(slide, settings = {}) {
  const size = deviceMetrics(slide, settings), view = slide.viewport || {};
  return view.cropPreset && view.cropPreset !== 'manual' ? cropPreset(view.cropPreset, size.width, size.height,
    finite(slide.content?.keyboardHeight || size.width * .79, size.width * .79, 160, 600)) : cropRectangle(view.crop, size.width, size.height);
}
export function normalizePerson(input, id) {
  const person = object(input);
  for (const key of ['name', 'handle', 'avatar', 'bio', 'color']) if (person[key] != null && typeof person[key] === 'object') {
    throw new Error(`Data karakter ${key} harus berupa teks.`);
  }
  return { ...person, id: String(person.id || id), name: String(person.name || 'Karakter'), handle: String(person.handle || '@karakter'), avatar: String(person.avatar || '') };
}

export function normalizeSlide(input, index = 0, depth = 0) {
  const slide = object(input);
  if (!['app_scene', 'composition', 'wa_chat', 'wa_group', 'x_tweet', 'x_thread', 'x_dm', 'ig_dm', 'ig_post', 'ig_story', 'lockscreen', 'custom_app'].includes(slide.type)) {
    throw new Error(`Format slide ${index + 1} tidak dikenal.`);
  }
  const content = { ...object(slide.content) };
  const validate = value => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (/^(text|caption|name|title|handle|song|artist|bio|time|timestamp|statusText|dateLabel|draftText|.*Url|avatar|src|url|emoji|.*Count|.*Name|.*Text|duration|voiceDuration|phoneNumber|address|fileSize|fileType|fileName|description|prompt)$/.test(key) && child != null && typeof child === 'object') {
        throw new Error(`Isi ${key} pada slide ${index + 1} harus berupa teks.`);
      }
      if (key === 'labels' && Object.values(object(child)).some(label => label != null && typeof label === 'object')) {
        throw new Error(`Label pada slide ${index + 1} harus berupa teks.`);
      }
      if (key === 'options') value[key] = Array.isArray(child) ? child.filter(item => item && typeof item === 'object') : [];
      validate(child);
    }
  };
  validate(content);
  for (const key of ['messages', 'posts', 'comments', 'contacts', 'notifications', 'tracks', 'notes', 'images', 'replies', 'elements', 'checklist', 'storyStickers', 'keyboardSuggestions']) {
    if (content[key] !== undefined && !Array.isArray(content[key])) content[key] = [];
    if (Array.isArray(content[key])) content[key] = content[key].filter(item => item != null).map((item, i) => {
      if (typeof item !== 'object') return ['images', 'keyboardSuggestions'].includes(key) ? String(item) : { id: `${key}-${i}`, text: String(item) };
      return { ...item, id: String(item.id || `${key}-${i}`), ...(item.images ? { images: Array.isArray(item.images) ? item.images.filter(Boolean) : [] } : {}) };
    });
  }
  if (content.messages) content.messages = content.messages.map((value, i) => {
    const message = object(value);
    return { ...message, id: String(message.id || `message-${i}`), kind: messageKind(message),
      reactions: Array.isArray(message.reactions) ? message.reactions : [],
      images: Array.isArray(message.images) ? message.images.filter(Boolean) : [],
      options: Array.isArray(message.options) ? message.options.filter(item => item && typeof item === 'object') : [] };
  });
  const identity = sceneIdentity({ ...slide, content });
  const state = object(slide.sceneState);
  validate(state);
  const screen = state.screen || content.screen || identity.screen;
  const app = appDefinition(identity.app);
  if (slide.type === 'app_scene' && !app) throw new Error('Pilih aplikasi yang dikenal untuk adegan ini.');
  if (app && screen && !app.screens.includes(screen)) throw new Error(`Layar ${screen} tidak tersedia untuk ${app.name}.`);
  const viewport = object(slide.viewport);
  const normalized = { ...slide, id: String(slide.id || `slide-${index}`), order: index + 1,
    renderVersion: slide.renderVersion === 2 ? 2 : slide.renderVersion === 3 || ['app_scene', 'composition'].includes(slide.type) ? 3 : 2,
    title: String(slide.title || `Slide ${index + 1}`), customSettings: object(slide.customSettings), content,
    sceneState: { ...state, ...(screen ? { screen } : {}), overlay: state.overlay || null,
      history: Array.isArray(state.history) ? state.history : [] },
    viewport: { ...viewport, scroll: finite(viewport.scroll, 0, 0, 100000), anchor: viewport.anchor === 'bottom' ? 'bottom' : 'top',
      intentional: Boolean(viewport.intentional || content.showKeyboard) } };
  if (Array.isArray(slide.charactersSnapshot)) normalized.charactersSnapshot = slide.charactersSnapshot.filter(Boolean).map((person, i) => normalizePerson(person, `karakter-${i}`));
  if (normalized.customSettings.phoneModel != null) normalized.customSettings.phoneModel = String(normalized.customSettings.phoneModel);
  if (normalized.customSettings.locale != null) normalized.customSettings.locale = normalized.customSettings.locale === 'en' ? 'en' : 'id';
  if (normalized.type === 'composition') {
    if (depth) throw new Error('Kolase tidak boleh memuat kolase lain. Pilih adegan layar sebagai sumber.');
    const composition = object(slide.composition);
    normalized.composition = { ...composition, width: finite(composition.width, 900, 100, 4096),
      height: finite(composition.height, 1200, 100, 4096), background: composition.background || '#ffffff',
      items: (Array.isArray(composition.items) ? composition.items : []).map((value, i) => {
        const item = object(value);
        if (!item.snapshot?.slide) throw new Error('Bagian kolase tidak memiliki salinan adegan.');
        return { ...item, id: String(item.id || `part-${i}`), x: finite(item.x, 0, -4096, 4096), y: finite(item.y, 0, -4096, 4096),
          width: finite(item.width, 390, 1, 4096), height: finite(item.height, 844, 1, 4096),
          snapshot: { ...item.snapshot, globalSettings: object(item.snapshot.globalSettings),
            characters: (Array.isArray(item.snapshot.characters) ? item.snapshot.characters : []).filter(Boolean).map((person, i) => normalizePerson(person, `karakter-${i}`)),
            selfCharacter: normalizePerson(item.snapshot.selfCharacter, 'me'), slide: normalizeSlide(item.snapshot.slide, 0, depth + 1) } };
      }) };
  }
  return normalized;
}

export function captureScene(slide, project) {
  if (slide.type === 'composition') throw new Error('Pilih adegan layar sebagai sumber kolase.');
  const characters = slide.charactersSnapshot || [...project.characters, { id: 'me', ...project.selfCharacter }];
  return structuredClone({ slide: { ...slide, charactersSnapshot: characters,
    customSettings: { ...project.globalSettings, ...slide.customSettings } },
    globalSettings: { ...project.globalSettings, ...slide.customSettings }, characters: characters.filter(item => item.id !== 'me'),
    selfCharacter: characters.find(item => item.id === 'me') || project.selfCharacter });
}

const PERSON_KEYS = new Set(['targetCharacterId', 'authorId', 'senderId', 'characterId', 'personId', 'composerSenderId']);
export function characterReferences(value, id) {
  if (!value || typeof value !== 'object') return 0;
  return Object.entries(value).reduce((count, [key, child]) => count + (PERSON_KEYS.has(key) ? Number(child === id) : characterReferences(child, id)), 0);
}
export function replaceCharacterReferences(value, id, replacementId) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(item => replaceCharacterReferences(item, id, replacementId));
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key,
    PERSON_KEYS.has(key) && child === id ? replacementId : replaceCharacterReferences(child, id, replacementId)]));
}

export function outputDimensions(slide, settings = {}, surface = 'screen') {
  if (slide.type === 'composition') return { width: slide.composition.width, height: slide.composition.height };
  const size = deviceMetrics(slide, settings);
  const crop = sceneCrop(slide, settings);
  return surface === 'phone' ? { width: crop.width + size.inset * 2, height: crop.height + size.inset * 2 }
    : { width: crop.width, height: crop.height };
}
