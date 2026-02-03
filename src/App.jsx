import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import SystemCard from './components/SystemCard';
import ParticlesBackground from './components/ParticlesBackground';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

// Función auxiliar para obtener el componente de icono por nombre (string)
const getIconComponent = (iconName) => {
  const Icon = LucideIcons[iconName];
  return Icon ? Icon : LucideIcons.HelpCircle;
};

function App() {
  const [bgImage, setBgImage] = useState('');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Admin
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sectionsRes, backgroundsRes] = await Promise.all([
        fetch('/api/data'),
        fetch('/api/backgrounds')
      ]);
      const sectionsData = await sectionsRes.json();
      const backgroundsData = await backgroundsRes.json();

      // Procesar secciones
      const processedSections = sectionsData.map(section => ({
        ...section,
        icon: getIconComponent(section.icon),
        items: section.items.map(item => ({
          ...item,
          icon: getIconComponent(item.icon)
        }))
      }));
      setSections(processedSections);

      // Seleccionar fondo aleatorio de la nueva ubicación
      if (backgroundsData.length > 0) {
        const randomImage = backgroundsData[Math.floor(Math.random() * backgroundsData.length)];
        setBgImage(`/backgrounds/${randomImage}`); // La ruta ahora es relativa a public
      }

    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recargar datos cuando se cierra el panel de admin (por si hubo cambios)
  const handleCloseAdmin = () => {
    setIsAdmin(false);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-fuchsia-500/30 relative overflow-hidden flex flex-col">

      {/* Imagen Degradado de Fondo */}
      {bgImage && (
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url("${bgImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Capa oscura */}
      <div className="fixed inset-0 z-0 bg-black/30" />

      {/* Fondo Ambiental Animado */}
      <ParticlesBackground />

      {/* Botón de Login Admin (Esquina superior derecha) */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setShowLogin(true)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all"
          title="Acceso Administrativo"
        >
          <LucideIcons.Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Modales de Admin */}
      {showLogin && (
        <AdminLogin 
          onClose={() => setShowLogin(false)} 
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAdmin(true);
            setShowLogin(false);
          }} 
        />
      )}

      {isAdmin && (
        <AdminPanel 
          onClose={handleCloseAdmin}
          onLogout={() => {
            setIsAdmin(false);
            setCurrentUser(null);
          }}
        />
      )}

      <main className="relative z-10 container mx-auto px-4 py-12 flex-grow flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-sm">
            <LucideIcons.Terminal className="w-4 h-4 text-white mr-2" />
            <span className="text-xs font-mono text-white/80">COOPERATIVA DE AHORRO Y CRÉDITO SOCIETARIA SAN MARTIÍN R.L.</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
            Portal de Accesos
          </h1>
          <p className="text-white/50 text-sm">Seleccione el sistema al que desea ingresar</p>
        </motion.div>

        {loading ? (
          <div className="text-center text-white/50">Cargando sistemas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
            {sections.map((section, idx) => (
              <motion.div
                key={section.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-2 mb-2 px-2 border-b border-white/10 pb-2">
                  <section.icon className="w-4 h-4 text-white/60" />
                  <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">{section.title}</h2>
                </div>
                
                {/* Grid de 2 columnas para los items dentro de cada sección */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {section.items.map((sys) => (
                    <SystemCard key={sys.id} {...sys} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="relative z-10 text-center py-6 text-xs text-white/30">
        &copy; {new Date().getFullYear()} Cooperativa San Martín. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default App