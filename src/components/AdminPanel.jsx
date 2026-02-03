import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, Trash2, X, Edit2, Check, LogOut, Search, ChevronDown, Image as ImageIcon, UploadCloud, Loader, Camera, FolderPlus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// --- COMPONENTES INTERNOS ---

// Componente Selector de Iconos (sin cambios)
const AVAILABLE_ICONS = [
    "LayoutDashboard", "Home", "Settings", "Users", "User", "Briefcase", "Building", 
    "CreditCard", "FileText", "BarChart3", "PieChart", "TrendingUp", "ShoppingCart", 
    "Server", "Database", "Cloud", "CloudCog", "Terminal", "Shield", "ShieldCheck", 
    "Lock", "Key", "Monitor", "Laptop", "Smartphone", "Mail", "MessageSquare", 
    "Calendar", "Clock", "MapPin", "Link", "ExternalLink", "Star", "Heart", "Bell", 
    "Search", "Menu", "Check", "Plus", "Trash2", "Edit2", "Save", "LogOut", 
    "Activity", "AlertCircle", "Archive", "Award", "Bookmark", "Box", "Camera", 
    "CheckCircle", "Clipboard", "Code", "Coffee", "Compass", "Copy", "Download", 
    "Eye", "File", "Filter", "Flag", "Folder", "Gift", "Globe", "Grid", "HelpCircle", 
    "Image", "Inbox", "Info", "Layers", "Layout", "LifeBuoy", "List", "Loader", 
    "LockOpen", "Map", "Maximize", "Mic", "Music", "Navigation", "Paperclip", 
    "Phone", "Play", "Power", "Printer", "Radio", "RefreshCw", "Send", "Share2", 
    "Sidebar", "Sliders", "Speaker", "StopCircle", "Sun", "Moon", "Table", "Tag", 
    "Target", "ThumbsUp", "Tool", "Truck", "Type", "Umbrella", "Upload", "Video", 
    "Wifi", "Zap"
  ];
const IconPicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  const filteredIcons = AVAILABLE_ICONS.filter(icon => icon.toLowerCase().includes(searchTerm.toLowerCase()));
  const SelectedIcon = LucideIcons[value] || LucideIcons.HelpCircle;
  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs text-white/60 mb-1">Icono</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-black/20 border border-white/10 rounded p-2 text-white text-sm hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2"><SelectedIcon className="w-4 h-4 text-blue-400" /><span>{value}</span></div>
        <ChevronDown className="w-4 h-4 text-white/40" />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-white/10 rounded-lg shadow-xl max-h-60 flex flex-col">
          <div className="p-2 border-b border-white/10 sticky top-0 bg-slate-800 rounded-t-lg">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
              <input type="text" placeholder="Buscar icono..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded py-1 pl-7 pr-2 text-xs text-white focus:outline-none focus:border-blue-500/50" autoFocus />
            </div>
          </div>
          <div className="overflow-y-auto p-2 grid grid-cols-5 gap-1">
            {filteredIcons.map((iconName) => {
              const Icon = LucideIcons[iconName];
              if (!Icon) return null;
              return <button key={iconName} type="button" onClick={() => { onChange(iconName); setIsOpen(false); }} className={`p-2 rounded flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors ${value === iconName ? 'bg-blue-500/20 text-blue-400' : 'text-white/70'}`} title={iconName}><Icon className="w-5 h-5" /></button>;
            })}
            {filteredIcons.length === 0 && <div className="col-span-5 text-center py-4 text-xs text-white/30">No se encontraron iconos</div>}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

