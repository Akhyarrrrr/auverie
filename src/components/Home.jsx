import { useRef, useState } from 'react';
import { ArrowRight, FileUp, FolderOpen, Plus } from 'lucide-react';
import { ProjectProvider, useProject } from '../context/ProjectContext';
import { useUI } from '../context/UIContext';
import { SAMPLE_PROJECT } from '../data/samplePresets';
import { SCENE_APPS, sceneDefaults } from '../data/sceneCatalog';
import { deviceMetrics } from '../services/sceneModel';
import { parseProjectJsonFile } from '../services/storage';
import PhoneContainer from './phone/PhoneContainer';
import InterfaceControls, { Brand } from './InterfaceControls';

const examples = [
  { label: 'WhatsApp', detail: 'Chat dan grup', slide: SAMPLE_PROJECT.slides[1] },
  { label: 'X Chat', detail: 'Pesan dan postingan', slide: { id: 'demo-x', type: 'x_dm', customSettings: { theme: 'dark' }, content: {
    targetCharacterId: 'char-reyhan', messages: [
      { id: 'x1', senderId: 'char-reyhan', text: 'Kamu masih bangun?', time: '23.42' },
      { id: 'x2', senderId: 'me', text: 'Masih. Ada apa?', time: '23.43', status: 'read' },
      { id: 'x3', senderId: 'char-reyhan', text: 'Besok ketemu sebentar, ya. Ada yang ingin aku ceritakan.', time: '23.44' }
    ] } } },
  { label: 'Instagram', detail: 'DM, post, dan story', slide: SAMPLE_PROJECT.slides[4] },
  { label: 'Layar kunci', detail: 'Notifikasi cerita', slide: SAMPLE_PROJECT.slides[0] },
  { label: 'Aplikasi bebas', detail: 'Rancang layar sendiri', slide: { id: 'demo-custom', type: 'custom_app', customSettings: { theme: 'light' },
    content: { appName: 'Catatan', backgroundColor: '#f2eee5', elements: [
      { id: 'appbar', type: 'appbar', text: 'catatan.', x: 0, y: 0, width: 100, height: 10, background: '#ffffff', fontSize: 19 },
      { id: 'title', type: 'text', text: 'Hal-hal yang belum sempat kita katakan', x: 7, y: 17, width: 86, height: 18, fontSize: 27, color: '#2b3933' },
      { id: 'note', type: 'notification', title: 'Draf baru', text: 'Sebuah cerita dimulai dari pesan yang belum terkirim.', x: 7, y: 43, width: 86, height: 14, fontSize: 15, background: '#ffffff' }
    ] } } }
];
for (const app of SCENE_APPS.filter(app => !['whatsapp', 'x', 'instagram'].includes(app.id))) {
  const screen = ({ spotify: 'player', notes: 'note', phone: 'call', tiktok: 'reel', facebook: 'feed' })[app.id] || 'chat';
  examples.push({ label: app.name, detail: app.name, slide: { id: 'demo-' + app.id, type: 'app_scene', sceneState: { screen },
    customSettings: { theme: 'light' }, viewport: { anchor: 'bottom' }, content: {
      ...sceneDefaults(app.id, screen, SAMPLE_PROJECT), text: 'Ada cerita yang dimulai dari satu pesan sederhana.',
      caption: 'Menyimpan sedikit cerita dari hari ini.', albumArt: SAMPLE_PROJECT.slides[4].content?.imageUrl,
      mediaUrl: SAMPLE_PROJECT.slides[4].content?.imageUrl,
      messages: [{ id: 'm1', kind: 'text', senderId: SAMPLE_PROJECT.characters[0].id, text: 'Besok kita ketemu di tempat biasa?', time: '21:30' },
        { id: 'm2', kind: 'text', senderId: 'me', text: 'Iya. Ada banyak cerita yang ingin kubagikan.', time: '21:31', status: 'read' }]
    } } });
}
const demoProject = { ...SAMPLE_PROJECT, slides: examples.map(item => ({ ...item.slide, renderVersion: 3 })) };
const categories = [
  ['Percakapan', 'Pesan, album, stiker, voice note, dan draft yang belum terkirim.', 0],
  ['Postingan dan profil', 'Feed, komentar, story, dan detail akun yang menghidupkan tokohmu.', 2],
  ['Notifikasi dan panggilan', 'Layar kunci atau telepon masuk untuk momen yang menentukan.', 3],
  ['Musik dan narasi', 'Lagu, lirik, dan catatan untuk bagian cerita yang lebih personal.', examples.findIndex(item => item.label === 'Spotify')],
  ['Aplikasi bebas', 'Latar sendiri dengan teks, gambar, dan elemen yang bebas disusun.', 4],
  ['Potongan dan kolase', 'Pilih bagian layar yang bercerita, lalu susun beberapa adegan.', 0]
];

export function PublicHeader({ onCreate }) {
  const { t } = useUI();
  return <header className="public-header"><a href="#/" className="brand-link" aria-label="Auverie"><Brand /></a>
    <nav aria-label={t('Beranda')}><a href="#/examples">{t('Contoh')}</a><a href="#/help">{t('Panduan')}</a></nav>
    <div className="public-header-actions"><InterfaceControls />{onCreate && <button className="button primary header-create" onClick={onCreate}>{t('Buat cerita')}</button>}</div>
  </header>;
}

