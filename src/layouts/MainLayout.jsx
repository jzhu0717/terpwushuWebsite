// (navbar + footer wrapper)

import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full pt-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}