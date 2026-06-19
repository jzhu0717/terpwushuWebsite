import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 text-brand-white p-4 transition-all duration-300 ${
        // On mobile, we keep a solid background when scrolled so elements stay readable.
        // On desktop (lg:), we allow it to go transparent for your pill effect.
        scrolled 
          ? 'bg-[#2e303a]/95 backdrop-blur-md shadow-lg lg:bg-transparent lg:backdrop-blur-0 lg:shadow-none' 
          : 'bg-[#2e303a]/95 backdrop-blur-md shadow-md'
      }`}
      style={{
        textShadow: scrolled ? '0 1px 4px rgba(0,0,0,0.6)' : 'none',
      }}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        
        {/* Left Side: Logo */}
        <div className="flex justify-start items-center shrink-0">
          <Link to="/#" className="flex items-center w-fit">
            <img src="/TWLOGOWHITE.png" alt="TW Logo" className="h-10" />
            <span style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 200, color: '#dee0df' }}>
              terpwushu
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        {/* Switched breakpoint to 'lg' (1024px) because 7 links need more room to breathe */}
        <ul 
          className="hidden lg:flex gap-6 justify-center items-center whitespace-nowrap" 
          style={{ 
            fontFamily: "'Arial', sans-serif", 
            color: '#dee0df',
            backgroundColor: scrolled ? 'rgba(0,0,0,0.45)' : 'transparent',
            borderRadius: '999px',
            padding: scrolled ? '8px 24px' : '0', 
            boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
            transition: 'all 0.3s ease-in-out', 
          }}
        >
          <li className="hover:text-white transition-colors"><Link to="/#">Home</Link></li>
          <li className="hover:text-white transition-colors"><Link to="/#about">About</Link></li>
          <li className="hover:text-white transition-colors"><Link to="/joining">Joining</Link></li>
          <li className="hover:text-white transition-colors"><Link to="/training">Training</Link></li>
          <li className="hover:text-white transition-colors"><Link to="/officers">Officers</Link></li>
          <li className="hover:text-white transition-colors"><Link to="/contact">Contact</Link></li>
          <li className="hover:text-white transition-colors"><Link to="/tournament/">Tournament</Link></li>
        </ul>

        {/* Right Side: Desktop Socials */}
        {/* Hidden on mobile/tablet, shown on desktop (lg:) to keep mobile clean */}
        <div className="hidden lg:flex gap-4 justify-end shrink-0">
          <a href="https://www.facebook.com/terpwushu" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="/socials/fb.webp" alt="Facebook" className="h-6" />
          </a>
          <a href="https://www.instagram.com/terpwushu/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="/socials/ig.webp" alt="Instagram" className="h-6" />
          </a>
          <a href="https://www.youtube.com/user/terpwushuviewer" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="/socials/yt.webp" alt="YouTube" className="h-6" />
          </a>
          <a href="https://www.tiktok.com/@terpwushu" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="/socials/tt.webp" alt="TikTok" className="h-6" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        {/* Visible on everything except desktop (lg:) */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8 z-50 focus:outline-none"
          aria-label="Toggle Menu"
        >
          <span className={`h-0.5 w-6 bg-[#dee0df] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`h-0.5 w-6 bg-[#dee0df] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-[#dee0df] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

      </div>

      {/* Mobile Drawer Menu Overlay */}
      <div 
        className={`fixed top-0 left-0 w-full h-screen bg-[#2e303a] z-40 flex flex-col pt-24 px-8 transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Navigation Links */}
        <ul className="flex flex-col gap-6 text-xl" style={{ fontFamily: "'Arial', sans-serif", color: '#dee0df' }}>
          <li><Link to="/#" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/#about" onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
          <li><Link to="/joining" onClick={() => setIsMobileMenuOpen(false)}>Joining</Link></li>
          <li><Link to="/training" onClick={() => setIsMobileMenuOpen(false)}>Training</Link></li>
          <li><Link to="/officers" onClick={() => setIsMobileMenuOpen(false)}>Officers</Link></li>
          <li><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>
          <li><Link to="/tournament" onClick={() => setIsMobileMenuOpen(false)}>Tournament</Link></li>
        </ul>

        <div className="w-full h-px bg-gray-600 my-8" />

        {/* Mobile Social Links */}
        <div className="flex gap-6 justify-start">
          <a href="https://www.facebook.com/terpwushu" target="_blank" rel="noopener noreferrer">
            <img src="/socials/fb.webp" alt="Facebook" className="h-8" />
          </a>
          <a href="https://www.instagram.com/terpwushu/" target="_blank" rel="noopener noreferrer">
            <img src="/socials/ig.webp" alt="Instagram" className="h-8" />
          </a>
          <a href="https://www.youtube.com/user/terpwushuviewer" target="_blank" rel="noopener noreferrer">
            <img src="/socials/yt.webp" alt="YouTube" className="h-8" />
          </a>
          <a href="https://www.tiktok.com/@terpwushu" target="_blank" rel="noopener noreferrer">
            <img src="/socials/tt.webp" alt="TikTok" className="h-8" />
          </a>
        </div>
      </div>
    </nav>
  );
}