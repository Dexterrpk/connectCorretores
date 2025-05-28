/**
 * ImobConnect - Sistema para Corretores de Imóveis
 * Módulo de Autenticação
 */

// Referências aos elementos do DOM relacionados à autenticação
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const mobileLoginBtn = document.getElementById('mobile-login-btn');
const mobileRegisterBtn = document.getElementById('mobile-register-btn');
const logoutBtn = document.getElementById('logout-btn');
const userProfile = document.getElementById('user-profile');
const userName = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const goToRegister = document.getElementById('go-to-register');
const goToLogin = document.getElementById('go-to-login');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLogin = document.getElementById('back-to-login');
const ctaRegisterBtn = document.getElementById('cta-register-btn');

/**
 * Inicializa o módulo de autenticação
 */
function initAuth() {
  // Verifica o estado de autenticação do usuário ao carregar a página
  firebaseHelper.checkAuthState(handleAuthStateChanged);
  
  // Adiciona listeners aos formulários e botões
  addAuthListeners();
}

/**
 * Adiciona event listeners aos elementos de autenticação
 */
function addAuthListeners() {
  // Formulários
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  
  // Botões de navegação
  if (loginBtn) loginBtn.addEventListener('click', () => navigateTo('login-page'));
  if (registerBtn) registerBtn.addEventListener('click', () => navigateTo('register-page'));
  if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', () => {
    navigateTo('login-page');
    toggleMobileMenu();
  });
  if (mobileRegisterBtn) mobileRegisterBtn.addEventListener('click', () => {
    navigateTo('register-page');
    toggleMobileMenu();
  });
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  // Links de navegação entre páginas de autenticação
  if (goToRegister) goToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('register-page');
  });
  if (goToLogin) goToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('login-page');
  });
  if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('forgot-password-page');
  });
  if (backToLogin) backToLogin.addEventListener('click', () => navigateTo('login-page'));
  if (ctaRegisterBtn) ctaRegisterBtn.addEventListener('click', () => navigateTo('register-page'));
  
  // Toggle de visibilidade de senha
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', togglePasswordVisibility);
  });
}

/**
 * Manipula o evento de login
 * @param {Event} e - Evento de submit do formulário
 */
function handleLogin(e) {
  e.preventDefault();
  
  // Exibe overlay de carregamento
  showLoading();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const rememberMe = document.getElementById('remember-me').checked;
  
  // Define a persistência com base na opção "Lembrar-me"
  const persistence = rememberMe ? 
    firebase.auth.Auth.Persistence.LOCAL : 
    firebase.auth.Auth.Persistence.SESSION;
  
  firebaseHelper.auth.setPersistence(persistence)
    .then(() => {
      return firebaseHelper.auth.signInWithEmailAndPassword(email, password);
    })
    .then(userCredential => {
      // Login bem-sucedido
      hideLoading();
      showToast('success', 'Login realizado com sucesso!', 'Bem-vindo de volta.');
      navigateTo('dashboard-page');
    })
    .catch(error => {
      // Erro no login
      hideLoading();
      handleAuthError(error);
    });
}

/**
 * Manipula o evento de registro
 * @param {Event} e - Evento de submit do formulário
 */
function handleRegister(e) {
  e.preventDefault();
  
  // Exibe overlay de carregamento
  showLoading();
  
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const phone = document.getElementById('register-phone').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const termsAgree = document.getElementById('terms-agree').checked;
  
  // Validações
  if (password !== confirmPassword) {
    hideLoading();
    showToast('error', 'Erro no cadastro', 'As senhas não coincidem.');
    return;
  }
  
  if (!termsAgree) {
    hideLoading();
    showToast('error', 'Erro no cadastro', 'Você precisa concordar com os Termos de Uso e Política de Privacidade.');
    return;
  }
  
  // Cria o usuário no Firebase Authentication
  firebaseHelper.auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      
      // Atualiza o perfil do usuário com o nome
      return user.updateProfile({
        displayName: name
      }).then(() => {
        // Cria o documento do usuário no Firestore
        return firebaseHelper.getUsersCollection().doc(user.uid).set({
          name: name,
          email: email,
          phone: phone,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          role: 'broker', // Papel padrão: corretor
          customUrl: generateCustomUrl(name),
          settings: {
            theme: 'light',
            primaryColor: '#4a6cf7',
            secondaryColor: '#f97316',
            textColor: '#1e293b',
            profileVisibility: 'public',
            emailNotifications: {
              newMessage: true,
              newProperty: true,
              propertyView: true,
              account: true
            },
            pushNotifications: true
          }
        });
      });
    })
    .then(() => {
      // Registro bem-sucedido
      hideLoading();
      showToast('success', 'Cadastro realizado com sucesso!', 'Bem-vindo ao ImobConnect.');
      navigateTo('dashboard-page');
    })
    .catch(error => {
      // Erro no registro
      hideLoading();
      handleAuthError(error);
    });
}

