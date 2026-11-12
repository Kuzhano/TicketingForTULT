const dataEndpoints = {
  users: new URL('../data/users.json', import.meta.url).href,
  tickets: new URL('../data/tickets.json', import.meta.url).href,
};

export async function fetchData(resourceName) {
  const url = dataEndpoints[resourceName] || resourceName;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Gagal memuat data ${resourceName} (Status: ${response.status})`);
  }

  return await response.json();
}