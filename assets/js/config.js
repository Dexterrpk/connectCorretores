// Configuração do Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);

// Referências para serviços do Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

/**
 * Função para verificar o estado de autenticação do usuário
 * @param {Function} callback - Função a ser executada após verificação
 */
function checkAuthState(callback) {
  auth.onAuthStateChanged(user => {
    if (callback) callback(user);
  });
}

/**
 * Função para obter o usuário atual
 * @returns {Object|null} Objeto do usuário atual ou null se não estiver autenticado
 */
function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Função para obter o ID do usuário atual
 * @returns {String|null} ID do usuário atual ou null se não estiver autenticado
 */
function getCurrentUserId() {
  const user = getCurrentUser();
  return user ? user.uid : null;
}

/**
 * Função para obter referência à coleção de usuários
 * @returns {Object} Referência à coleção de usuários no Firestore
 */
function getUsersCollection() {
  return db.collection('users');
}

/**
 * Função para obter referência à coleção de imóveis
 * @returns {Object} Referência à coleção de imóveis no Firestore
 */
function getPropertiesCollection() {
  return db.collection('properties');
}

/**
 * Função para obter referência à coleção de imóveis pendentes
 * @returns {Object} Referência à coleção de imóveis pendentes no Firestore
 */
function getPendingPropertiesCollection() {
  return db.collection('pendingProperties');
}

/**
 * Função para obter referência à coleção de mensagens
 * @returns {Object} Referência à coleção de mensagens no Firestore
 */
function getMessagesCollection() {
  return db.collection('messages');
}

/**
 * Função para obter referência ao storage de imagens de imóveis
 * @param {String} userId - ID do usuário
 * @returns {Object} Referência ao storage de imagens de imóveis
 */
function getPropertyImagesStorage(userId) {
  return storage.ref(`users/${userId}/properties`);
}

/**
 * Função para obter referência ao storage de imagens de perfil
 * @param {String} userId - ID do usuário
 * @returns {Object} Referência ao storage de imagens de perfil
 */
function getProfileImagesStorage(userId) {
  return storage.ref(`users/${userId}/profile`);
}

/**
 * Função para obter referência ao storage de logos
 * @param {String} userId - ID do usuário
 * @returns {Object} Referência ao storage de logos
 */
function getLogoStorage(userId) {
  return storage.ref(`users/${userId}/logo`);
}

/**
 * Função para formatar timestamp do Firestore para data legível
 * @param {Object} timestamp - Timestamp do Firestore
 * @returns {String} Data formatada
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Função para formatar preço em formato de moeda brasileira
 * @param {Number} price - Valor a ser formatado
 * @returns {String} Valor formatado
 */
function formatCurrency(price) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

/**
 * Função para formatar área em metros quadrados
 * @param {Number} area - Área em metros quadrados
 * @returns {String} Área formatada
 */
function formatArea(area) {
  return `${area} m²`;
}

// Exportação das funções para uso em outros arquivos
window.firebaseHelper = {
  auth,
  db,
  storage,
  checkAuthState,
  getCurrentUser,
  getCurrentUserId,
  getUsersCollection,
  getPropertiesCollection,
  getPendingPropertiesCollection,
  getMessagesCollection,
  getPropertyImagesStorage,
  getProfileImagesStorage,
  getLogoStorage,
  formatTimestamp,
  formatCurrency,
  formatArea
};
