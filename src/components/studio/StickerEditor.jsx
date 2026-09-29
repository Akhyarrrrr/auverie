import { useEffect, useRef, useState } from 'react';
import { finite } from '../../services/sceneModel';

const loadImage = source => new Promise((resolve, reject) => {
  const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('Gambar tidak dapat dibaca.')); image.src = source;
});

export default function StickerEditor({ source, onSave, onCancel }) {
  const canvasRef = useRef(null), undoRef = useRef([]), gesture = useRef(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 1, height: 1 });
  const [mode, setMode] = useState('erase'), [brush, setBrush] = useState(24);
  const [outline, setOutline] = useState(0), [color, setColor] = useState('#ffffff');
  const [name, setName] = useState('Stiker baru'), [exportWidth, setExportWidth] = useState(512);
  const [error, setError] = useState(''), [busy, setBusy] = useState(true), [revision, setRevision] = useState(0);
  const sync = () => {
    const canvas = canvasRef.current;
    setSize({ width: canvas.width, height: canvas.height }); setCrop({ x: 0, y: 0, width: canvas.width, height: canvas.height });
    setRevision(value => value + 1);
  };
  useEffect(() => {
    let cancelled = false;
    loadImage(source).then(image => {
      if (cancelled) return;
      const scale = Math.min(1, 1600 / Math.max(image.width, image.height)), canvas = canvasRef.current;
      canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); sync();
    }).catch(cause => setError(cause.message)).finally(() => setBusy(false));
    return () => { cancelled = true; };
  }, [source]);
  const remember = () => { undoRef.current = [...undoRef.current.slice(-14), canvasRef.current.toDataURL('image/png')]; };
  const undo = async () => {
    const previous = undoRef.current.pop(); if (!previous) return;
    setBusy(true);
    try { const image = await loadImage(previous), canvas = canvasRef.current;
      canvas.width = image.width; canvas.height = image.height; canvas.getContext('2d').drawImage(image, 0, 0); sync();
    } catch (cause) { setError(cause.message); } finally { setBusy(false); }
  };
  const point = event => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: Math.max(0, Math.min(size.width, (event.clientX - rect.left) * size.width / rect.width)),
      y: Math.max(0, Math.min(size.height, (event.clientY - rect.top) * size.height / rect.height)) };
  };
  const erase = (start, end) => {
    const ctx = canvasRef.current.getContext('2d'); ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = brush; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x + .01, end.y + .01); ctx.stroke(); ctx.restore();
  };
  const down = event => {
    if (busy) return;
    const start = point(event); event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { start, last: start };
    if (mode === 'erase') { remember(); erase(start, start); } else setCrop({ ...start, width: 1, height: 1 });
  };
  const move = event => {
    if (!gesture.current) return;
    const at = point(event), { start, last } = gesture.current;
    if (mode === 'erase') erase(last, at);
    else setCrop({ x: Math.min(start.x, at.x), y: Math.min(start.y, at.y), width: Math.max(1, Math.abs(at.x - start.x)), height: Math.max(1, Math.abs(at.y - start.y)) });
    gesture.current.last = at;
  };
  const stop = () => { gesture.current = null; setRevision(value => value + 1); };
  const applyCrop = () => {
    const canvas = canvasRef.current, x = Math.round(finite(crop.x, 0, 0, canvas.width - 1)), y = Math.round(finite(crop.y, 0, 0, canvas.height - 1));
    const width = Math.round(finite(crop.width, canvas.width - x, 1, canvas.width - x)), height = Math.round(finite(crop.height, canvas.height - y, 1, canvas.height - y));
    remember(); const pixels = canvas.getContext('2d').getImageData(x, y, width, height);
    canvas.width = width; canvas.height = height; canvas.getContext('2d').putImageData(pixels, 0, 0); sync();
  };
  const silhouette = () => {
    remember(); const ctx = canvasRef.current.getContext('2d'); ctx.save(); ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color; ctx.fillRect(0, 0, size.width, size.height); ctx.restore(); setRevision(value => value + 1);
  };
  const save = async () => {
    setBusy(true); setError('');
    try {
      const original = canvasRef.current, radius = Math.max(0, Math.min(24, Number(outline) || 0));
      const mask = document.createElement('canvas'); mask.width = original.width; mask.height = original.height;
      const maskContext = mask.getContext('2d'); maskContext.drawImage(original, 0, 0);
      maskContext.globalCompositeOperation = 'source-in'; maskContext.fillStyle = color; maskContext.fillRect(0, 0, mask.width, mask.height);
      const result = document.createElement('canvas'); result.width = original.width + radius * 2; result.height = original.height + radius * 2;
      const ctx = result.getContext('2d');
      if (radius) for (let angle = 0; angle < 360; angle += 6) ctx.drawImage(mask, radius + Math.cos(angle * Math.PI / 180) * radius, radius + Math.sin(angle * Math.PI / 180) * radius);
      ctx.drawImage(original, radius, radius);
      const resized = document.createElement('canvas'); resized.width = Math.round(finite(exportWidth, 512, 24, 2048));
      resized.height = Math.max(1, Math.round(resized.width * result.height / result.width));
      resized.getContext('2d').drawImage(result, 0, 0, resized.width, resized.height);
      onSave({ id: crypto.randomUUID(), name: name.trim() || 'Stiker', url: resized.toDataURL('image/png') });
    } catch (cause) { setError(cause.message || 'Stiker gagal disimpan.'); }
    finally { setBusy(false); }
  };
  return <div className="sticker-editor">
    <p className="field-hint">Geser kuas untuk menghapus latar. Pilih Potong lalu tarik kotak pada gambar. Pola kotak menunjukkan area transparan.</p>
    <div className="mode-switch" role="group" aria-label="Alat stiker"><button className={mode === 'erase' ? 'active' : ''} onClick={() => setMode('erase')}>Kuas hapus</button><button className={mode === 'crop' ? 'active' : ''} onClick={() => setMode('crop')}>Potong</button></div>
    <div className="sticker-canvas-wrap"><div style={{ position: 'relative', width: 'fit-content', margin: 'auto' }}>
      <canvas ref={canvasRef} aria-label="Gambar stiker, tarik untuk menghapus atau memilih potongan" onPointerDown={down} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} />
      {mode === 'crop' && <div className="sticker-crop-box" style={{ left: `${crop.x / size.width * 100}%`, top: `${crop.y / size.height * 100}%`, width: `${crop.width / size.width * 100}%`, height: `${crop.height / size.height * 100}%` }} />}
    </div></div>
    <div className="field-row"><label className="field"><span>Nama koleksi</span><input value={name} onChange={event => setName(event.target.value)} /></label>
      <label className="field"><span>Ukuran kuas (px)</span><input type="number" min="1" max="200" value={brush} onChange={event => setBrush(Math.max(1, Math.min(200, Number(event.target.value))))} /></label></div>
    {mode === 'crop' && <><div className="field-row">{Object.keys(crop).map(key => <label className="field" key={key}><span>{key} (px)</span><input type="number" value={Math.round(crop[key])} onChange={event => setCrop({ ...crop, [key]: Number(event.target.value) })} /></label>)}</div>
      <button className="button secondary" disabled={busy} onClick={applyCrop}>Terapkan potongan</button></>}
    <div className="field-row"><label className="field"><span>Warna outline / siluet</span><input type="color" value={color} onChange={event => setColor(event.target.value)} /></label>
      <label className="field"><span>Outline (px)</span><input type="number" min="0" max="24" value={outline} onChange={event => setOutline(Number(event.target.value))} /></label>
      <label className="field"><span>Lebar hasil (px)</span><input type="number" min="24" max="2048" value={exportWidth} onChange={event => setExportWidth(Number(event.target.value))} /></label></div>
    <div className="field-row"><button className="button secondary" disabled={busy} onClick={silhouette}>Jadikan siluet</button><button className="button secondary" disabled={busy || !undoRef.current.length || !revision} onClick={undo}>Urungkan edit stiker</button></div>
    {error && <p role="alert" className="inline-error">{error}</p>}
    <div className="dialog-footer"><button className="button secondary" onClick={onCancel}>Batal</button><button className="button primary" disabled={busy} onClick={save}>Simpan dan gunakan stiker</button></div>
  </div>;
}
