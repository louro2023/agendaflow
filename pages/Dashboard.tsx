import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EventStatus, EventRequest } from '../types';
import EventModal from '../components/EventModal';
import { ChevronLeft, ChevronRight, Plus, ChevronDown, Trash2, CalendarDays } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { events, addEvent, updateEventStatus, deleteEvent, updateEventDetails } = useData();
  const { currentUser, isCommon, isAdmin } = useAuth();
  const { addToast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null);

  // Date Picker State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Show all events to all users
  const filteredEvents = useMemo(() => {
    return events;
  }, [events]);

  const getDayEvents = (day: Date) => {
    // Corrigir comparação de data com timezone local
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');
    const dayString = `${year}-${month}-${date}`;
    
    return filteredEvents.filter(event => event.date === dayString);
  };

  const handleDayDoubleClick = (day: Date) => {
    if (isCommon || isAdmin) {
      // Corrigir para usar a data em timezone local (não UTC)
      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, '0');
      const date = String(day.getDate()).padStart(2, '0');
      setSelectedDay(`${year}-${month}-${date}`);
      setSelectedEvent(null);
      setModalOpen(true);
    }
  };

  const handleEventClick = (e: React.MouseEvent, event: EventRequest) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDay(undefined);
    setModalOpen(true);
  };

  const handleCreateEvent = (title: string, description: string) => {
    if (selectedDay && currentUser) {
      addEvent({
        title,
        description,
        date: selectedDay,
        requesterId: currentUser.id,
        requesterName: currentUser.name
      });
      addToast('Evento solicitado com sucesso!', 'success');
    }
  };

  const handleEditEvent = (id: string, title: string, description: string) => {
    updateEventDetails(id, title, description);
    addToast('Evento atualizado com sucesso!', 'success');
  };

  const handleApprove = (id: string) => {
    updateEventStatus(id, EventStatus.APPROVED);
    setModalOpen(false);
    addToast('Evento aprovado!', 'success');
  };

  const handleReject = (id: string) => {
    updateEventStatus(id, EventStatus.REJECTED);
    setModalOpen(false);
    addToast('Evento rejeitado.', 'info');
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este evento?")) {
      deleteEvent(id);
      setModalOpen(false);
      addToast('Evento excluído.', 'info');
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(pickerYear);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setIsDatePickerOpen(false);
  };

  const toggleDatePicker = () => {
    if (!isDatePickerOpen) {
      setPickerYear(currentDate.getFullYear());
    }
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Olá, {currentUser?.name.split(' ')[0]} 👋</h2>
           <p className="text-gray-500">Aqui está a visão geral da agenda.</p>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative z-20">
        <div className="relative">
          <button 
            onClick={toggleDatePicker}
            className="flex items-center gap-3 group hover:bg-gray-50 px-3 py-2 -ml-2 rounded-xl transition-all"
          >
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <CalendarDays size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
            </h1>
            <ChevronDown 
              size={18} 
              className={`text-gray-400 group-hover:text-indigo-600 transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {isDatePickerOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 w-80 animate-in fade-in zoom-in-95 duration-200 origin-top-left ring-1 ring-black ring-opacity-5">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <button 
                  onClick={(e) => { e.stopPropagation(); setPickerYear(y => y - 1); }} 
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-bold text-lg text-gray-800">{pickerYear}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setPickerYear(y => y + 1); }} 
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, idx) => (
                  <button
                    key={month}
                    onClick={(e) => { e.stopPropagation(); handleMonthSelect(idx); }}
                    className={`
                      py-2 text-sm rounded-lg transition font-medium
                      ${currentDate.getMonth() === idx && currentDate.getFullYear() === pickerYear 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}
                    `}
                  >
                    {month.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200/50">
          <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">
            Hoje
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {weekDays.map(day => (
            <div key={day} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr bg-gray-100 gap-px border-gray-100">
          {calendarDays.map((day, idx) => {
            const dayEvents = getDayEvents(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                onDoubleClick={() => handleDayDoubleClick(day)}
                className={`
                  min-h-[140px] p-2 transition-all relative group flex flex-col gap-1
                  ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'}
                  ${(isCommon || isAdmin) && isCurrentMonth ? 'hover:bg-gray-50 cursor-pointer' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`
                    text-sm font-semibold rounded-full w-8 h-8 flex items-center justify-center transition-all
                    ${isToday 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                        : isCurrentMonth ? 'text-gray-700 group-hover:bg-gray-200/50' : 'text-gray-300'}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  {(isCommon || isAdmin) && (
                    <button 
                      onClick={(e) => {
                         e.stopPropagation();
                         handleDayDoubleClick(day);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-indigo-500 hover:bg-indigo-50 p-1.5 rounded-full transition-all md:hidden" 
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(e, event)}
                      className={`
                        group/card flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border shadow-sm hover:shadow-md
                        ${event.status === EventStatus.APPROVED 
                            ? 'bg-green-50 text-green-700 border-green-100 hover:border-green-300' 
                            : event.status === EventStatus.REJECTED 
                                ? 'bg-red-50 text-red-700 border-red-100 line-through opacity-60' 
                                : 'bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-300'
                        }
                      `}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          event.status === EventStatus.APPROVED ? 'bg-green-500' : 
                          event.status === EventStatus.REJECTED ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">{event.title}</p>
                          <p className="text-[10px] opacity-80 truncate leading-tight mt-0.5">{event.description}</p>
                      </div>
                      
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(event.id);
                          }}
                          className="opacity-0 group-hover/card:opacity-100 p-1 hover:bg-white rounded-md text-current transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-500 px-4 bg-white py-3 rounded-xl border border-gray-100 shadow-sm w-fit">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div> Pendente</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div> Aprovado</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div> Rejeitado</div>
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedDate={selectedDay}
        existingEvent={selectedEvent}
        onSubmit={handleCreateEvent}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        onEdit={handleEditEvent}
      />
    </div>
  );
};

export default Dashboard;