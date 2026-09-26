import { toBlob, toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Filter out control UI / drag handles from export
function filterNodes(node) {
  if (node.classList && (
    node.classList.contains('no-export') ||
    node.classList.contains('canvas-toolbar') ||
    node.classList.contains('slide-delete-hover-btn')
  )) {
    return false;
  }
  return true;
}

export async function exportElementAsBlob(element, pixelRatio = 2) {
  if (!element) throw new Error('Element tidak ditemukan');
  return await toBlob(element, {
    pixelRatio,
    filter: filterNodes,
    quality: 0.95,
    skipFonts: false
  });
}

export async function downloadElementAsPng(element, filename = 'au-slide.png', pixelRatio = 2) {
  const blob = await exportElementAsBlob(element, pixelRatio);
  saveAs(blob, filename);
}

export async function copyElementToClipboard(element, pixelRatio = 2) {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard API tidak didukung di browser ini.');
  }
  const blob = await exportElementAsBlob(element, pixelRatio);
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
  return true;
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