export function PublicFooter() {
  const { t } = useUI();
  return <footer className="public-footer"><div><Brand /><p>{t('Tidak perlu akun. Cerita tersimpan di browser ini.')}</p></div>
    <nav aria-label={t('Bantuan')}><a href="#/help">{t('Bantuan')}</a><a href="#/about">{t('Tentang & penyimpanan')}</a><a href="https://github.com/Akhyarrrrr/auverie" target="_blank" rel="noreferrer">GitHub</a></nav>
  </footer>;
}

export default function Home({ onEnter }) {
  const { recentProjects, project, createProject, startExample, openProject, importProject } = useProject();
  const { t, locale, errorText } = useUI();
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [demoIndex, setDemoIndex] = useState(0);
  const fileRef = useRef(null), demoRef = useRef(null);
  const demo = demoProject.slides[demoIndex], demoSize = deviceMetrics(demo, demoProject.globalSettings);
  const demoScale = Math.min(515 / demoSize.outerHeight, 260 / demoSize.outerWidth);
  const run = async (action, first = false) => {
    if (busy) return;
    setBusy(true); setError('');
    try { await action(); onEnter(first); }
    catch (cause) { setError(cause); } finally { setBusy(false); }
  };
  const chooseDemo = index => { setDemoIndex(index); demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  const loadFile = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (file) await run(async () => importProject(await parseProjectJsonFile(file)));
  };
  const last = project || recentProjects[0];
  return <main className="project-start">
    <PublicHeader onCreate={() => run(() => createProject(t('Cerita baru')), true)} />
    <div className="start-content">
      <section className="start-hero" aria-labelledby="start-title">
        <div className="start-intro"><p className="intro-eyebrow">{t('Langsung menulis. Tanpa akun.')}</p>
          <h1 id="start-title">{locale === 'id' ? <>Ceritamu,<br />layar demi <em>layar.</em></> : <>Your story,<br />screen by <em>screen.</em></>}</h1>
          <p>{t('Buat percakapan yang bikin penasaran, postingan yang menyambung cerita, atau satu notifikasi yang mengubah segalanya. Kamu yang mengatur setiap detailnya.')}</p>
          <div className="start-actions"><button className="start-main-action" disabled={busy} onClick={() => run(() => createProject(t('Cerita baru')), true)}><Plus size={19} />{t('Buat cerita')}</button>
            <button className="start-example-action" disabled={busy} onClick={() => run(startExample)}>{t('Coba contoh')}</button></div>
          <button className="start-import-action" disabled={busy} onClick={() => fileRef.current?.click()}><FileUp size={17} />{t('Buka file cerita')}</button>
          <p className="start-format-note">{t('Cerita AU adalah cerita fiksi yang disampaikan lewat layar aplikasi dan media sosial.')}</p>
        </div>
        <section className="start-demo" id="examples" ref={demoRef} aria-label={t('Begini hasilnya')}>
          <div className="start-demo-heading"><span>{t('Contoh cerita fiksi')}</span><strong>{t(examples[demoIndex].detail)}</strong></div>
          <div className="start-demo-stage"><div className="demo-margin-note"><span>01</span><p>{t('Begini hasilnya')}</p></div>
            <div key={demoIndex} className="start-demo-phone" aria-hidden="true" style={{ width: demoSize.outerWidth * demoScale, height: demoSize.outerHeight * demoScale }}>
              <ProjectProvider previewProject={demoProject}><PhoneContainer slide={demo} zoom={demoScale} /></ProjectProvider>
            </div>
          </div>
          <div className="start-demo-picker" role="group" aria-label={t('Pilih contoh tampilan')}>
            {examples.slice(0, 5).map((item, index) => <button key={item.label} type="button" aria-pressed={demoIndex === index} className={demoIndex === index ? 'active' : ''} onClick={() => setDemoIndex(index)}>{t(item.label)}</button>)}
          </div>
          <label className="field start-more-demos"><span>{t('Lihat aplikasi lainnya')}</span><select value={demoIndex} onChange={event => setDemoIndex(Number(event.target.value))}>{examples.map((item, index) => <option key={item.label} value={index}>{t(item.label)}</option>)}</select></label>
        </section>
      </section>
      {busy && <p role="status">{t('Menyiapkan ruang ceritamu…')}</p>}
      {error && <p className="inline-error" role="alert">{errorText(error)}</p>}
      <section className="start-steps" aria-labelledby="steps-title"><div className="section-heading"><span>01 / 03</span><h2 id="steps-title">{t('Dari ide sampai siap dibagikan')}</h2></div>
        <ol>{[['Pilih tampilan', 'Pilih aplikasi dan adegan. Chat, profil, panggilan, atau layar buatanmu sendiri.'],
          ['Susun cerita', 'Tulis pesan, tambahkan foto atau stiker, lalu simpan adegan berikutnya sebagai slide baru.'],
          ['Unduh slide', 'Ambil layar penuh, fokus ke keyboard, atau gabungkan beberapa adegan menjadi kolase.']].map(([title, detail], index) => <li key={title}><span className="step-number">0{index + 1}</span><div><strong>{t(title)}</strong><p>{t(detail)}</p></div></li>)}</ol>
      </section>
      <section className="start-categories" aria-labelledby="categories-title"><div className="category-intro"><h2 id="categories-title">{t('Banyak cara untuk bercerita.')}</h2><p>{t('Mulai dari adegan yang kamu bayangkan.')}</p></div>
        <div>{categories.map(([title, detail, index], n) => <button key={title} onClick={() => chooseDemo(index)}><span className="category-number">0{n + 1}</span><span><strong>{t(title)}</strong><span>{t(detail)}</span></span><ArrowRight size={19} /></button>)}</div>
      </section>
      <section className="recent-projects" aria-labelledby="recent-title"><h2 id="recent-title">{t('Cerita di browser ini')}</h2>
        {last && <button className="resume-story" disabled={busy} onClick={() => run(() => openProject(last.id))}><FolderOpen size={23} /><span><small>{t('Lanjutkan cerita')}</small><strong>{last.title}</strong></span><ArrowRight size={20} /></button>}
        {recentProjects.length ? <div>{recentProjects.filter(item => item.id !== last?.id).map(item => <button key={item.id} disabled={busy} onClick={() => run(() => openProject(item.id))}><FolderOpen size={18} /><span><strong>{item.title}</strong><small>{t('{n} slide', { n: item.slides.length })}</small></span></button>)}</div>
          : <div className="empty-stories"><strong>{t('Belum ada cerita tersimpan.')}</strong><p>{t('Mulai cerita pertamamu atau coba contoh untuk melihat cara kerjanya.')}</p></div>}
        <p className="field-hint">{t('Simpan file cerita untuk memindahkan atau mencadangkan hasil editmu.')}</p>
      </section>
    </div><PublicFooter />
    <input ref={fileRef} type="file" accept=".aujson,.json,application/json" className="visually-hidden" aria-label={t('Buka file cerita')} onChange={loadFile} />
  </main>;
}

