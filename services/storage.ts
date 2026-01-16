import { EventRequest, User, UserRole } from '../types';
import { 
  database, 
  ref, 
  get, 
  set, 
  update, 
  onValue, 
  Unsubscribe 
} from './firebase';

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
 * Carrega dados iniciais do Firebase
 * Se Firebase não estiver disponível, usa dados locais como fallback
 */
export const fetchInitialData = (): Promise<{ users: User[]; events: EventRequest[] }> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tenta carregar do Firebase
      const usersRef = ref(database, 'users');
      const eventsRef = ref(database, 'events');

      const usersSnapshot = await get(usersRef);
      const eventsSnapshot = await get(eventsRef);

      let users: User[] = [];
      let events: EventRequest[] = [];

      if (usersSnapshot.exists()) {
        const data = usersSnapshot.val();
        users = Array.isArray(data) ? data : Object.values(data);
      } else {
        // Se não existir no Firebase, usa dados iniciais
        users = initialUsers;
        await set(usersRef, users);
      }

      if (eventsSnapshot.exists()) {
        const data = eventsSnapshot.val();
        events = Array.isArray(data) ? data : Object.values(data);
      }

      // Atualiza cache local
      saveLocalUsers(users);
      saveLocalEvents(events);

      console.log('✅ Dados carregados do Firebase:', { users: users.length, events: events.length });
      resolve({ users, events });
    } catch (error) {
      console.error('❌ Erro ao carregar do Firebase:', error);
      
      // Fallback para dados locais
      const localUsers = getLocalUsers();
      const localEvents = getLocalEvents();
      const users = localUsers.length > 0 ? localUsers : initialUsers;
      const events = localEvents;

      if (localUsers.length === 0) {
        saveLocalUsers(users);
      }

      resolve({ users, events });
    }
  });
};

/**
 * Monitora atualizações em tempo real dos usuários
 */
export const subscribeToUsers = (callback: (users: User[]) => void): Unsubscribe => {
  try {
    const usersRef = ref(database, 'users');
    return onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const users = Array.isArray(data) ? data : Object.values(data);
        saveLocalUsers(users);
        callback(users);
      }
    });
  } catch (error) {
    console.error('Erro ao inscrever em usuários:', error);
    return () => {};
  }
};

/**
 * Monitora atualizações em tempo real dos eventos
 */
export const subscribeToEvents = (callback: (events: EventRequest[]) => void): Unsubscribe => {
  try {
    const eventsRef = ref(database, 'events');
    return onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const events = Array.isArray(data) ? data : Object.values(data);
        saveLocalEvents(events);
        callback(events);
      }
    });
  } catch (error) {
    console.error('Erro ao inscrever em eventos:', error);
    return () => {};
  }
};

/**
 * Persiste usuários no Firebase
 */
export const persistUsers = (users: User[]): Promise<boolean> => {
  // Sempre salva localmente primeiro
  saveLocalUsers(users);

  return new Promise((resolve) => {
    try {
      const usersRef = ref(database, 'users');
      set(usersRef, users)
        .then(() => {
          console.log('✅ Usuários salvos no Firebase');
          resolve(true);
        })
        .catch((err) => {
          console.warn('⚠️ Erro ao salvar usuários no Firebase:', err);
          // Mesmo com erro, dados estão salvos localmente
          resolve(true);
        });
    } catch (error) {
      console.error('Erro ao persistir usuários:', error);
      resolve(true); // Dados estão salvos localmente
    }
  });
};

/**
 * Persiste eventos no Firebase
 */
export const persistEvents = (events: EventRequest[]): Promise<boolean> => {
  // Sempre salva localmente primeiro
  saveLocalEvents(events);

  return new Promise((resolve) => {
    try {
      const eventsRef = ref(database, 'events');
      set(eventsRef, events)
        .then(() => {
          console.log('✅ Eventos salvos no Firebase');
          resolve(true);
        })
        .catch((err) => {
          console.warn('⚠️ Erro ao salvar eventos no Firebase:', err);
          // Mesmo com erro, dados estão salvos localmente
          resolve(true);
        });
    } catch (error) {
      console.error('Erro ao persistir eventos:', error);
      resolve(true); // Dados estão salvos localmente
    }
  });
};

/**
 * Atualiza um evento específico
 */
export const updateEvent = (eventId: string, updates: Partial<EventRequest>): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const eventRef = ref(database, `events/${eventId}`);
      update(eventRef, updates)
        .then(() => {
          console.log('✅ Evento atualizado no Firebase');
          resolve(true);
        })
        .catch((err) => {
          console.warn('⚠️ Erro ao atualizar evento:', err);
          resolve(true);
        });
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      resolve(true);
    }
  });
};

/**
 * Atualiza um usuário específico
 */
export const updateUser = (userId: string, updates: Partial<User>): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      update(userRef, updates)
        .then(() => {
          console.log('✅ Usuário atualizado no Firebase');
          resolve(true);
        })
        .catch((err) => {
          console.warn('⚠️ Erro ao atualizar usuário:', err);
          resolve(true);
        });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      resolve(true);
    }
  });
};