import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Lock, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { addToast } = useToast();
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

        {/* Right Side (Image/Decoration) */}
        <div className="hidden md:block w-1/2 bg-indigo-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/90 to-purple-600/90 z-10"></div>
            <img 
                src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop" 
                alt="Office planning" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
            />
            
            <div className="relative z-20 h-full flex flex-col justify-center p-12 text-white">
                <h2 className="text-3xl font-bold mb-4">Organize seus eventos com eficiência</h2>
                <p className="text-indigo-100 leading-relaxed text-lg">
                    EventFlow é a solução completa para gerenciamento de agendas corporativas. 
                    Controle permissões, aprove solicitações e mantenha todos sincronizados.
                </p>
                
                <div className="mt-8 flex gap-2">
                    <div className="w-12 h-1.5 bg-white rounded-full opacity-100"></div>
                    <div className="w-3 h-1.5 bg-white rounded-full opacity-40"></div>
                    <div className="w-3 h-1.5 bg-white rounded-full opacity-40"></div>
                </div>
            </div>
        </div>
      </div>
      
      <p className="absolute bottom-6 text-xs text-gray-400">© 2024 EventFlow System. Todos os direitos reservados.</p>
    </div>
  );
};

export default Login;