const AdminPanel = ({ onClose, onLogout }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [editingSystem, setEditingSystem] = useState(null);
  const [newSystem, setNewSystem] = useState({ section_id: '', title: '', description: '', url: '', icon: 'Link', color: 'from-blue-500 to-cyan-500', sort_order: 0, image_filename: null });
  const [isAddingSystem, setIsAddingSystem] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSection, setNewSection] = useState({ title: '', icon: 'Folder' });
  const [backgrounds, setBackgrounds] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const systemImageInputRef = useRef(null);

  // --- Carga de Datos ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [sectionsRes, backgroundsRes] = await Promise.all([
        fetch('/api/data'),
        fetch('/api/backgrounds')
      ]);

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
      } else {
        console.error('Error al cargar las secciones');
        setSections([]);
      }

      if (backgroundsRes.ok) {
        const backgroundsData = await backgroundsRes.json();
        console.log("Fondos cargados:", backgroundsData);
        setBackgrounds(Array.isArray(backgroundsData) ? backgroundsData : []);
      } else {
        console.error('Error al cargar los fondos de pantalla');
        setBackgrounds([]);
      }

    } catch (err) {
      console.error("Error de conexión al cargar datos:", err);
      setSections([]);
      setBackgrounds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers de CRUD ---
  const handleSaveSection = async (section) => {
    try {
      await fetch(`/api/sections/${section.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: section.title, icon: section.icon }) });
      setEditingSection(null);
      fetchData();
    } catch (err) { console.error("Error guardando sección:", err); }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
        await fetch('/api/sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSection) });
        setIsAddingSection(false);
        setNewSection({ title: '', icon: 'Folder' });
        fetchData();
    } catch (err) { console.error("Error creando sección:", err); }
  };

  const handleDeleteSection = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta sección? Se borrarán todos los accesos que contiene.')) {
        try {
            const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData(); else alert("Error al eliminar la sección");
        } catch (err) { console.error("Error eliminando sección:", err); alert("Error de conexión al eliminar"); }
    }
  };

  const handleCreateSystem = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/systems', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSystem) });
      setIsAddingSystem(false);
      setNewSystem({ ...newSystem, title: '', description: '', url: '', image_filename: null });
      fetchData();
    } catch (err) { console.error("Error creando sistema:", err); }
  };

  const handleUpdateSystem = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/systems/${editingSystem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingSystem) });
      setEditingSystem(null);
      fetchData();
    } catch (err) { console.error("Error actualizando sistema:", err); }
  };

  const handleDeleteSystem = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este acceso?')) {
      try {
        const res = await fetch(`/api/systems/${id}`, { method: 'DELETE' });
        if (res.ok) fetchData(); else alert("Error al eliminar el sistema");
      } catch (err) { console.error("Error eliminando sistema:", err); alert("Error de conexión al eliminar"); }
    }
  };

  // --- FUNCIÓN DE SUBIDA SIMPLIFICADA ---
  const handleUploadImage = async (event) => {
    console.log("1. Evento onChange disparado");
    const file = event.target.files[0];

    if (!file) {
        console.log("2. No hay archivo seleccionado");
        return;
    }
    console.log("2. Archivo:", file.name);

    setIsUploading(true);
    const formData = new FormData();
    formData.append('background', file);

    try {
      console.log("3. Enviando fetch...");
      const res = await fetch('/api/backgrounds/upload', {
          method: 'POST',
          body: formData
      });

      console.log("4. Respuesta status:", res.status);

      if (res.ok) {
          const data = await res.json();
          console.log("5. Datos recibidos:", data);

          if (data.filename) {
            setBackgrounds(prev => [...prev, data.filename]);
            alert("Imagen subida correctamente");
          } else {
            alert("El servidor no devolvió el nombre del archivo");
          }

          if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
          const text = await res.text();
          console.error("Error servidor:", text);
          alert('Error del servidor: ' + res.status);
      }
    } catch (err) {
        console.error("Excepción fetch:", err);
        alert('Error de red al subir.');
    }
    finally { setIsUploading(false); }
  };

  const handleDeleteImage = async (filename) => {
    if (window.confirm(`¿Estás seguro de eliminar la imagen "${filename}"?`)) {
      try {
        const res = await fetch(`/api/backgrounds/${filename}`, { method: 'DELETE' });
        if (res.ok) {
            setBackgrounds(prev => prev.filter(bg => bg !== filename));
        } else {
            alert('Error al eliminar la imagen.');
        }
      } catch (err) { console.error("Error eliminando imagen:", err); alert('Error de conexión al eliminar.'); }
    }
  };

  const handleSystemImageUpload = async (event, targetSystem, setTargetSystem) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('system_image', file);
    try {
        const res = await fetch('/api/systems/upload-image', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
            setTargetSystem({ ...targetSystem, image_filename: data.filename, icon: 'Image' });
        } else {
            alert('Error al subir la imagen del sistema.');
        }
    } catch (err) {
        console.error("Error subiendo imagen de sistema:", err);
    }
  };

  if (loading) return <div className="text-white text-center p-10">Cargando panel...</div>;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
            <p className="text-white/40 text-sm">Gestiona el contenido del portal</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsAddingSection(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors shadow-lg shadow-blue-600/20">
                <FolderPlus className="w-4 h-4" /> Nueva Sección
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors">Volver al Portal</button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-colors border border-red-500/20"><LogOut className="w-4 h-4" /> Salir</button>
          </div>
        </div>

        {/* --- GESTIÓN DE FONDOS DE PANTALLA --- */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="w-5 h-5 text-white/70" />
            <h2 className="text-lg font-semibold text-white">Imágenes de Fondo</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.isArray(backgrounds) && backgrounds.map(bg => (
              <div key={bg} className="group relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all">
                <img src={`/backgrounds/${bg}`} alt={bg} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDeleteImage(bg)} className="p-2 rounded-full bg-red-600/50 hover:bg-red-600 text-white transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {/* Botón de subida */}
            <div
              onClick={() => {
                  console.log("Click en subir imagen");
                  fileInputRef.current?.click();
              }}
              className="relative aspect-video rounded-lg border-2 border-dashed border-white/20 hover:border-blue-500 hover:bg-white/5 transition-all flex flex-col items-center justify-center text-white/40 hover:text-white cursor-pointer"
            >
              {isUploading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader className="w-6 h-6" />
                  </motion.div>
                  <span className="text-xs mt-2">Subiendo...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8" />
                  <span className="text-xs mt-2">Subir Imagen</span>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUploadImage} accept="image/jpeg, image/png, image/webp" className="hidden" />
          </div>
        </div>

        {/* --- GESTIÓN DE SECCIONES Y ACCESOS --- */}
        <div className="space-y-8">
          {Array.isArray(sections) && sections.map((section) => (
            <div key={section.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                {editingSection === section.id ? (
                  <div className="flex items-center gap-3 flex-1">
                    <input type="text" value={section.title} onChange={(e) => setSections(sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s))} className="bg-black/20 border border-white/20 rounded px-3 py-1 text-white text-lg font-semibold flex-1" />
                    <button onClick={() => handleSaveSection(section)} className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"><Save className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-white/5">{React.createElement(LucideIcons[section.icon] || LucideIcons.HelpCircle, { className: "w-5 h-5 text-white/70" })}</div>
                    <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                    <button onClick={() => setEditingSection(section.id)} className="p-1.5 text-white/30 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteSection(section.id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors ml-1" title="Eliminar Sección"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
                <button onClick={() => { setNewSystem({ ...newSystem, section_id: section.id }); setIsAddingSystem(true); }} className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-medium border border-blue-600/20 transition-colors"><Plus className="w-3 h-3" /> Nuevo Acceso</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((sys) => (
                  <div key={sys.id} className="group relative p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-1.5 rounded bg-gradient-to-br ${sys.color} bg-opacity-20`}>{React.createElement(LucideIcons[sys.icon] || LucideIcons.HelpCircle, { className: "w-4 h-4 text-white" })}</div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingSystem(sys)} className="text-white/20 hover:text-blue-400 transition-colors p-1"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => handleDeleteSystem(sys.id)} className="text-white/20 hover:text-red-400 transition-colors p-1"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1">{sys.title}</h3>
                    <p className="text-xs text-white/40 truncate">{sys.description}</p>
                    <div className="mt-3 text-[10px] text-white/20 font-mono truncate bg-black/30 p-1 rounded">{sys.url}</div>
                  </div>
                ))}
                {section.items.length === 0 && <div className="col-span-full text-center py-8 text-white/20 text-sm border border-dashed border-white/10 rounded-lg">No hay accesos en esta sección</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODALES --- */}

      {/* Modal para Agregar Sección */}
      {isAddingSection && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-800 border border-white/10 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Nueva Sección</h3>
                    <button onClick={() => setIsAddingSection(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleCreateSection} className="space-y-4">
                    <div>
                        <label className="block text-xs text-white/60 mb-1">Título de la Sección</label>
                        <input required type="text" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" value={newSection.title} onChange={e => setNewSection({...newSection, title: e.target.value})} />
                    </div>
                    <div>
                        <IconPicker value={newSection.icon} onChange={(icon) => setNewSection({...newSection, icon})} />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAddingSection(false)} className="px-4 py-2 rounded text-white/60 hover:text-white text-sm">Cancelar</button>
                        <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium">Crear Sección</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Modal para Agregar/Editar Sistema */}
      {(isAddingSystem || editingSystem) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-800 border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">{isAddingSystem ? 'Agregar Nuevo Acceso' : 'Editar Acceso'}</h3>
              <button onClick={() => { setIsAddingSystem(false); setEditingSystem(null); }} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={isAddingSystem ? handleCreateSystem : handleUpdateSystem} className="space-y-4">
              {/* --- Contenido del Formulario --- */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-white/60 mb-1">Título</label><input required type="text" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" value={editingSystem?.title || newSystem.title} onChange={e => isAddingSystem ? setNewSystem({...newSystem, title: e.target.value}) : setEditingSystem({...editingSystem, title: e.target.value})} /></div>
                <div><label className="block text-xs text-white/60 mb-1">Descripción</label><input required type="text" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" value={editingSystem?.description || newSystem.description} onChange={e => isAddingSystem ? setNewSystem({...newSystem, description: e.target.value}) : setEditingSystem({...editingSystem, description: e.target.value})} /></div>
              </div>
              <div><label className="block text-xs text-white/60 mb-1">URL de Destino</label><input required type="text" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" value={editingSystem?.url || newSystem.url} onChange={e => isAddingSystem ? setNewSystem({...newSystem, url: e.target.value}) : setEditingSystem({...editingSystem, url: e.target.value})} placeholder="https://..." /></div>
              
              <div className="grid grid-cols-2 gap-4 items-end">
                {/* Selector de Icono o Imagen */}
                <div>
                  <label className="block text-xs text-white/60 mb-1">Icono o Imagen</label>
                  <div className="flex gap-2">
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-black/20 flex items-center justify-center">
                      {(editingSystem?.image_filename || newSystem.image_filename) ? 
                        <img src={`/system-images/${editingSystem?.image_filename || newSystem.image_filename}`} className="w-full h-full object-cover rounded-lg" /> :
                        React.createElement(LucideIcons[editingSystem?.icon || newSystem.icon] || LucideIcons.HelpCircle, { className: "w-6 h-6 text-white/70" })
                      }
                    </div>
                    <div className="flex-grow">
                      <IconPicker value={editingSystem?.icon || newSystem.icon} onChange={(icon) => isAddingSystem ? setNewSystem({...newSystem, icon, image_filename: null}) : setEditingSystem({...editingSystem, icon, image_filename: null})} />
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => systemImageInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded p-2 text-white text-sm transition-colors">
                  <Camera className="w-4 h-4" /> Subir Imagen
                </button>
                <input type="file" ref={systemImageInputRef} onChange={(e) => handleSystemImageUpload(e, isAddingSystem ? newSystem : editingSystem, isAddingSystem ? setNewSystem : setEditingSystem)} accept="image/jpeg, image/png, image/webp" className="hidden" />
              </div>

              <div><label className="block text-xs text-white/60 mb-1">Color</label><select className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" value={editingSystem?.color || newSystem.color} onChange={e => isAddingSystem ? setNewSystem({...newSystem, color: e.target.value}) : setEditingSystem({...editingSystem, color: e.target.value})}><option value="from-blue-500 to-cyan-500">Azul - Cyan</option><option value="from-purple-500 to-pink-500">Morado - Rosa</option><option value="from-orange-500 to-red-500">Naranja - Rojo</option><option value="from-emerald-500 to-green-500">Esmeralda - Verde</option><option value="from-indigo-500 to-blue-600">Indigo - Azul</option><option value="from-yellow-400 to-orange-500">Amarillo - Naranja</option></select></div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAddingSystem(false); setEditingSystem(null); }} className="px-4 py-2 rounded text-white/60 hover:text-white text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white text-sm font-medium">{isAddingSystem ? 'Guardar Acceso' : 'Actualizar Acceso'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;