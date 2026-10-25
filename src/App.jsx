import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketHistory from './pages/TicketHistory';
import TicketDetail from './pages/TicketDetail';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateTicket />} />
          <Route path="history" element={<TicketHistory />} />
          <Route path="ticket/:id" element={<TicketDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}