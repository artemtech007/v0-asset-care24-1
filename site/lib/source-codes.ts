export interface SourceCodeParams {
  source: 'WB' | 'QR';           // Только 2 источника для MVP
  userType: 'C' | 'M';           // Клиент или мастер
  clientType: 'C' | 'P' | '0';   // Тип клиента (0 для мастеров)
  code: string;                  // 5-ти значный код (00000 по умолчанию)
}

export function generateSourceCode(params: SourceCodeParams): string {
  return `||-R-${params.source}-${params.userType}-${params.clientType}-${params.code.padStart(5, '0')}-||`;
}

// Немецкий текст с приветствием для защиты кода
const GERMAN_PROTECTION_TEXT = `Hallo! Bitte senden Sie diese Nachricht mit dem Registrierungscode, ohne ihn zu bearbeiten!

{CODE}

Danke!`;

export function generateWhatsAppLink(phone: string, params: SourceCodeParams): string {
  const sourceCode = generateSourceCode(params);
  const fullMessage = GERMAN_PROTECTION_TEXT.replace('{CODE}', sourceCode);

  return `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
}

// Предустановленные коды для всех кнопок сайта
export const SITE_BUTTON_CODES = {
  // Главная страница - кнопка "JETZT ANFRAGE STELLEN"
  mainHeroButton: {
    source: 'WB' as const,
    userType: 'C' as const,
    clientType: 'P' as const,
    code: '0000S' // S = Startseite
  },

  // Страница услуг - кнопка "Jetzt über WhatsApp anfragen"
  servicesButton: {
    source: 'WB' as const,
    userType: 'C' as const,
    clientType: 'P' as const,
    code: '0000L' // L = Leistungen
  },

  // Регистрация мастера - кнопка "Registrieren"
  masterRegistrationButton: {
    source: 'WB' as const,
    userType: 'M' as const,
    clientType: '0' as const,
    code: '00000' // По умолчанию для новых мастеров
  },

  // Регистрация фирмы - кнопка "Registrierung abschließen"
  companyRegistrationButton: {
    source: 'WB' as const,
    userType: 'F' as const, // F = Firma (фирма)
    clientType: '0' as const, // 0 = нет специального типа клиента
    code: '00000' // По умолчанию для новых фирм
  }
};

// QR-коды для тестирования
export const QR_CODES = {
  publicClient: {
    source: 'QR' as const,
    userType: 'C' as const,
    clientType: 'P' as const,
    code: '00000'
  },

  contractClient1: {
    source: 'QR' as const,
    userType: 'C' as const,
    clientType: 'C' as const,
    code: '00001'
  },

  contractClient2: {
    source: 'QR' as const,
    userType: 'C' as const,
    clientType: 'C' as const,
    code: '00002'
  },

  contractWorker1: {
    source: 'QR' as const,
    userType: 'M' as const,
    clientType: 'C' as const,
    code: '00001' // Работник, обслуживающий контракт 00001
  }
};

// Удобные функции для генерации ссылок с предустановленными кодами
export const generateMainHeroLink = (phone: string) =>
  generateWhatsAppLink(phone, SITE_BUTTON_CODES.mainHeroButton);

export const generateServicesLink = (phone: string) =>
  generateWhatsAppLink(phone, SITE_BUTTON_CODES.servicesButton);

export const generateMasterRegistrationLink = (phone: string) =>
  generateWhatsAppLink(phone, SITE_BUTTON_CODES.masterRegistrationButton);

export const generateCompanyRegistrationLink = (phone: string) =>
  generateWhatsAppLink(phone, SITE_BUTTON_CODES.companyRegistrationButton);

export const generatePublicQRLink = (phone: string) =>
  generateWhatsAppLink(phone, QR_CODES.publicClient);

export const generateContractQR1Link = (phone: string) =>
  generateWhatsAppLink(phone, QR_CODES.contractClient1);

export const generateContractQR2Link = (phone: string) =>
  generateWhatsAppLink(phone, QR_CODES.contractClient2);

export const generateContractWorker1Link = (phone: string) =>
  generateWhatsAppLink(phone, QR_CODES.contractWorker1);
