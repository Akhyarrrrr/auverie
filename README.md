# AU Studio

Pembuat cerita AU dalam bentuk layar aplikasi HP. Susun adegan, atur tokoh dan tampilan, lalu unduh PNG atau ZIP. Proyek disimpan di browser dan dapat dicadangkan sebagai `.aujson`.

## Menjalankan

Jalankan dari direktori proyek dengan Node.js dan npm:

```powershell
npm ci
npm run dev
```

Buka **http://localhost:5173/**. Port 5173 bersifat tetap; server akan memberi error jika port sudah digunakan. Tidak diperlukan akun, backend, atau berkas `.env`.

```powershell
npm run build
npm run preview
```

Build ditulis ke `dist/`. `preview` menyediakan hasil build untuk pemeriksaan lokal. Konfigurasi hosting statis Vercel ada di `vercel.json`.

## Membuat cerita

1. Pilih **Buat cerita**, **Coba contoh**, **Impor proyek**, atau buka proyek terbaru. Pergantian contoh HP di beranda tidak membuat proyek.
2. Tambahkan slide, pilih aplikasi dan jenis layarnya. Gunakan **Gunakan HP** untuk menyusun kejadian, atau **Edit elemen** untuk memilih bagian layar melalui pratinjau.
3. Isi konten melalui **Mode mudah**. Buka **Lanjut** untuk perangkat, tema, warna, keyboard, overlay, posisi percakapan, dan detail elemen.
4. Pilih **Tangkap adegan baru** sebelum melanjutkan cerita. Adegan baru merupakan salinan; perubahan selanjutnya tidak mengubah adegan sebelumnya.
5. Atur **Potongan layar** atau susun salinan adegan dalam **Kolase**. Periksa **Hasil unduhan**, lalu pilih **Ekspor** untuk PNG slide aktif atau ZIP semua slide.

Pada HP, navigasi editor dibagi menjadi **Slide · Pratinjau · Edit**. Undo/redo tersedia melalui tombol editor dan pintasan keyboard.

## Format dan konten

Katalog saat ini berisi **105 layar dari 12 keluarga aplikasi**, ditambah layar kunci, aplikasi bebas, dan kolase:

| Aplikasi | Contoh adegan |
|---|---|
| WhatsApp | Chat pribadi/grup, daftar chat, info, status, panggilan, media |
| Instagram | DM, inbox, profil, feed/post, komentar, story, Notes, Reels diam, Instants |
| Facebook / Messenger | Feed, profil, grup, komentar, album, story, chat, panggilan |
| X | Post/thread, feed, profil, balasan, notifikasi, inbox, X Chat |
| iMessage / SMS, Telegram, LINE | Chat, daftar percakapan, info, lampiran; kanal pada Telegram |
| TikTok | Poster video/foto, profil, komentar, inbox, DM, notifikasi |
| Spotify | Now Playing, playlist/album, profil, antrean, lirik, berbagi lagu, Messages |
| Catatan / Telepon | Narasi, daftar catatan, kontak, riwayat dan keadaan panggilan |
| Layar kunci / Aplikasi bebas | Notifikasi dan musik; latar serta blok yang dapat disusun sendiri |

Jenis pesan mengikuti dukungan masing-masing aplikasi. Pilihannya mencakup teks, foto, album, stiker transparan, GIF diam, poster video, voice note, dokumen, kontak, lokasi, tautan, polling, musik, dan kartu postingan. Media, audio, video, dan panggilan adalah **keadaan cerita statis**.

Profil perangkat menyediakan iPhone dan Android. Tema terang/gelap, warna, draft, kursor, keyboard iPhone/Gboard/Samsung, serta tray dan menu disimpan per adegan. Editor stiker menyediakan crop, kuas hapus, siluet, outline, ukuran, dan koleksi pengguna.

Daftar lengkap layar dan jenis konten berada di [`sceneCatalog.js`](src/data/sceneCatalog.js).

## Penyimpanan dan kompatibilitas

- Autosave memakai IndexedDB pada browser dan alamat situs yang sedang digunakan. Status **Menyimpan**, **Tersimpan**, atau kegagalan ditampilkan di editor. Browser/alamat lain memiliki penyimpanan terpisah.
- Pengaturan perangkat dan perubahan tokoh memperbarui slide aktif serta nilai untuk adegan berikutnya. Slide yang sudah ditangkap menyimpan salinan identitas dan pengaturannya sendiri.
- Gunakan **Proyek → Simpan cadangan .aujson** untuk memindahkan atau mencadangkan cerita. Impor selalu membuat salinan dengan identitas baru.
- Skema proyek saat ini versi **3**. Proyek lama dimigrasikan; delapan format WhatsApp, X, dan Instagram lama tetap memakai renderer versi **2**. **Salin ke tampilan terbaru** membuat slide baru dengan renderer versi 3.
- Gambar unggahan disimpan sebagai data URL. Cadangan mencoba menyematkan gambar dari URL; aset yang tidak dapat dibaca akan dilaporkan. Ganti dengan unggahan agar cadangan tidak bergantung pada tautan luar.
- PNG dan pratinjau hasil memakai renderer yang sama. Ekspor menunggu font dan gambar, menerapkan crop tersimpan, dan memeriksa konten yang terpotong tanpa sengaja. Sisi terpanjang hasil dibatasi 4096 px.

## Pengujian

```powershell
npm test
npm run build
```

Untuk menguji alur browser, jalankan server pada terminal lain, kemudian:

```powershell
npm run test:browser
node scripts/visual-report.mjs
```

Uji browser memakai Playwright dan Sharp dari runtime Codex yang tersedia. Pada lingkungan lain, set `AU_RUNTIME_MODULES` ke direktori `node_modules` yang menyediakan keduanya; tidak perlu menambahkannya ke dependency aplikasi. `AU_BASE_URL` mengubah alamat server. Windows memakai Edge; sistem lain memerlukan Chromium Playwright.

Bukti gambar, unduhan, dan `report.json` dibuat di `docs/qa/`, yang diabaikan Git. Pengujian memakai konteks browser terpisah dan tidak mengubah proyek di browser pengguna.

## Dokumentasi

- [Struktur kode, data, dan renderer](docs/architecture.md)
- [Acuan visual yang dibekukan pada 1 Oktober 2026](docs/visual-reference-2026-10-01.md)
- [Perbandingan visual lokal](docs/visual-comparison-2026-10-01.html)
- [Hasil pengujian 2 Oktober 2026](docs/qa-2026-10-02.md)
- [Catatan pembersihan 2 Oktober 2026](docs/cleanup-2026-10-02.md)

Kemiripan dinilai terhadap acuan yang tercatat. Font Apple memakai font sistem saat tersedia; Windows memakai Inter dan Android memakai Roboto. Font serta emoji, varian OEM, dan layar yang belum memiliki pasangan screenshot native mempunyai batas verifikasi yang dijelaskan dalam dokumen acuan. Font lokal dan lisensinya berada di `public/fonts/`.
