import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, LogOut, Menu, X, ListTodo } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BrandingService, BrandingConfig } from '../services/brandingService';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, currentUser, isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const config = await BrandingService.getLogo();
      setBranding(config);
    } catch (error) {
      console.error('Erro ao carregar branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-medium' 
            : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Mobile Header */}
      <div className="md:hidden fixed w-full top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600">
            {!loading && branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-8 w-auto" />
            ) : (
              <>
                <Calendar size={24} strokeWidth={2.5} />
                <span className="text-lg font-bold tracking-tight">Agenda ADNI ITAIPU</span>
              </>
            )}
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen w-72 bg-white border-r border-gray-100 z-40 transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 hidden md:block">
          <div className="flex items-center gap-3">
            {!loading && branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-12 w-auto" />
            ) : (
              <>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Calendar size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-gray-800">Agenda ADNI ITAIPU</span>
                  <p className="text-xs text-indigo-600 font-semibold">Agenda de Eventos ADNI ITAIPU</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 py-4 md:py-0 space-y-2 overflow-y-auto mt-16 md:mt-0">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu Principal</p>
          <NavItem to="/" icon={Calendar} label="Minha Agenda" />
          <NavItem to="/eventos" icon={ListTodo} label="Todos os Eventos" />
          {isAdmin && (
            <NavItem to="/admin" icon={Users} label="Painel Administrativo" />
          )}
          
          <div className="mt-8 px-4">
             <div className="h-px bg-gray-100 mb-6"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Perfil Conectado
            </p>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize font-medium">
                  {currentUser?.role === 'COMMON' ? 'Usuário Comum' : 
                   currentUser?.role === 'VIEWER' ? 'Visualizador' : 'Administrador'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 mb-safe">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;