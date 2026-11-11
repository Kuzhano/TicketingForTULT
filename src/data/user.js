// Data profil mahasiswa (sementara statis, nanti bisa diganti data dari API/SSO).
export const user = {
  name: 'Shiki',
  nim: '103022400090',
  prodi: 'S1 Rekayasa Perangkat Lunak',
  fakultas: 'Fakultas Informatika (FIF)',
  email: 'mohammaddzaki@student.telkomuniversity.ac.id',
  role: 'Mahasiswa',
  totalLaporan: 4,
  laporanSelesai: 3,
  terakhirMasuk: 'Hari ini, 09:42 WIB via SSO Telkom',
};

// "Dalam Proses" selalu dihitung, tidak ditulis manual.
export function hitungDalamProses({ totalLaporan, laporanSelesai }) {
  return Math.max(0, totalLaporan - laporanSelesai);
}