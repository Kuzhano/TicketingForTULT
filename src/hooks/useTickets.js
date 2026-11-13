
import { useState, useEffect, useCallback } from 'react';
import { fetchData } from '../utils/api';

const KUNCI_TIKET = 'tult_tickets';
const KUNCI_TIKET_LAMA = 'tickets';
const KUNCI_STATUS = 'tult_ticket_status';
const KUNCI_STATUS_LAMA = 'statusTiket';

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

  function ubahStatus(id, statusBaru) {
    const alurStatus = {
      Menunggu: 'Diproses',
      Diproses: 'Selesai',
    };

    const tiket = tickets.find(
      (item) => String(item.id) === String(id)
    );

    if (!tiket || alurStatus[tiket.status] !== statusBaru) {
      return false;
    }

    try {
      const statusTersimpan = bacaStorage(KUNCI_STATUS, {});

      localStorage.setItem(
        KUNCI_STATUS,
        JSON.stringify({
          ...statusTersimpan,
          [String(id)]: statusBaru,
        })
      );

      setTickets((sebelumnya) =>
        sebelumnya.map((item) =>
          String(item.id) === String(id)
            ? { ...item, status: statusBaru }
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
