<div align="center">

# Ticketing TULT

**Aplikasi pelaporan dan pemantauan kerusakan fasilitas Gedung Telkom University Landmark Tower (TULT)**

Proyek Tugas Besar Mata Kuliah **Perancangan dan Pemrograman Web**  
S1 Rekayasa Perangkat Lunak — Telkom University

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Status](https://img.shields.io/badge/Status-Dalam_Pengembangan-orange)

</div>

---

## Tentang Proyek

**Ticketing TULT** adalah aplikasi web untuk melaporkan kerusakan fasilitas dan memantau penanganan laporan sebagai tiket. Aplikasi menyediakan alur antarmuka untuk tiga peran: mahasiswa, teknisi, dan admin.

Saat ini aplikasi menggunakan data JSON sebagai data awal dan `localStorage` sebagai penyimpanan simulasi di browser. Aplikasi belum terhubung ke backend atau database bersama.

## Fitur

### Mahasiswa

- Login menggunakan akun contoh yang tersedia di `src/data/users.json`.
- Melihat daftar tiket terbaru pada Dashboard atau memfilter tiket berdasarkan bulan dan tahun.
- Membuat laporan dengan judul, lantai, teks ruangan bebas, deskripsi, serta foto bukti wajib.
- Foto bukti menerima JPG, PNG, atau WebP, diperkecil sebelum disimpan, dan ditampilkan pada detail tiket.
- Melihat dan mencari riwayat tiket milik akun mahasiswa yang sedang aktif.
- Membuka detail tiket dan melihat status penanganannya.

### Teknisi

- Melihat tiket yang ditugaskan kepada akun teknisi pada halaman tugas perbaikan.
- Membuka detail tugas, menambahkan catatan dan dokumentasi foto hasil perbaikan.
- Mengubah status tiket dari **Diproses** menjadi **Selesai** setelah dokumentasi disimpan, atau membuka kembali tiket yang selesai.

### Admin

- Melihat ringkasan jumlah tiket berdasarkan status, bulan, dan tahun pada Dashboard.
- Menugaskan tiket kepada teknisi melalui halaman Penugasan Teknisi.

### Umum

- Profil menampilkan informasi dan statistik sesuai peran, serta menyediakan alur logout.
- Halaman data menyediakan status loading, pesan error, dan opsi coba lagi pada proses pemuatan tertentu.
- Layout responsif untuk desktop dan perangkat mobile.

## Teknologi

| Teknologi | Kegunaan |
| --- | --- |
| [React 19](https://react.dev/) | Antarmuka dan komponen |
| [Vite 8](https://vite.dev/) | Development server dan build |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling antarmuka |
| [React Router 7](https://reactrouter.com/) | Routing aplikasi |
| [Lucide React](https://lucide.dev/) | Ikon |

---

## Menjalankan Aplikasi

### Prasyarat

- Node.js yang didukung Vite 8 (Node.js `20.19+` atau `22.12+`).
- npm.
- Git.

### Instalasi

```bash
git clone https://github.com/Kuzhano/TicketingForTULT.git
cd TicketingForTULT
npm install
npm run dev
```

Buka URL yang ditampilkan Vite di terminal (umumnya `http://localhost:5173`).

### Perintah

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan development server |
| `npm run build` | Membuat build produksi ke `dist/` |
| `npm run preview` | Menjalankan preview build produksi |
| `npm run lint` | Memeriksa kode dengan ESLint |

---

## Halaman dan Rute

| Halaman | Rute | Akses / Kegunaan |
| --- | --- | --- |
| Login | `/login` | Masuk menggunakan akun demo mahasiswa, teknisi, atau admin |
| Dashboard | `/` | Dashboard ringkasan admin; daftar tiket terbaru untuk peran selain admin |
| Buat Laporan | `/create` | Form pembuatan tiket untuk mahasiswa |
| Riwayat Tiket | `/history` | Riwayat laporan mahasiswa yang sedang aktif |
| Detail Tiket | `/ticket/:id` | Detail tiket dan status |
| Profil | `/profile` | Informasi akun, statistik, dan logout |
| Tugas Perbaikan | `/teknisi` | Daftar tiket teknisi |
| Detail Tugas | `/teknisi/:id` | Dokumentasi pekerjaan dan pembaruan status teknisi |
| Penugasan Teknisi | `/penugasan` | Penugasan tiket oleh admin |

---

## Data dan Penyimpanan

### Data awal

- `src/data/users.json` — akun demo dan perannya.
- `src/data/tickets.json` — data awal tiket; memuat tiket contoh dari tahun 2025 dan 2026.
- `src/data/claimedTickets.json` — contoh penugasan tiket kepada teknisi.

### Simulasi penyimpanan browser

`src/utils/api.js` menyediakan helper `fetchData` untuk membaca data JSON dan `postData` untuk mensimulasikan pembuatan tiket. Tiket baru tidak ditulis kembali ke file JSON; tiket dan perubahan operasional disimpan pada browser melalui `localStorage`.

Key `localStorage` yang dipakai aplikasi:

| Key | Isi |
| --- | --- |
| `activeUser` | Akun yang sedang digunakan |
| `tult_tickets` | Tiket yang dibuat melalui aplikasi |
| `tult_assignments` | Penugasan tiket oleh admin |
| `tult_ticket_status` | Perubahan status tiket oleh admin/teknisi |
| `tult_ticket_docs` | Catatan dan metadata dokumentasi teknisi |

Data pada `localStorage` hanya tersedia di browser dan origin yang menyimpannya. Data tidak dibagikan antarperangkat atau pengguna browser. Foto bukti laporan disimpan sebagai data gambar di data tiket lokal; dokumentasi foto hasil perbaikan pada implementasi saat ini menyimpan nama file, bukan mengunggah berkas ke server.

> **Catatan:** Akun pada `users.json` dan seluruh mekanisme penyimpanan merupakan data demo, bukan autentikasi atau penyimpanan produksi. Jangan menggunakan kredensial nyata.

---

## Struktur Proyek

```text
src/
├── App.jsx                 # Deklarasi rute
├── components/             # Layout, badge status, loading/error, toast
├── data/                   # Data awal pengguna, tiket, dan penugasan
├── hooks/                  # Hook pengelolaan data tiket
├── pages/                  # Halaman mahasiswa, teknisi, dan admin
├── utils/api.js            # Helper fetch dan mock penyimpanan tiket
├── index.css               # Import Tailwind CSS
└── main.jsx                # Entry point React
```

---

## Anggota Kelompok

**Kelompok:** `2tbnh`  
**Kelas:** `SE-48-02`  
**Dosen Pengampu:** `ARIO HARRY PRAYOGO`

| No | Nama Lengkap |
| :-: | --- |
| 1 | `Muhammad Farhan Abdillah` |
| 2 | `Nuraini Nafisa Zahira` |
| 3 | `Wawan Saputra` |
| 4 | `Moh. Dzaki Ayatillah` |
| 5 | `Keisya Salsyabila Putri Wibowo` |

---

## Lisensi

Proyek ini dibuat untuk keperluan akademik pada mata kuliah **Perancangan dan Pemrograman Web**, Program Studi S1 Rekayasa Perangkat Lunak, **Telkom University**.

<div align="center">

Dibuat dengan ❤️ oleh Kelompok `2tbnh` — Telkom University

</div>
