
import { useState, useEffect, useCallback } from 'react';
import urlTiket from '../data/tickets.json?url';

const KUNCI_TIKET = 'tickets';
const KUNCI_TIKET_LAMA = 'tult_tickets';
const KUNCI_STATUS = 'statusTiket';

function bacaStorage(kunci, nilaiAwal) {
  try {
    const data = JSON.parse(localStorage.getItem(kunci));
    return data ?? nilaiAwal;
  } catch {
    return nilaiAwal;
  }
}

function hapusDuplikat(daftarTiket) {
  const idSudahAda = new Set();

  return daftarTiket.filter((tiket) => {
    if (!tiket || tiket.id === undefined) {
      return false;
    }

    const id = String(tiket.id);

    if (idSudahAda.has(id)) {
      return false;
    }

    idSudahAda.add(id);
    return true;
  });
}

export default function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(urlTiket, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data tiket.');
      }

      const dataApi = await response.json();

      if (!Array.isArray(dataApi)) {
        throw new Error('Format data tiket tidak valid.');
      }

      const tiketBaru = bacaStorage(KUNCI_TIKET, []);
      const tiketLama = bacaStorage(KUNCI_TIKET_LAMA, []);
      const statusTersimpan = bacaStorage(KUNCI_STATUS, {});

      const tiketLokal = hapusDuplikat([
        ...(Array.isArray(tiketBaru) ? tiketBaru : []),
        ...(Array.isArray(tiketLama) ? tiketLama : []),
      ]);

      tiketLokal.reverse();

      const semuaTiket = hapusDuplikat([
        ...tiketLokal,
        ...dataApi,
      ]);

      const hasil = semuaTiket.map((tiket) => ({
        ...tiket,
        status:
          statusTersimpan[String(tiket.id)] ||
          tiket.status ||
          'Menunggu',
      }));

      setTickets(hasil);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat memuat tiket.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();

    const saatStorageBerubah = (event) => {
      if (
        event.key === KUNCI_TIKET ||
        event.key === KUNCI_TIKET_LAMA ||
        event.key === KUNCI_STATUS
      ) {
        reload();
      }
    };

    window.addEventListener(
      'storage',
      saatStorageBerubah
    );

    return () => {
      window.removeEventListener(
        'storage',
        saatStorageBerubah
      );
    };
  }, [reload]);

  function ubahStatus(id, statusBaru) {
    const statusValid = [
      'Menunggu',
      'Diproses',
      'Selesai',
    ];

    if (!statusValid.includes(statusBaru)) {
      return false;
    }

    const tiket = tickets.find(
      (item) => String(item.id) === String(id)
    );

    if (!tiket) {
      return false;
    }

    const alurStatus = {
      Menunggu: 'Diproses',
      Diproses: 'Selesai',
    };

    if (alurStatus[tiket.status] !== statusBaru) {
      return false;
    }

    try {
      const statusLama = bacaStorage(KUNCI_STATUS, {});

      localStorage.setItem(
        KUNCI_STATUS,
        JSON.stringify({
          ...statusLama,
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
