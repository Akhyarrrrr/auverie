# AU Studio (AURA) - Alternate Universe Creator Workstation

> **Platform all-in-one bagi pembuat cerita AU (Alternate Universe) di TikTok, X (Twitter), dan Instagram.**  
> Susun jalan cerita, sinkronkan karakter & status HP secara otomatis, dan ekspor massal (*batch export*) dalam format gambar resolusi tinggi tanpa perlu screenshot satu per satu!

---

## 🌟 Fitur Utama

1. **Central Character Roster (Karakter Terpusat)**:
   - Kelola profil karakter (nama tampilan, `@username`, foto profil avatar, status centang biru terverifikasi).
   - **Sekali ganti foto avatar di sidebar, semua mockup WhatsApp, Twitter/X, dan Instagram otomatis ikut berubah!**
2. **Device State Synchronization**:
   - Jam HP, persentase baterai, status charging, indikator jaringan (5G/WiFi), sinyal, dan tema (Dark/Light) tersinkronisasi otomatis antar-slide.
3. **High-Fidelity Platform Mockups**:
   - **WhatsApp**: Chat 1-on-1, Group Chat dengan header nama, Voice Note dengan animasi waveform, status centang dua biru, lampiran foto, dan reaksi emoji (❤️, 😂, 👍, dll.).
   - **Twitter / X**: Single Tweet, Thread balasan berantai (*reply chain*), tanda verifikasi centang biru, metrik likes/reposts/bookmarks/views, dan tag perangkat ("Twitter for iPhone").
   - **Instagram**: Direct Message (DM) dengan bubble gradient dan tanda *Seen*, serta Feed Post dengan foto dan caption.
   - **iPhone Lockscreen**: Tampilan layar kunci iOS dengan jam besar, tanggal, dan notifikasi menumpuk (*stacked notifications*) dari berbagai aplikasi.
4. **Quick Script Converter & Auto-Paging**:
   - Ketik naskah dialog cepat dengan format `Nama: Pesan` (atau `[vn:0:30]` untuk Voice Note).
   - Fitur **Smart Auto-Paging** otomatis memecah dialog panjang menjadi beberapa slide agar pas di layar HP tanpa terpotong!
5. **High-Res Batch Exporter**:
   - **Ekspor Semua (.ZIP)**: Render seluruh slide cerita berurutan (`01_lockscreen.png`, `02_wa_chat.png`, dst.) dengan resolusi tajam (2x Retina scale).
   - **Salin Gambar (1-Click Clipboard)**: Salin mockup langsung ke clipboard untuk langsung di-paste ke Canva atau Twitter.
   - **Unduh PNG**: Simpan gambar slide aktif satuan.
6. **Simpan & Buka Berkas (.aujson)**:
   - Data otomatis tersimpan di IndexedDB browser Anda.
   - Ekspor berkas `.aujson` untuk backup atau bertukar cerita dengan kreator lain.

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Install dependensi
npm install

# 2. Jalankan development server
npm run dev

# 3. Build untuk produksi
npm run build
```

---

## 🌐 Cara Deploy ke GitHub & Vercel

### Langkah 1: Push ke GitHub
```bash
git init
git add .
git commit -m "feat: initial commit AU Studio"
git branch -M main

# Buat repositori baru di GitHub (misal: username/au-studio), lalu sambungkan:
git remote add origin https://github.com/USERNAME/au-studio.git
git push -u origin main
```

### Langkah 2: Deploy ke Vercel (Gratis & Cepat)
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** -> **"Project"**.
3. Pilih repositori **au-studio** yang baru saja di-push.
4. Vercel akan otomatis mendeteksi framework **Vite**.
5. Klik **"Deploy"**. Dalam ~30 detik web AU Studio Anda sudah live dan memiliki URL publik (misal: `https://au-studio.vercel.app`)!