/**
 * Manipula o evento de recuperação de senha
 * @param {Event} e - Evento de submit do formulário
 */
function handleForgotPassword(e) {
  e.preventDefault();
  
  // Exibe overlay de carregamento
  showLoading();
  
  const email = document.getElementById('forgot-email').value;
  
  firebaseHelper.auth.sendPasswordResetEmail(email)
    .then(() => {
      // E-mail enviado com sucesso
      hideLoading();
      showToast('success', 'E-mail enviado', 'Verifique sua caixa de entrada para redefinir sua senha.');
      navigateTo('login-page');
    })
    .catch(error => {
      // Erro no envio do e-mail
      hideLoading();
      handleAuthError(error);
    });
}

/**
 * Manipula o evento de logout
 */
function handleLogout() {
  // Exibe overlay de carregamento
  showLoading();
  
  firebaseHelper.auth.signOut()
    .then(() => {
      // Logout bem-sucedido
      hideLoading();
      showToast('info', 'Logout realizado', 'Você saiu da sua conta.');
      navigateTo('home-page');
    })
    .catch(error => {
      // Erro no logout
      hideLoading();
      console.error('Erro ao fazer logout:', error);
      showToast('error', 'Erro ao fazer logout', 'Tente novamente mais tarde.');
    });
}

/**
 * Manipula a mudança de estado de autenticação
 * @param {Object|null} user - Objeto do usuário autenticado ou null
 */
function handleAuthStateChanged(user) {
  if (user) {
    // Usuário autenticado
    updateUIForAuthenticatedUser(user);
    loadUserData(user.uid);
  } else {
    // Usuário não autenticado
    updateUIForUnauthenticatedUser();
  }
}

/**
 * Atualiza a interface para usuário autenticado
 * @param {Object} user - Objeto do usuário autenticado
 */
function updateUIForAuthenticatedUser(user) {
  // Atualiza os elementos de UI
  if (loginBtn) loginBtn.classList.add('hidden');
  if (registerBtn) registerBtn.classList.add('hidden');
  if (userProfile) userProfile.classList.remove('hidden');
  
  // Atualiza o nome do usuário
  if (userName) userName.textContent = user.displayName || 'Usuário';
  
  // Atualiza o avatar do usuário (se disponível)
  if (userAvatar && user.photoURL) {
    userAvatar.src = user.photoURL;
  }
  
  // Atualiza os links de navegação mobile
  if (mobileLoginBtn) mobileLoginBtn.parentElement.classList.add('hidden');
  if (mobileRegisterBtn) mobileRegisterBtn.parentElement.classList.add('hidden');
  
  // Adiciona links de dashboard e perfil no menu mobile
  const mobileNavLinks = document.querySelector('.mobile-nav-links');
  if (mobileNavLinks && !document.getElementById('mobile-dashboard-link')) {
    const dashboardLi = document.createElement('li');
    dashboardLi.innerHTML = '<a href="#" id="mobile-dashboard-link" class="nav-link" data-page="dashboard">Painel</a>';
    dashboardLi.querySelector('a').addEventListener('click', () => {
      navigateTo('dashboard-page');
      toggleMobileMenu();
    });
    
    const profileLi = document.createElement('li');
    profileLi.innerHTML = '<a href="#" id="mobile-profile-link" class="nav-link" data-page="profile">Perfil</a>';
    profileLi.querySelector('a').addEventListener('click', () => {
      navigateTo('dashboard-page');
      document.querySelector('[data-section="dashboard-profile"]').click();
      toggleMobileMenu();
    });
    
    const logoutLi = document.createElement('li');
    logoutLi.innerHTML = '<a href="#" id="mobile-logout-link">Sair</a>';
    logoutLi.querySelector('a').addEventListener('click', () => {
      handleLogout();
      toggleMobileMenu();
    });
    
    mobileNavLinks.appendChild(dashboardLi);
    mobileNavLinks.appendChild(profileLi);
    mobileNavLinks.appendChild(logoutLi);
  }
}

/**
 * Atualiza a interface para usuário não autenticado
 */
function updateUIForUnauthenticatedUser() {
  // Atualiza os elementos de UI
  if (loginBtn) loginBtn.classList.remove('hidden');
  if (registerBtn) registerBtn.classList.remove('hidden');
  if (userProfile) userProfile.classList.add('hidden');
  
  // Atualiza os links de navegação mobile
  if (mobileLoginBtn) mobileLoginBtn.parentElement.classList.remove('hidden');
  if (mobileRegisterBtn) mobileRegisterBtn.parentElement.classList.remove('hidden');
  
  // Remove links de dashboard e perfil no menu mobile
  const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
  const mobileProfileLink = document.getElementById('mobile-profile-link');
  const mobileLogoutLink = document.getElementById('mobile-logout-link');
  
  if (mobileDashboardLink) mobileDashboardLink.parentElement.remove();
  if (mobileProfileLink) mobileProfileLink.parentElement.remove();
  if (mobileLogoutLink) mobileLogoutLink.parentElement.remove();
}

