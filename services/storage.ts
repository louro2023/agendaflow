import { EventRequest, User, UserRole } from '../types';

// Firebase imports
import { database, ref, get, set, push, remove, update, onValue } from './firebase';

const USE_FIREBASE = true; // Firebase habilitado para sincronização em tempo real
const API_BASE = 'http://localhost:3001/api';

export type Unsubscribe = () => void;

// --- FALLBACK PARA DADOS LOCAIS ---
const LOCAL_USERS_KEY = 'eventflow_users';
const LOCAL_EVENTS_KEY = 'eventflow_events';

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@demo.com',
    password: '123',
    role: UserRole.ADMIN,
    active: true,
  },
  {
    id: '2',
    name: 'Usuário Comum',
    email: 'user@demo.com',
    password: '123',
    role: UserRole.COMMON,
    active: true,
  },
  {
    id: '3',
    name: 'Visualizador',
    email: 'viewer@demo.com',
    password: '123',
    role: UserRole.VIEWER,
    active: true,
  },
];

// --- FUNÇÕES DE CACHE LOCAL (FALLBACK) ---
export const getLocalUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn("Erro ao ler users do localStorage", e);
    return [];
  }
};

export const getLocalEvents = (): EventRequest[] => {
  try {
    const stored = localStorage.getItem(LOCAL_EVENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn("Erro ao ler events do localStorage", e);
    return [];
  }
};

export const saveLocalUsers = (users: User[]) => {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn("Erro ao salvar users no localStorage", e);
  }
};

export const saveLocalEvents = (events: EventRequest[]) => {
  try {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn("Erro ao salvar events no localStorage", e);
  }
};


// --- FUNÇÕES DO FIREBASE (SÍNCRONAS EM TEMPO REAL) ---

/**
 * Carrega dados iniciais do Firebase Realtime Database
 */
export const fetchInitialData = (): Promise<{ users: User[]; events: EventRequest[] }> => {
  return new Promise(async (resolve) => {
    try {
      // Carrega usuários do Firebase
      const usersSnapshot = await get(ref(database, 'users'));
      const users = usersSnapshot.exists() ? Object.values(usersSnapshot.val()) : initialUsers;

      // Carrega eventos do Firebase
      const eventsSnapshot = await get(ref(database, 'events'));
      const events = eventsSnapshot.exists() ? Object.values(eventsSnapshot.val()) : [];

      // Salva cache local
      saveLocalUsers(users as User[]);
      saveLocalEvents(events as EventRequest[]);

      console.log('✅ Dados carregados do Firebase:', { users: users.length, events: events.length });
      resolve({ users: users as User[], events: events as EventRequest[] });
    } catch (error) {
      console.warn('⚠️ Erro ao carregar do Firebase, usando dados locais:', error);
      
      // Fallback para dados locais
      const localUsers = getLocalUsers();
      const localEvents = getLocalEvents();
      const users = localUsers.length > 0 ? localUsers : initialUsers;
      
      if (localUsers.length === 0) {
        saveLocalUsers(users);
      }

      console.log('✅ Usando dados locais:', { users: users.length, events: localEvents.length });
      resolve({ users, events: localEvents });
    }
  });
};

/**
 * Monitora atualizações em tempo real dos usuários
 */
export const subscribeToUsers = (callback: (users: User[]) => void): Unsubscribe => {
  try {
    const unsubscribe = onValue(
      ref(database, 'users'),
      (snapshot) => {
        if (snapshot.exists()) {
          const usersData = Object.values(snapshot.val()) as User[];
          saveLocalUsers(usersData);
          callback(usersData);
          console.log('🔄 Usuários atualizados do Firebase:', usersData.length);
        }
      },
      (error) => {
        console.warn('⚠️ Erro ao monitorar usuários:', error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('⚠️ Erro ao configurar listener de usuários:', error);
    return () => {};
  }
};

/**
 * Monitora atualizações em tempo real dos eventos
 */
export const subscribeToEvents = (callback: (events: EventRequest[]) => void): Unsubscribe => {
  try {
    const unsubscribe = onValue(
      ref(database, 'events'),
      (snapshot) => {
        if (snapshot.exists()) {
          const eventsData = Object.values(snapshot.val()) as EventRequest[];
          saveLocalEvents(eventsData);
          callback(eventsData);
          console.log('🔄 Eventos atualizados do Firebase:', eventsData.length);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.warn('⚠️ Erro ao monitorar eventos:', error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('⚠️ Erro ao configurar listener de eventos:', error);
    return () => {};
  }
};

/**
 * Persiste usuários no Firebase Realtime Database
 */
export const persistUsers = (users: User[]): Promise<boolean> => {
  // Sempre salva localmente primeiro
  saveLocalUsers(users);

  return new Promise(async (resolve) => {
    try {
      // Converte array em objeto com IDs como chaves
      const usersObj = users.reduce((acc, user) => (
        {
          ...acc,
          [user.id]: user
        }
      ), {});

      await set(ref(database, 'users'), usersObj);
      console.log('✅ Usuários salvos no Firebase');
      resolve(true);
    } catch (error) {
      console.warn('⚠️ Erro ao salvar usuários no Firebase:', error);
      resolve(true);
    }
  });
};

/**
 * Persiste eventos no Firebase Realtime Database
 */
export const persistEvents = (events: EventRequest[]): Promise<boolean> => {
  // Sempre salva localmente primeiro
  saveLocalEvents(events);

  return new Promise(async (resolve) => {
    try {
      // Converte array em objeto com IDs como chaves
      const eventsObj = events.reduce((acc, event) => (
        {
          ...acc,
          [event.id]: event
        }
      ), {});

      await set(ref(database, 'events'), eventsObj);
      console.log('✅ Eventos salvos no Firebase');
      resolve(true);
    } catch (error) {
      console.warn('⚠️ Erro ao salvar eventos no Firebase:', error);
      resolve(true);
    }
  });
};

/**
 * Atualiza um evento específico
 */
export const updateEvent = (eventId: string, updates: Partial<EventRequest>): Promise<boolean> => {
  return new Promise((resolve) => {
    fetch(`${API_BASE}/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
      .then(() => {
        console.log('✅ Evento atualizado no servidor');
        resolve(true);
      })
      .catch(() => {
        console.warn('⚠️ Erro ao atualizar evento');
        resolve(true);
      });
  });
};

/**
 * Atualiza um usuário específico
 */
export const updateUser = (userId: string, updates: Partial<User>): Promise<boolean> => {
  return new Promise((resolve) => {
    fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
      .then(() => {
        console.log('✅ Usuário atualizado no servidor');
        resolve(true);
      })
      .catch(() => {
        console.warn('⚠️ Erro ao atualizar usuário');
        resolve(true);
      });
  });
};