export function InfoPage({ about = false }) {
  const { t } = useUI();
  const items = about ? [
    ['Auverie', 'Auverie adalah ruang membuat cerita fiksi melalui layar aplikasi. Semua pesan, panggilan, media, dan interaksi disusun sebagai bagian cerita lokal.'],
    ['Penyimpanan dan privasi', 'Auverie tidak memerlukan akun dan tidak mengirim cerita ke server. Gambar dari tautan luar dimuat dari penyedianya. Unggah berkas agar aset tersimpan bersama file cerita.'],
    ['Tentang tampilan aplikasi', 'Mockup mengikuti acuan yang diperiksa saat pengembangan. Tampilan aplikasi dapat berbeda menurut versi dan perangkat. Font Apple memakai font sistem saat tersedia; di Windows tampilannya memakai pendekatan Inter. Hasil berupa gambar statis.']
  ] : [
    ['1. Pilih layar', 'Di daftar Slide, pilih Tambah slide lalu tentukan aplikasi dan adegannya. Pengaturan HP mengubah perangkat serta tema layar.'],
    ['2. Isi ceritamu', 'Gunakan Coba layar HP untuk mengetik dan mengirim konten cerita. Pilih Ubah isi lalu ketuk elemen untuk membuka pengaturannya.'],
    ['3. Simpan dan bagikan', 'Lanjutkan ke slide baru membuat salinan adegan. Pilih Unduh gambar untuk PNG atau semua slide dalam ZIP.'],
    ['Apa bedanya gambar dan file cerita?', 'PNG adalah gambar yang bisa langsung dibagikan. ZIP berisi gambar semua slide. File .aujson menyimpan isi cerita, tokoh, dan pengaturan agar bisa dibuka dan diedit lagi di Auverie.'],
    ['Di mana ceritaku disimpan?', 'Perubahan disimpan otomatis di browser dan perangkat ini. File cerita menjadi cadanganmu jika pindah perangkat, menghapus data browser, atau memakai mode privat.'],
    ['Bagaimana menampilkan keyboard atau stiker?', 'Pada panel Edit, buka Kolom ketik dan keyboard. Aktifkan Keyboard terbuka atau isi Draft belum dikirim. Untuk stiker, pilih jenis konten Stiker lalu unggah gambar atau pilih koleksi.'],
    ['Bagaimana mengambil setengah layar?', 'Buka Hasil gambar lalu pilih Setengah atas, Setengah bawah, atau Fokus keyboard. Lihat hasilnya sebelum mengunduh. Potongan tidak mengubah baris teks.']
  ];
  return <main className="project-start"><PublicHeader /><article className="info-page"><a className="text-button" href="#/">{t('Kembali ke beranda')}</a><h1>{t(about ? 'Tentang & penyimpanan' : 'Panduan singkat')}</h1>
    {items.map(([title, text]) => <section key={title}><h2>{t(title)}</h2><p>{t(text)}</p></section>)}
  </article><PublicFooter /></main>;
}
