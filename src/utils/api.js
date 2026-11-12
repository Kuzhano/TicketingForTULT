const dataEndpoints = {
  users: new URL('../data/users.json', import.meta.url).href,
  tickets: new URL('../data/tickets.json', import.meta.url).href,
};

const ticketStorageKey = 'tult_tickets';

export async function fetchData(resourceName) {
  const url = dataEndpoints[resourceName] || resourceName;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Gagal memuat data ${resourceName} (Status: ${response.status})`);
  }

  return await response.json();
}

export async function postData(resourceName, data) {
  if (resourceName !== 'tickets') {
    throw new Error(`POST tidak didukung untuk data ${resourceName}.`);
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Data tiket tidak valid.');
  }

  const [tickets, savedTicketsValue] = await Promise.all([
    fetchData('tickets'),
    Promise.resolve(localStorage.getItem(ticketStorageKey)),
  ]);
  const savedTickets = savedTicketsValue ? JSON.parse(savedTicketsValue) : [];

  if (!Array.isArray(tickets) || !Array.isArray(savedTickets)) {
    throw new Error('Format data tiket tidak valid.');
  }

  const nextTicketNumber = [...tickets, ...savedTickets].reduce((max, ticket) => {
    const match = /^TKT-(\d+)$/.exec(ticket.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;
  const newTicket = {
    ...data,
    id: `TKT-${String(nextTicketNumber).padStart(3, '0')}`,
  };

  savedTickets.push(newTicket);
  localStorage.setItem(ticketStorageKey, JSON.stringify(savedTickets));

  return newTicket;
}