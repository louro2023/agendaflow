import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EventRequest, User, EventStatus } from '../types';
import { 
  fetchInitialData, 
  persistEvents, 
  persistUsers, 
  getLocalEvents, 
  getLocalUsers,
  subscribeToEvents,
  subscribeToUsers
} from '../services/storage';

interface DataContextType {
  events: EventRequest[];
  users: User[];
  loading: boolean;
  addEvent: (event: Omit<EventRequest, 'id' | 'status'>) => void;
  updateEventStatus: (id: string, status: EventStatus) => void;
  updateEventDetails: (id: string, title: string, description: string) => void;
  deleteEvent: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  toggleUserStatus: (id: string) => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state synchronously from localStorage cache
  const [events, setEvents] = useState<EventRequest[]>(() => getLocalEvents());
  const [users, setUsers] = useState<User[]>(() => getLocalUsers());
  const [loading, setLoading] = useState(false);

  // Efeito para carregar dados iniciais e configurar listeners em tempo real
  useEffect(() => {
    loadServerData();
    
    // Retorna função de cleanup
    return () => {
      // Listeners serão desinscritos aqui se necessário
    };
  }, []);

  const loadServerData = async () => {
    if (events.length === 0 && users.length === 0) {
      setLoading(true);
    }

    try {
      const data = await fetchInitialData();
      setEvents(data.events);
      setUsers(data.users);

      // Depois que os dados iniciais são carregados, subscribe para atualizações em tempo real
      const unsubscribeEvents = subscribeToEvents((updatedEvents) => {
        console.log('🔄 Eventos atualizados em tempo real:', updatedEvents.length);
        setEvents(updatedEvents);
      });

      const unsubscribeUsers = subscribeToUsers((updatedUsers) => {
        console.log('🔄 Usuários atualizados em tempo real:', updatedUsers.length);
        setUsers(updatedUsers);
      });

      // Cleanup ao desmontar
      return () => {
        unsubscribeEvents();
        unsubscribeUsers();
      };
    } catch (error) {
      console.error("Falha ao sincronizar com servidor. Usando dados locais.", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadServerData();
  };

  // Event Logic
  const addEvent = (newEventData: Omit<EventRequest, 'id' | 'status'>) => {
    const newEvent: EventRequest = {
      ...newEventData,
      id: crypto.randomUUID(),
      status: EventStatus.PENDING,
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents); // Optimistic UI update
    
    // Persist to both local (sync) and server (async)
    // persistEvents helper now handles local save internally too
    persistEvents(updatedEvents).catch(err => {
      console.error("Erro ao salvar evento no servidor", err);
      // Optional: Add UI feedback here if server save fails
    });
  };

  const updateEventStatus = (id: string, status: EventStatus) => {
    const updatedEvents = events.map(e => e.id === id ? { ...e, status } : e);
    setEvents(updatedEvents);
    persistEvents(updatedEvents).catch(err => console.error("Erro ao atualizar status", err));
  };

  const updateEventDetails = (id: string, title: string, description: string) => {
    const updatedEvents = events.map(e => e.id === id ? { ...e, title, description } : e);
    setEvents(updatedEvents);
    persistEvents(updatedEvents).catch(err => console.error("Erro ao atualizar detalhes", err));
  };

  const deleteEvent = (id: string) => {
    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    persistEvents(updatedEvents).catch(err => console.error("Erro ao deletar evento", err));
  }

  // User Logic
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    persistUsers(updatedUsers).catch(err => console.error("Erro ao criar usuário", err));
  };

  const updateUser = (userToUpdate: User) => {
    const updatedUsers = users.map(u => u.id === userToUpdate.id ? userToUpdate : u);
    setUsers(updatedUsers);
    persistUsers(updatedUsers).catch(err => console.error("Erro ao atualizar usuário", err));
  };

  const toggleUserStatus = (id: string) => {
    const updatedUsers = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    setUsers(updatedUsers);
    persistUsers(updatedUsers).catch(err => console.error("Erro ao alterar status usuário", err));
  };

  return (
    <DataContext.Provider value={{
      events,
      users,
      loading,
      addEvent,
      updateEventStatus,
      updateEventDetails,
      deleteEvent,
      addUser,
      updateUser,
      toggleUserStatus,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};