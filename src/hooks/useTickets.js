
import { useState, useEffect, useCallback } from 'react';
import { fetchData } from '../utils/api';

const KUNCI_TIKET = 'tult_tickets';
const KUNCI_TIKET_LAMA = 'tickets';
const KUNCI_STATUS = 'tult_ticket_status';
const KUNCI_STATUS_LAMA = 'statusTiket';
const KUNCI_ALASAN_PENOLAKAN = 'tult_ticket_rejection_reasons';

function bacaStorage(kunci, nilaiAwal) {
  try {
    return JSON.parse(localStorage.getItem(kunci)) ?? nilaiAwal;
  } catch {
    return nilaiAwal;
  }
}

function hapusDuplikat(daftar) {
  const data = new Map();

  daftar.forEach((tiket) => {
    if (!tiket || tiket.id === undefined || tiket.id === null) {
      return;
    }

    data.set(String(tiket.id), tiket);
  });

  return [...data.values()];
}

export default function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const dataApi = await fetchData('tickets');

      if (!Array.isArray(dataApi)) {
        throw new Error('Format data tiket tidak valid.');
      }

      const dataLokal = bacaStorage(KUNCI_TIKET, []);
      const dataLama = bacaStorage(KUNCI_TIKET_LAMA, []);

      const statusTeknisi = bacaStorage(KUNCI_STATUS, {});
      const statusLama = bacaStorage(KUNCI_STATUS_LAMA, {});
      const alasanPenolakan = bacaStorage(KUNCI_ALASAN_PENOLAKAN, {});

      const semuaTiket = hapusDuplikat([
        ...dataApi,
        ...(Array.isArray(dataLama) ? dataLama : []),
        ...(Array.isArray(dataLokal) ? dataLokal : []),
      ]);

      const hasil = semuaTiket.map((tiket) => {
        const id = String(tiket.id);

        return {
          ...tiket,
          status:
            statusTeknisi[id] ||
            statusLama[id] ||
            tiket.status ||
            'Menunggu',
          alasanPenolakan: alasanPenolakan[id] || '',
        };
      });

      setTickets(hasil);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat memuat data tiket.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();

    const saatStorageBerubah = (event) => {
      if (
        event.key === null ||
        [
          KUNCI_TIKET,
          KUNCI_TIKET_LAMA,
          KUNCI_STATUS,
          KUNCI_STATUS_LAMA,
          KUNCI_ALASAN_PENOLAKAN,
        ].includes(event.key)
      ) {
        reload();
      }
    };

    window.addEventListener('storage', saatStorageBerubah);

    return () => {
      window.removeEventListener('storage', saatStorageBerubah);
    };
  }, [reload]);

  function ubahStatus(id, statusBaru, alasanPenolakan = '') {
    const transisiStatus = {
      Menunggu: ['Diproses'],
      Diproses: ['Selesai'],
      Selesai: ['Tervalidasi', 'Diproses'],
    };

    const tiket = tickets.find(
      (item) => String(item.id) === String(id)
    );

    if (
      !tiket ||
      !transisiStatus[tiket.status]?.includes(statusBaru) ||
      (tiket.status === 'Selesai' &&
        statusBaru === 'Diproses' &&
        !alasanPenolakan.trim())
    ) {
      return false;
    }

    try {
      const statusTersimpan = bacaStorage(KUNCI_STATUS, {});
      const alasanTersimpan = bacaStorage(KUNCI_ALASAN_PENOLAKAN, {});

      localStorage.setItem(
        KUNCI_STATUS,
        JSON.stringify({
          ...statusTersimpan,
          [String(id)]: statusBaru,
        })
      );
      if (statusBaru === 'Diproses' && tiket.status === 'Selesai') {
        alasanTersimpan[String(id)] = alasanPenolakan.trim();
      } else {
        delete alasanTersimpan[String(id)];
      }
      localStorage.setItem(KUNCI_ALASAN_PENOLAKAN, JSON.stringify(alasanTersimpan));

      setTickets((sebelumnya) =>
        sebelumnya.map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                status: statusBaru,
                alasanPenolakan:
                  statusBaru === 'Diproses' && tiket.status === 'Selesai'
                    ? alasanPenolakan.trim()
                    : '',
              }
            : item
        )
      );

      return true;
    } catch {
      setError('Gagal menyimpan perubahan status.');
      return false;
    }
  }

  return {
    tickets,
    loading,
    error,
    reload,
    ubahStatus,
  };
}
