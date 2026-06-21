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
// import TournamentDetails from './pages/TournamentDetails';
// import TournamentSignup from './pages/TournamentSignup';
// import NotFound from './pages/NotFound';
import AdminGatekeeper from './pages/admin/AdminGatekeeper';

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

          {/* <Route path="*" element={<NotFound />} /> */}
          {/* Admin gate */}
          <Route path="/admin" element={<AdminGatekeeper />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;