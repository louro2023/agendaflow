/**
 * Serviço de Branding - Gerencia a logo e configurações visuais do sistema
 * Armazena em localStorage e Firebase Realtime Database
 */

import { ref, set, get, child } from 'firebase/database';
import { database } from './firebase';

const STORAGE_KEY = 'agenda_logo';
const DB_PATH = 'branding';

export interface BrandingConfig {
  logoUrl: string;
  appName: string;
  appVersion: string;
  timestamp: number;
}

export class BrandingService {
  /**
   * Salva a logo (em base64) localmente e no Firebase
   */
  static async saveLogo(logoBase64: string, appName: string = 'Agenda ADNI ITAIPU'): Promise<void> {
    const config: BrandingConfig = {
      logoUrl: logoBase64,
      appName,
      appVersion: '2.0 ADNI ITAIPU',
      timestamp: Date.now(),
    };

    // Salvar em localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    // Salvar no Firebase
    try {
      const brandingRef = ref(database, DB_PATH);
      await set(brandingRef, config);
    } catch (error) {
      console.warn('Aviso ao salvar branding no Firebase:', error);
      // Continua mesmo se falhar no Firebase, usa localStorage como fallback
    }
  }

  /**
   * Carrega a logo salva
   */
  static async getLogo(): Promise<BrandingConfig | null> {
    // Tentar carregar do Firebase primeiro
    try {
      const brandingRef = ref(database, DB_PATH);
      const snapshot = await get(brandingRef);
      
      if (snapshot.exists()) {
        const config = snapshot.val();
        // Salvar em localStorage como cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        return config;
      }
    } catch (error) {
      console.warn('Erro ao carregar branding do Firebase:', error);
    }

    // Fallback para localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Limpa a logo (volta ao padrão)
   */
  static async clearLogo(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    
    try {
      const brandingRef = ref(database, DB_PATH);
      await set(brandingRef, null);
    } catch (error) {
      console.warn('Erro ao limpar branding:', error);
    }
  }

  /**
   * Converte arquivo para base64
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Valida o arquivo de imagem
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande (máximo 2MB)' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Formato não suportado (PNG, JPEG, SVG ou WebP)' };
    }

    return { valid: true };
  }
}
