import { toBlob } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Filter out control UI / drag handles from export
function filterNodes(node) {
  return !node.classList?.contains('no-export');
}

export async function exportElementAsBlob(element, pixelRatio = 2) {
  if (!element) throw new Error('Element tidak ditemukan');
  // html-to-image rounds computed font sizes down by 0.1px when cloning in Chromium.
  const prefix = crypto.randomUUID(), nodes = [element, ...element.querySelectorAll('*')];
  const previous = nodes.map(node => node.getAttribute('data-export-font'));
  const exactFonts = document.createElement('style');
  exactFonts.textContent = nodes.map((node, index) => {
    const id = `${prefix}-${index}`, size = getComputedStyle(node).fontSize;
    node.setAttribute('data-export-font', id);
    return `[data-export-font="${id}"]{font-size:${size}!important}`;
  }).join('');
  element.append(exactFonts);
  try {
    const blob = await toBlob(element, { pixelRatio, filter: filterNodes, skipFonts: false });
    if (!blob) throw new Error('Gambar gagal dibuat. Periksa gambar yang digunakan pada slide.');
    return blob;
  } finally {
    exactFonts.remove();
    nodes.forEach((node, index) => previous[index] == null ? node.removeAttribute('data-export-font') : node.setAttribute('data-export-font', previous[index]));
  }
}

export async function checkExportAssets(element) {
  if (element.querySelector('.wa-media-placeholder, [data-missing-asset]')) {
    throw new Error('Ada foto, album, atau stiker yang belum diisi. Pilih / unggah gambar lewat panel Edit.');
  }
  const sources = new Set();
  for (const node of [element, ...element.querySelectorAll('*')]) {
    if (node instanceof HTMLImageElement && node.src) sources.add(node.src);
    const background = getComputedStyle(node).backgroundImage;
    for (const match of background.matchAll(/url\(["']?([^"')]+)["']?\)/g)) sources.add(match[1]);
  }
  await Promise.all([...sources].map(async source => {
    if (/^(data:|blob:)/.test(source)) return;
    try {
      const response = await fetch(source, { mode: 'cors', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('HTTP ' + response.status);
    } catch {
      throw new Error(`Gambar tidak bisa diekspor: ${source.slice(0, 140)}. Unggah berkas pengganti melalui panel Edit.`);
    }
  }));
  await Promise.all([...element.querySelectorAll('img')].map(image => image.decode().catch(() => {
    throw new Error(`Gambar “${image.alt || 'tanpa nama'}” gagal dimuat (${image.src.slice(0, 100)}). Unggah berkas pengganti di panel Edit.`);
  })));
  await Promise.all([...sources].map(async source => {
    const image = new Image(); image.src = source;
    try { await image.decode(); } catch { throw new Error(`Latar / gambar gagal dibaca (${source.slice(0, 100)}). Unggah berkas pengganti di panel Edit.`); }
  }));
}

export function hasHiddenContent(element) {
  const composition = element.matches('.composition-canvas') ? element : element.querySelector('.composition-canvas');
  if (composition && composition.dataset.intentionalComposition !== 'true') {
    const boundary = composition.getBoundingClientRect();
    if ([...composition.children].some(part => { const rect = part.getBoundingClientRect();
      return rect.left < boundary.left - 2 || rect.right > boundary.right + 2 || rect.top < boundary.top - 2 || rect.bottom > boundary.bottom + 2;
    })) return true;
  }
  if ([...element.querySelectorAll('.scene-viewport')].some(node => node.dataset.intentionalViewport !== 'true'
    && (node.querySelector('.scene-stream')?.scrollHeight || 0) > node.clientHeight + 3)) return true;
  const scrollAreas = '.wa-chat-body, .x-content-scroll, .x-dm-conversation, .ig-dm-body, .ig-post-view, .lockscreen-notifs-container, .ig-story-content';
  if ([...element.querySelectorAll(scrollAreas)].some(node =>
    !node.classList.contains('scene-viewport') && !node.closest('[data-intentional-viewport="true"]') &&
    !(node.classList.contains('wa-chat-body') && node.closest('.keyboard-open'))
      && node.scrollHeight > node.clientHeight + 3)) return true;
  const custom = element.querySelector('.custom-app-screen');
  if (!custom || custom.closest('[data-intentional-viewport="true"]')) return false;
  const boundary = custom.getBoundingClientRect();
  return [...custom.querySelectorAll('.custom-block')].some(block => {
    const rect = block.getBoundingClientRect();
    return rect.left < boundary.left - 2 || rect.right > boundary.right + 2
      || rect.top < boundary.top - 2 || rect.bottom > boundary.bottom + 2
      || block.scrollHeight > block.clientHeight + 3;
  });
}

export async function batchExportSlidesAsZip(slides, renderSlideAsync, projectTitle = 'AU_Story', onProgress) {
  const zip = new JSZip();
  const folderName = (projectTitle || 'AU_Story').replace(/[^a-z0-9_-]/gi, '_');
  const folder = zip.folder(folderName);

  const total = slides.length;
  for (let i = 0; i < total; i++) {
    const slide = slides[i];
    if (onProgress) {
      onProgress({ current: i + 1, total, slideTitle: slide.title || `Slide ${i + 1}` });
    }

    // Call callback to render the specific slide and get its DOM blob
    const blob = await renderSlideAsync(slide, i);
    const paddedIndex = String(i + 1).padStart(2, '0');
    const safeType = slide.type || 'screen';
    folder.file(`${paddedIndex}_${safeType}.png`, blob);
  }

  if (onProgress) {
    onProgress({ current: total, total, status: 'Mengompres file ZIP...' });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${folderName}_all_slides.zip`);
  return true;
}
