import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { formatDateBR } from '../utils/dateFormatter';
import { EventStatus, EventRequest } from '../types';
import { Search, Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PublicAllEvents: React.FC = () => {
  const { events } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  // Filtrar e ordenar eventos
  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let result = [...events];

    // Filtrar apenas eventos futuros e aprovados
    result = result.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= today && e.status === EventStatus.APPROVED;
    });

    // Filtro por busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.requesterName.toLowerCase().includes(term)
      );
    }

    // Ordenação: primeiro por data, depois por horário se for o mesmo dia
    result.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      // Se for o mesmo dia, ordena por horário
      if (sortBy === 'date') {
        return (a.time || '00:00').localeCompare(b.time || '00:00');
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [events, searchTerm, sortBy]);

  // Nota: statusFilter removido pois a página pública mostra apenas eventos aprovados

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header com botão voltar */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="p-2 hover:bg-white rounded-lg text-gray-600 hover:text-indigo-600 transition-all shadow-sm"
            title="Voltar"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-indigo-600" size={32} />
              <h1 className="text-4xl font-bold text-gray-900">Todos os Eventos</h1>
            </div>
            <p className="text-gray-600">Visualize todos os eventos agendados para os próximos dias</p>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou solicitante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600 block mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none"
                >
                  <option value="date">Data e Horário</option>
                  <option value="title">Título</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contagem */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{filteredEvents.length}</span> de{' '}
            <span className="font-semibold text-gray-900">{events.length}</span> eventos
          </p>
        </div>

        {/* Lista de Eventos */}
        <div className="space-y-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-5 md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Conteúdo principal */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                    {/* Info row */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-indigo-500" />
                        <span>{formatDateBR(event.date)}</span>
                      </div>

                      {event.time && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} className="text-indigo-500" />
                          <span>{event.time}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={16} className="text-indigo-500" />
                        <span>{event.requesterName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Nenhum evento encontrado</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || statusFilter !== 'all' ? 'Tente ajustar os filtros' : 'Não há eventos agendados para os próximos dias'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicAllEvents;
