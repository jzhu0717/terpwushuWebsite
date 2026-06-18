import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 text-brand-white p-2 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'transparent' : 'rgba(46, 48, 58, 0.95)',
        backdropFilter: scrolled ? 'none' : 'blur(8px)',
        boxShadow: scrolled ? 'none' : '0 2px 12px rgba(0,0,0,0.15)',
        textShadow: scrolled ? '0 1px 4px rgba(0,0,0,0.6)' : 'none',
      }}
    >
      <div className="container mx-auto grid grid-cols-3 items-center">
        <Link to="/#" className="flex items-center w-fit">
          <img src="/TWLOGOWHITE.png" alt="TW Logo" className="h-10" />
          <span style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 200, color: '#dee0df' }}>terpwushu</span>
        </Link>
        <ul className="flex gap-4 justify-center" style={{ fontFamily: "'Arial', sans-serif", color: '#dee0df',
            backgroundColor: scrolled ? 'rgba(0,0,0,0.35)' : 'transparent',
            borderRadius: '999px',
            padding: scrolled ? '6px 18px' : '0',
            transition: 'all 0.3s', }}>
          <li><Link to="/#">Home</Link></li>
          <li><Link to="/#about">About</Link></li>
          <li><Link to="/joining">Joining</Link></li>
          <li><Link to="/training">Training</Link></li>
          <li><Link to="/officers">Officers</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/tournament">Tournament</Link></li>
        </ul>
        <div className="flex gap-4 justify-end">
          <a href="https://www.facebook.com/terpwushu" target="_blank" rel="noopener noreferrer">
            <img src="/socials/fb.webp" alt="Facebook" className="h-6" />
          </a>
          <a href="https://www.instagram.com/terpwushu/" target="_blank" rel="noopener noreferrer">
            <img src="/socials/ig.webp" alt="Instagram" className="h-6" />
          </a>
          <a href="https://www.youtube.com/user/terpwushuviewer" target="_blank" rel="noopener noreferrer">
            <img src="/socials/yt.webp" alt="YouTube" className="h-6" />
          </a>
          <a href="https://www.tiktok.com/@terpwushu" target="_blank" rel="noopener noreferrer">
            <img src="/socials/tt.webp" alt="TikTok" className="h-6" />
          </a>
        </div>
      </div>
    </nav>
  );
}