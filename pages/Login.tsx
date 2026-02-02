import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Calendar, Lock, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import PublicEventsViewer from '../components/PublicEventsViewer';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { addToast } = useToast();
  const { events } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        addToast('Login realizado com sucesso!', 'success');
        navigate('/');
      } else {
        addToast('Credenciais inválidas ou usuário inativo', 'error');
      }
    } catch (err) {
      addToast('Erro de conexão', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-600 to-purple-700 transform -skew-y-6 -translate-y-24 z-0"></div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Side (Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                    <Calendar size={28} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo</h1>
                <p className="text-gray-500">Insira suas credenciais para acessar a agenda.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-600">Email Corporativo</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none bg-transparent placeholder-gray-400"
                            placeholder="Preencha seu Email"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-600">Senha</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none bg-transparent placeholder-gray-400"
                            placeholder="Preencha sua Senha"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Processando...' : 'Acessar Sistema'}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>


        </div>

        {/* Right Side (Events Preview) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden flex-col p-12">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Próximos Eventos</h2>
                <p className="text-indigo-100 text-sm">Visualize os eventos agendados para os próximos dias</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <PublicEventsViewer events={events} />
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-xs text-indigo-100 text-center">Faça login para gerenciar seus eventos</p>
              </div>
            </div>
        </div>
      </div>
      
      <p className="absolute bottom-6 text-xs text-gray-400">© 2024 EventFlow System. Todos os direitos reservados.</p>
    </div>
  );
};

export default Login;