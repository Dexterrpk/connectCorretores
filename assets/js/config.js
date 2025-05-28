// config.js - Configuração do Firebase
// Este arquivo contém as configurações do Firebase para o Connect Corretores

// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBIhkg9kqxMqep1gixoI7mkCo6b3j9DnoI",
    authDomain: "connectcorretores-70cec.firebaseapp.com",
    projectId: "connectcorretores-70cec",
    storageBucket: "connectcorretores-70cec.firebasestorage.app",
    messagingSenderId: "272445820844",
    appId: "1:272445820844:web:5b7fcd6495d9016767f409",
    measurementId: "G-M8HKBE7EC7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Configurações adicionais
const appConfig = {
    name: "Connect Corretores",
    version: "1.0.0",
    environment: "production", // ou "development"
    features: {
        analytics: true,
        notifications: true,
        imageUpload: true,
        multipleImages: true,
        maxImagesPerProperty: 10,
        maxImageSize: 5 * 1024 * 1024, // 5MB
        supportedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    },
    ui: {
        theme: "modern",
        primaryColor: "#667eea",
        secondaryColor: "#764ba2",
        maxItemsPerPage: 12,
        animationDuration: 300
    },
    validation: {
        minPasswordLength: 6,
        maxPropertyTitleLength: 100,
        maxPropertyDescriptionLength: 1000,
        minPropertyPrice: 1000,
        maxPropertyPrice: 10000000,
        minPropertyArea: 1,
        maxPropertyArea: 10000
    }
};

// Mensagens de erro traduzidas
const errorMessages = {
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/email-already-in-use': 'Este email já está em uso.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/invalid-email': 'Email inválido.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/user-disabled': 'Esta conta foi desabilitada.',
    'auth/invalid-credential': 'Credenciais inválidas.',
    'auth/missing-password': 'Senha é obrigatória.',
    'auth/invalid-login-credentials': 'Email ou senha incorretos.',
    'storage/unauthorized': 'Não autorizado a fazer upload.',
    'storage/canceled': 'Upload cancelado.',
    'storage/unknown': 'Erro desconhecido no upload.',
    'storage/object-not-found': 'Arquivo não encontrado.',
    'storage/bucket-not-found': 'Bucket não encontrado.',
    'storage/project-not-found': 'Projeto não encontrado.',
    'storage/quota-exceeded': 'Cota de armazenamento excedida.',
    'storage/unauthenticated': 'Usuário não autenticado.',
    'storage/retry-limit-exceeded': 'Limite de tentativas excedido.',
    'storage/invalid-checksum': 'Checksum inválido.',
    'storage/canceled': 'Operação cancelada.',
    'storage/invalid-event-name': 'Nome de evento inválido.',
    'storage/invalid-url': 'URL inválida.',
    'storage/invalid-argument': 'Argumento inválido.',
    'storage/no-default-bucket': 'Bucket padrão não configurado.',
    'storage/cannot-slice-blob': 'Erro ao processar arquivo.',
    'storage/server-file-wrong-size': 'Tamanho do arquivo incorreto.'
};

// Coleções do Firestore
const collections = {
    users: 'users',
    properties: 'properties',
    messages: 'messages',
    favorites: 'favorites',
    views: 'views',
    reports: 'reports'
};

// Utilitários
const utils = {
    // Função para obter mensagem de erro
    getErrorMessage: (errorCode) => {
        return errorMessages[errorCode] || 'Erro desconhecido. Tente novamente.';
    },

    // Validações
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone: (phone) => {
        const re = /^[\d\s\-\(\)\+]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    validatePassword: (password) => {
        return password && password.length >= appConfig.validation.minPasswordLength;
    },

    validatePropertyData: (data) => {
        const errors = [];
        
        if (!data.title || data.title.length > appConfig.validation.maxPropertyTitleLength) {
            errors.push('Título inválido');
        }
        
        if (!data.price || data.price < appConfig.validation.minPropertyPrice || data.price > appConfig.validation.maxPropertyPrice) {
            errors.push('Preço inválido');
        }
        
        if (!data.area || data.area < appConfig.validation.minPropertyArea || data.area > appConfig.validation.maxPropertyArea) {
            errors.push('Área inválida');
        }
        
        if (data.description && data.description.length > appConfig.validation.maxPropertyDescriptionLength) {
            errors.push('Descrição muito longa');
        }
        
        return errors;
    },

    // Formatações
    formatCurrency: (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    formatNumber: (value) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    },

    formatDate: (date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },

    // Máscaras
    phoneMask: (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value;
    },

    // Utilitários de arquivo
    isValidImageType: (file) => {
        return appConfig.features.supportedImageTypes.includes(file.type);
    },

    isValidImageSize: (file) => {
        return file.size <= appConfig.features.maxImageSize;
    },

    // Gerar ID único
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce para otimizar pesquisas
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Logging para debug
    log: (message, type = 'info') => {
        if (appConfig.environment === 'development') {
            console[type](`[Connect Corretores] ${message}`);
        }
    },

    // Analytics helper
    trackEvent: (eventName, parameters = {}) => {
        if (appConfig.features.analytics && analytics) {
            // Implementar tracking de eventos
            console.log('Analytics Event:', eventName, parameters);
        }
    }
};

// Exportar configurações e utilitários
export {
    app,
    auth,
    db,
    storage,
    analytics,
    appConfig,
    collections,
    utils,
    firebaseConfig
};

// Log de inicialização
utils.log('Firebase configurado com sucesso!');
utils.log(`Ambiente: ${appConfig.environment}`);
utils.log(`Versão: ${appConfig.version}`);
