import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, X } from 'lucide-react';

const AdminLogin = ({ onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usamos la ruta relativa /api/login gracias al proxy
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-4">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Acceso Administrativo</h2>
          <p className="text-white/40 text-sm mt-2">Ingrese sus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;