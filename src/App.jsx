import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from './pages/Home';
import Joining from './pages/Joining';
import Training from './pages/Training';
import Officers from './pages/Officers';
import Contact from './pages/Contact';
import Tournament from './pages/tournament/Tournament';
import Registration from './pages/tournament/Registration';
import EventOrder from './pages/tournament/EventOrder';
import OnlineCheckin from './pages/tournament/OnlineCheckin';
import Pay from './pages/tournament/Pay';
// import TournamentDetails from './pages/TournamentDetails';
// import TournamentSignup from './pages/TournamentSignup';
// import NotFound from './pages/NotFound';
import AdminGatekeeper from './pages/admin/AdminGatekeeper';
import AdminEventOrderPrint from './pages/admin/AdminEventOrderPrint';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} /> */}
          <Route path="/joining" element={<Joining />} />
          <Route path="/training" element={<Training />} />
          <Route path="/officers" element={<Officers />} />
          <Route path="/contact" element={<Contact />} />
          
          
          {/* Tournament routes */}
          <Route path="/tournament" element={<Tournament />} />
          <Route path="/tournament/registration" element={<Registration />} />
          <Route path="/tournament/event-order" element={<EventOrder />} />
          <Route path="/tournament/online-checkin" element={<OnlineCheckin />} />
          <Route path="/tournament/pay" element={<Pay />} />

          {/* <Route path="*" element={<NotFound />} /> */}
          {/* Admin gate */}
          <Route path="/admin" element={<AdminGatekeeper />} />
        </Route>

        {/* Standalone (no navbar/footer) — meant to be printed directly */}
        <Route path="/admin/event-order-print" element={<AdminEventOrderPrint />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;