/**
 * Carrega os dados do usuário do Firestore
 * @param {String} userId - ID do usuário
 */
function loadUserData(userId) {
  firebaseHelper.getUsersCollection().doc(userId).get()
    .then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        
        // Armazena os dados do usuário para uso em outros módulos
        window.currentUserData = userData;
        
        // Aplica as configurações do usuário (tema, cores, etc.)
        applyUserSettings(userData.settings);
        
        // Carrega o logo personalizado (se disponível)
        if (userData.logoUrl) {
          const logoImg = document.getElementById('logo-img');
          if (logoImg) logoImg.src = userData.logoUrl;
        }
        
        // Dispara evento de dados do usuário carregados
        const event = new CustomEvent('userDataLoaded', { detail: userData });
        document.dispatchEvent(event);
      }
    })
    .catch(error => {
      console.error('Erro ao carregar dados do usuário:', error);
    });
}

/**
 * Aplica as configurações do usuário à interface
 * @param {Object} settings - Configurações do usuário
 */
function applyUserSettings(settings) {
  if (!settings) return;
  
  // Aplica o tema
  if (settings.theme) {
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // Atualiza o ícone do botão de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = settings.theme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    }
  }
  
  // Aplica as cores personalizadas
  if (settings.primaryColor || settings.secondaryColor || settings.textColor) {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        ${settings.primaryColor ? `--primary-color: ${settings.primaryColor};` : ''}
        ${settings.primaryColor ? `--primary-dark: ${adjustColor(settings.primaryColor, -20)};` : ''}
        ${settings.primaryColor ? `--primary-light: ${adjustColor(settings.primaryColor, 20)};` : ''}
        ${settings.secondaryColor ? `--secondary-color: ${settings.secondaryColor};` : ''}
        ${settings.secondaryColor ? `--secondary-dark: ${adjustColor(settings.secondaryColor, -20)};` : ''}
        ${settings.secondaryColor ? `--secondary-light: ${adjustColor(settings.secondaryColor, 20)};` : ''}
        ${settings.textColor ? `--gray-900: ${settings.textColor};` : ''}
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Manipula erros de autenticação
 * @param {Object} error - Objeto de erro do Firebase
 */
function handleAuthError(error) {
  let message = '';
  
  switch (error.code) {
    case 'auth/user-not-found':
      message = 'Usuário não encontrado. Verifique seu e-mail.';
      break;
    case 'auth/wrong-password':
      message = 'Senha incorreta. Tente novamente.';
      break;
    case 'auth/email-already-in-use':
      message = 'Este e-mail já está sendo usado por outra conta.';
      break;
    case 'auth/weak-password':
      message = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
      break;
    case 'auth/invalid-email':
      message = 'E-mail inválido. Verifique o formato.';
      break;
    case 'auth/too-many-requests':
      message = 'Muitas tentativas. Tente novamente mais tarde.';
      break;
    default:
      message = 'Ocorreu um erro. Tente novamente mais tarde.';
  }
  
  showToast('error', 'Erro de autenticação', message);
  console.error('Erro de autenticação:', error);
}

/**
 * Alterna a visibilidade da senha
 * @param {Event} e - Evento de clique no botão
 */
function togglePasswordVisibility(e) {
  const button = e.currentTarget;
  const input = button.previousElementSibling;
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

/**
 * Gera uma URL personalizada a partir do nome do usuário
 * @param {String} name - Nome do usuário
 * @returns {String} URL personalizada
 */
function generateCustomUrl(name) {
  if (!name) return '';
  
  // Remove acentos e caracteres especiais
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Converte para minúsculas, substitui espaços por hífens e remove caracteres não alfanuméricos
  return normalized.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Ajusta a cor (escurece ou clareia)
 * @param {String} color - Cor em formato hexadecimal
 * @param {Number} amount - Quantidade de ajuste (-100 a 100)
 * @returns {String} Cor ajustada
 */
function adjustColor(color, amount) {
  // Remove o # se existir
  color = color.replace('#', '');
  
  // Converte para RGB
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  // Ajusta os valores
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Converte de volta para hexadecimal
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Exportação das funções para uso em outros arquivos
window.authModule = {
  initAuth,
  handleLogin,
  handleRegister,
  handleForgotPassword,
  handleLogout,
  loadUserData
};
