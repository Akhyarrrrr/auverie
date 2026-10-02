# AU*v*erie

Ceritamu, layar demi layar. Buat cerita AU melalui percakapan, postingan, notifikasi, panggilan, dan kolase layar HP. Langsung menulis tanpa akun.

## Menggunakan AU*v*erie

1. Pilih **Buat cerita**, **Coba contoh**, atau **Buka file cerita** di beranda. Demo beranda hanya menampilkan contoh; pergantiannya tidak menyimpan cerita baru.
2. Tambahkan slide, lalu pilih aplikasi dan adegan. **Coba layar HP** digunakan untuk mengetik, mengirim konten cerita, serta membuka layar dan menu aplikasi.
3. Pilih **Ubah isi** untuk mengedit melalui pratinjau. Panel Edit dibagi menjadi **Isi cerita**, **Tampilan layar**, dan **Hasil gambar**. Mode **Lanjut** membuka detail tambahan.
4. **Lanjutkan ke slide baru** membuat salinan adegan. Perubahan berikutnya tidak mengubah slide sebelumnya.
5. Atur layar penuh, setengah layar, fokus keyboard, crop manual, atau kolase. Periksa **Lihat hasil**, lalu **Unduh gambar** sebagai PNG atau ZIP seluruh slide.

Di HP, gunakan **Slide · Pratinjau · Edit**. Panduan awal dapat dilewati dan dibuka kembali melalui **Cerita → Panduan singkat**. Bantuan lengkap tersedia di aplikasi.

### Bahasa dan tema

Bahasa antarmuka secara bawaan adalah Indonesia. Tombol **ID / EN** mengubah tombol dan bantuan; isi cerita serta nama tokoh tetap seperti yang ditulis. Bahasa label dalam mockup diatur terpisah melalui **Bahasa layar HP**.

Tombol matahari/bulan mengubah tema editor. Tema terang/gelap aplikasi dalam cerita diatur per adegan melalui **Tampilan layar**. Warna, wallpaper, perangkat, draft, keyboard iPhone/Gboard/Samsung, dan detail elemen dapat disesuaikan.

### Cerita tersimpan dan file cadangan

- Autosave menyimpan cerita di IndexedDB browser dan alamat situs yang digunakan. Status penyimpanan terlihat di editor. Cerita pada browser, perangkat, atau alamat situs lain memiliki penyimpanan terpisah.
- **Simpan file cerita** mengunduh berkas `.aujson`. Berkas ini berisi cerita, tokoh, aset, dan pengaturan untuk melanjutkan edit. Ini berbeda dari PNG, yang merupakan gambar siap dibagikan, atau ZIP, yang berisi gambar seluruh slide.
- **Buka file cerita** selalu membuat salinan baru. Simpan cadangan sebelum pindah perangkat, membersihkan data browser, atau pindah dari localhost ke situs online.
- Proyek lama tetap kompatibel. Format lama WhatsApp, X, dan Instagram mempertahankan renderer yang tersimpan; **Salin ke tampilan terbaru** membuat versi baru tanpa mengganti slide lama.
- Gambar unggahan disimpan bersama cerita. Cadangan mencoba menyematkan gambar dari tautan luar dan melaporkan yang gagal. Unggah gambar tersebut sebagai berkas agar tidak bergantung pada tautan luar.

## Format layar

WhatsApp, Instagram, Facebook, Messenger, X, iMessage/SMS, Telegram, LINE, TikTok, Spotify, Catatan, dan Telepon tersedia sebagai adegan. Layar kunci, Aplikasi bebas, dan Kolase menyediakan komposisi tambahan. Katalog lengkap berada di [`src/data/sceneCatalog.js`](src/data/sceneCatalog.js).

Konten mencakup teks, foto, album, stiker transparan, GIF diam, poster video, voice note, dokumen, kontak, lokasi, tautan, polling, musik, reaksi, draft, dan keadaan panggilan sesuai aplikasi. Keluaran berupa **gambar statis**; pesan dan interaksi tidak dikirim ke akun aplikasi asli.

## Menjalankan secara lokal

Gunakan Node.js 22 atau lebih baru dan npm:

```sh
npm ci
npm run dev
```

Buka [localhost:5173](http://localhost:5173). Port 5173 tetap; tutup server lain yang memakai port tersebut. Tidak diperlukan backend, login, atau variabel lingkungan.

```sh
npm run build
npm run preview
```

Build ditulis ke `dist/`. `npm run build` menjalankan pemeriksaan kecil untuk terjemahan dan validasi impor, lalu membuat build produksi. `preview` menyediakan hasil build di [localhost:4173](http://localhost:4173).

## Persiapan Vercel

Import repository [Akhyarrrrr/auverie](https://github.com/Akhyarrrrr/auverie) dan gunakan branch produksi **main**. Pengaturan sudah berada di `vercel.json`:

| Pengaturan | Nilai |
|---|---|
| Framework | Vite |
| Root directory | Direktori repository |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | 22.x |
| Environment variables | Tidak diperlukan |

Rewrite SPA disertakan. Navigasi aplikasi memakai hash route, seperti `#/editor` dan `#/help`. Data browser tidak otomatis berpindah ke domain baru; pindahkan melalui **Simpan file cerita** dan **Buka file cerita**.

## Aset dan batas tampilan

Font dan lisensinya berada di `public/fonts/`; asal serta checksum aset font tercatat dalam `manifest.json`. Font Apple memakai font sistem ketika tersedia, Inter sebagai pendekatan di Windows, dan Roboto untuk Android. SF Pro tidak dibundel.

Mockup mengikuti acuan yang diperiksa pada Oktober 2026. Versi aplikasi, emoji, sistem operasi, dan font dapat menghasilkan perbedaan visual. Di Windows, penghalusan tepi huruf pada PNG 1× dapat berbeda dari screenshot browser walau ukuran, baris, dan posisi sama. Pratinjau hasil dan ekspor memakai renderer yang sama. Font dan gambar ditunggu sebelum ekspor, dengan sisi terpanjang maksimal 4096 piksel.

AU*v*erie tidak memerlukan akun atau mengirim cerita ke server. Aset dari URL dimuat dari penyedianya. Nama aplikasi digunakan untuk mengidentifikasi jenis mockup; AU*v*erie tidak berafiliasi dengan pemilik aplikasi tersebut.

## English

AU*v*erie creates AU stories as phone app scenes. Choose an app and screen, write your story, save the next moment as a new slide, and download full screens, crops, or collages. No account is required.

**ID / EN** changes the interface language without translating your story. The editor theme and phone screen theme are separate. **Save a story file** creates an editable `.aujson` backup; **Download images** creates PNG or ZIP files. Stories autosave locally in the current browser and site address. Use a story file to move to another device or domain.

Run `npm ci` and `npm run dev` locally. For production, run `npm run build`; `dist/` and the included `vercel.json` are ready for a Vercel import using **main**. Scenes, video posters, audio, and calls export as static images.
