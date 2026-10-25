<div align="center">

# Ticketing TULT

**Sistem Pelaporan Kerusakan Fasilitas Gedung Telkom University Landmark Tower (TULT)**

Tugas Besar Mata Kuliah **Perancangan dan Pemrograman Web**
S1 Rekayasa Perangkat Lunak — Telkom University

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Status](https://img.shields.io/badge/Status-Dalam_Pengembangan-orange)

</div>

---

## Tentang Proyek

**Ticketing TULT** adalah aplikasi web berbasis sistem tiket (*ticketing*) yang memudahkan civitas akademika untuk melaporkan kerusakan fasilitas di Gedung TULT, seperti AC mati, proyektor rusak, atau fasilitas ruangan lainnya.

Setiap laporan yang masuk akan tercatat sebagai tiket sehingga proses penanganannya dapat dipantau secara transparan, terstruktur, dan terdokumentasi dengan baik.

### Latar Belakang

Pelaporan kerusakan fasilitas yang dilakukan secara manual atau melalui pesan singkat sering kali sulit dilacak, tidak terdokumentasi, dan lambat ditindaklanjuti. Aplikasi ini dibuat untuk menjawab masalah tersebut dengan menyediakan satu platform terpusat untuk membuat, memantau, dan melihat riwayat laporan.

---

## Fitur Utama

- **Beranda Laporan Publik** — menampilkan daftar keluhan fasilitas gedung TULT dari seluruh pengguna.
- **Buat Laporan** — formulir pelaporan dengan judul, pilihan lantai, pilihan ruangan, deskripsi detail, dan unggah bukti kerusakan berupa gambar.
- **Dropdown Bertingkat** — pilihan ruangan menyesuaikan lantai yang dipilih.
- **Riwayat Tiket** — melihat seluruh tiket yang pernah dibuat.
- **Detail Tiket** — melihat informasi lengkap dan status dari sebuah tiket.
- **Profil Pengguna** — mengelola informasi akun pengguna.

> **Catatan:** Proyek ini masih dalam tahap pengembangan. Beberapa fitur mungkin belum sepenuhnya tersedia.

---

## Teknologi yang Digunakan

| Teknologi | Kegunaan |
| --- | --- |
| [React](https://react.dev/) | Library untuk membangun antarmuka pengguna |
| [Vite](https://vitejs.dev/) | Build tool dan development server yang cepat |
| [Tailwind CSS](https://tailwindcss.com/) | Framework CSS *utility-first* untuk styling |
| [React Router](https://reactrouter.com/) | Pengaturan navigasi antarhalaman |

---

## Instalasi dan Menjalankan Proyek

### Prasyarat

Pastikan perangkat Anda sudah terpasang:

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- npm (sudah termasuk bersama Node.js) atau yarn/pnpm
- Git

### Langkah-langkah

1. **Clone repositori**

   ```bash
   git clone https://github.com/<username>/<nama-repo>.git
   cd <nama-repo>
   ```

2. **Install dependensi**

   ```bash
   npm install
   npm install react-router-dom lucide-react
   npm install tailwindcss @tailwindcss/vite
   ```

3. **Jalankan development server**

   ```bash
   npm run dev
   ```

4. **Buka di browser**

   Aplikasi dapat diakses melalui `http://localhost:5173`.

### Perintah yang Tersedia

| Perintah | Deskripsi |
| --- | --- |
| `npm run dev` | Menjalankan aplikasi dalam mode pengembangan |
| `npm run build` | Membuat build produksi ke folder `dist` |
| `npm run preview` | Melihat hasil build produksi secara lokal |
| `npm run lint` | Memeriksa kualitas kode dengan ESLint |

---

## Daftar Halaman

| Halaman | Rute | Deskripsi |
| --- | --- | --- |
| Beranda | `/` | Daftar laporan publik dari seluruh pengguna |
| Buat Laporan | `/create` | Formulir pembuatan laporan kerusakan fasilitas |
| Riwayat Tiket | `/history` | Riwayat tiket yang dibuat pengguna |
| Detail Tiket | `/ticket` | Detail dan status sebuah tiket |
| Profil | `/profile` | Informasi dan pengaturan akun |

---

## Anggota Kelompok

**Kelompok:** `2tbnh`
**Kelas:** `SE-48-02`
**Dosen Pengampu:** `ARIO HARRY PRAYOGO`

| No | Nama Lengkap | Peran |
| :-: | --- | --- |
| 1 | `Muhammad Farhan Abdillah` | ` ` |
| 2 | `Nuraini Nafisa Zahira` | `Membuat Halaman Detail Tiket` |
| 3 | `Wawan Saputra` | `Membuat Halaman Membuat Tiket/Laporan` |
| 4 | `Moh. Dzaki Ayatillah` | `Membuat Layout dan Halaman Profil` |
| 5 | `Keisya Salsyabila Putri Wibowo` | `Membuat Halaman Riwayat Tiket` |

---

## Lisensi

Proyek ini dibuat untuk keperluan akademik pada mata kuliah **Perancangan dan Pemrograman Web**, Program Studi S1 Rekayasa Perangkat Lunak, **Telkom University**.

---

<div align="center">

Dibuat dengan ❤️ oleh Kelompok `2tbnh` — Telkom University

</div>
