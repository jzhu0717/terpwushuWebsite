import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from './pages/Home';
import Joining from './pages/Joining';
import Training from './pages/Training';
import Officers from './pages/Officers';
import Contact from './pages/Contact';
import Tournament from './pages/Tournament';
// import TournamentDetails from './pages/TournamentDetails';
// import TournamentSignup from './pages/TournamentSignup';
// import NotFound from './pages/NotFound';

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
          <Route path="/tournament" element={<Tournament />} />
          {/* Tournament routes */}
          {/* <Route path="/tournament" element={<Tournament />} />
          <Route path="/tournament/:id" element={<TournamentDetails />} />
          <Route path="/tournament/:id/signup" element={<TournamentSignup />} /> */}
          
          {/* <Route path="*" element={<NotFound />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;