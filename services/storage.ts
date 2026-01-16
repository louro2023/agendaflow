import { EventRequest, User, UserRole } from '../types';

// --- CONFIGURAÇÃO DA API ---
const API_URL = 'http://localhost:3001/api';

// Tipagem para o objeto global 'google' do Apps Script
declare global {
  interface Window {
    google?: {
      script: {
        run: {
          withSuccessHandler: (callback: (data: any) => void) => {
            withFailureHandler: (callback: (error: any) => void) => any;
          };
          [key: string]: any;
        };
      };
    };
  }
}

// --- DADOS MOCK PARA DESENVOLVIMENTO LOCAL (FALLBACK) ---
const LOCAL_USERS_KEY = 'eventflow_users';
const LOCAL_EVENTS_KEY = 'eventflow_events';

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Administrador (Local)',
    email: 'admin@demo.com',
    password: '123',
    role: UserRole.ADMIN,
    active: true,
  },
  {
    id: '2',
    name: 'Usuário Comum (Local)',
    email: 'user@demo.com',
    password: '123',
    role: UserRole.COMMON,
    active: true,
  },
  {
    id: '3',
    name: 'Visualizador (Local)',
    email: 'viewer@demo.com',
    password: '123',
    role: UserRole.VIEWER,
    active: true,
  },
];

// Helper para verificar se estamos no ambiente Apps Script
const isGasEnvironment = () => {
  return typeof window !== 'undefined' && window.google && window.google.script;
};

// --- NOVAS FUNÇÕES SÍNCRONAS PARA CACHE LOCAL ---

export const getLocalUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    return stored ? JSON.parse(stored) : []; // Retorna vazio se não tiver, o contexto lidará com isso
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


// --- FUNÇÕES DA API (ASSÍNCRONAS) ---

export const fetchInitialData = (): Promise<{ users: User[], events: EventRequest[] }> => {
  return new Promise((resolve, reject) => {
    if (isGasEnvironment()) {
      // Chama função do Backend (Code.gs)
      window.google!.script.run
        .withSuccessHandler((data: { users: User[], events: EventRequest[] }) => {
          console.log('Dados carregados do servidor:', data);
          // Atualiza o cache local assim que o servidor responder
          saveLocalUsers(data.users);
          saveLocalEvents(data.events);
          resolve(data);
        })
        .withFailureHandler((error: any) => {
          console.error('Erro ao carregar dados do servidor:', error);
          reject(error);
        })
        .getBackendData();
    } else {
      // Tenta carregar do servidor Node.js primeiro
      fetch(`${API_URL}/sync`)
        .then(res => res.json())
        .then(data => {
          console.log('Dados sincronizados do servidor:', data);
          saveLocalUsers(data.users);
          saveLocalEvents(data.events);
          resolve(data);
        })
        .catch(err => {
          console.warn('Servidor indisponível, usando dados locais:', err);
          // Fallback para dados locais se servidor não responder
          const localUsers = getLocalUsers();
          const localEvents = getLocalEvents();
          const users = localUsers.length > 0 ? localUsers : initialUsers;
          const events = localEvents;
          
          if (localUsers.length === 0) saveLocalUsers(users);
          resolve({ users, events });
        });
    }
  });
};

export const persistUsers = (users: User[]): Promise<boolean> => {
  // Sempre salva localmente primeiro para garantir UI otimista
  saveLocalUsers(users);

  return new Promise((resolve, reject) => {
    if (isGasEnvironment()) {
      window.google!.script.run
        .withSuccessHandler(() => resolve(true))
        .withFailureHandler((err: any) => reject(err))
        .saveBackendUsers(users);
    } else {
      // Tenta sincronizar com o servidor Node.js
      fetch(`${API_URL}/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users)
      })
        .then(res => res.json())
        .then(() => {
          console.log('Usuários sincronizados com servidor');
          resolve(true);
        })
        .catch(err => {
          console.warn('Erro ao sincronizar usuários, mantendo dados locais:', err);
          // Mesmo com erro de servidor, os dados estão salvos localmente
          resolve(true);
        });
    }
  });
};

export const persistEvents = (events: EventRequest[]): Promise<boolean> => {
  // Sempre salva localmente primeiro
  saveLocalEvents(events);

  return new Promise((resolve, reject) => {
    if (isGasEnvironment()) {
      window.google!.script.run
        .withSuccessHandler(() => resolve(true))
        .withFailureHandler((err: any) => reject(err))
        .saveBackendEvents(events);
    } else {
      // Tenta sincronizar com o servidor Node.js
      fetch(`${API_URL}/events`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events)
      })
        .then(res => res.json())
        .then(() => {
          console.log('Eventos sincronizados com servidor');
          resolve(true);
        })
        .catch(err => {
          console.warn('Erro ao sincronizar eventos, mantendo dados locais:', err);
          // Mesmo com erro de servidor, os dados estão salvos localmente
          resolve(true);
        });
    }
  });
};