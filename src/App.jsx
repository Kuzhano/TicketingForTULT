import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketHistory from './pages/TicketHistory';
import TicketDetail from './pages/TicketDetail';
import Profile from './pages/Profile';
import TicketTeknisi from './pages/TicketTeknisi';
import TeknisiTaskDetail from './pages/TeknisiTaskDetail';
import Penugasan_Admin from './pages/Penugasan_Admin';
import ValidasiTeknisi from './pages/ValidasiTeknisi';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateTicket />} />
          <Route path="history" element={<TicketHistory />} />
          <Route path="ticket/:id" element={<TicketDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="teknisi" element={<TicketTeknisi />} />
          <Route path="teknisi/:id" element={<TeknisiTaskDetail />} />
          <Route path="penugasan" element={<Penugasan_Admin />} />
          <Route path="validasi" element={<ValidasiTeknisi />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}