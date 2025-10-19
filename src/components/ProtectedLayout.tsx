import { useState, useEffect } from 'react';
import AuthNavbar from '../components/AuthNavbar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Usar breakpoint lg (1024px) para desktop
  const [open, setOpen] = useState(window.innerWidth >= 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setOpen(desktop);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Layout profesional: sidebar fijo en desktop, superpuesto en móvil
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex">
      <AuthNavbar open={open} setOpen={setOpen} isDesktop={isDesktop} />
      <div className="flex-1">
        {/* El contenido se adapta perfectamente al espacio disponible */}
        {children}
      </div>
    </div>
  );
}
