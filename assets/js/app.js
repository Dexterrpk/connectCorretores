/**
 * ImobConnect - Sistema para Corretores de Imóveis
 * Arquivo principal de inicialização
 */

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa os módulos
  initApp();
});

/**
 * Inicializa a aplicação
 */
function initApp() {
  // Verifica se o Firebase está disponível
  if (typeof firebase === 'undefined') {
    console.error('Firebase não encontrado. Verifique se os scripts foram carregados corretamente.');
    showErrorMessage('Erro de inicialização', 'Não foi possível carregar as dependências necessárias.');
    return;
  }

  try {
    // Inicializa os módulos na ordem correta
    authModule.initAuth();
    uiModule.initUI();
    propertiesModule.initProperties();
    dashboardModule.initDashboard();
    
    // Inicializa o formulário de envio de imóveis por proprietários
    initPropertySubmissionForm();
    
    // Inicializa o tema com base nas preferências salvas
    initTheme();
    
    console.log('ImobConnect inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error);
    showErrorMessage('Erro de inicialização', 'Ocorreu um erro ao inicializar a aplicação.');
  }
}

/**
 * Inicializa o formulário de envio de imóveis por proprietários
 */
function initPropertySubmissionForm() {
  const propertySubmissionForm = document.getElementById('property-submission-form');
  if (!propertySubmissionForm) return;
  
  // Carrega os corretores disponíveis para o select
  loadAvailableBrokers();
  
  // Adiciona máscaras aos campos
  addInputMasks();
  
  // Adiciona validações ao formulário
  addFormValidations();
}

/**
 * Carrega os corretores disponíveis para o select
 */
function loadAvailableBrokers() {
  const brokerSelect = document.getElementById('broker-select');
  if (!brokerSelect) return;
  
  // Exibe mensagem de carregamento
  brokerSelect.innerHTML = '<option value="">Carregando corretores...</option>';
  
  // Busca os corretores no Firestore
  firebaseHelper.getUsersCollection()
    .where('role', '==', 'broker')
    .get()
    .then(snapshot => {
      // Limpa o select
      brokerSelect.innerHTML = '<option value="">Selecione um corretor (opcional)</option>';
      
      if (snapshot.empty) {
        return;
      }
      
      // Adiciona os corretores ao select
      snapshot.forEach(doc => {
        const broker = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = broker.name || 'Corretor sem nome';
        brokerSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar corretores:', error);
      brokerSelect.innerHTML = '<option value="">Erro ao carregar corretores</option>';
    });
}

/**
 * Adiciona máscaras aos campos do formulário
 */
function addInputMasks() {
  // Máscara para o campo de preço
  const priceInput = document.getElementById('property-price');
  if (priceInput) {
    priceInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value === '') return e.target.value = '';
      value = parseInt(value, 10);
      e.target.value = formatCurrency(value);
    });
  }
  
  // Máscara para o campo de telefone
  const phoneInput = document.getElementById('owner-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.substring(0, 11);
      
      if (value.length > 6) {
        e.target.value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
      } else if (value.length > 2) {
        e.target.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      } else if (value.length > 0) {
        e.target.value = `(${value}`;
      } else {
        e.target.value = '';
      }
    });
  }
  
  // Máscara para o campo de WhatsApp
  const whatsappInput = document.getElementById('owner-whatsapp');
  if (whatsappInput) {
    whatsappInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.substring(0, 11);
      
      if (value.length > 6) {
        e.target.value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
      } else if (value.length > 2) {
        e.target.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      } else if (value.length > 0) {
        e.target.value = `(${value}`;
      } else {
        e.target.value = '';
      }
    });
  }
}

/**
 * Adiciona validações ao formulário
 */
function addFormValidations() {
  const propertySubmissionForm = document.getElementById('property-submission-form');
  if (!propertySubmissionForm) return;
  
  propertySubmissionForm.addEventListener('submit', function(e) {
    // Validação será feita no módulo de propriedades
    // Esta função pode ser usada para validações adicionais específicas do formulário de envio
  });
  
  // Validação de e-mail
  const emailInput = document.getElementById('owner-email');
  if (emailInput) {
    emailInput.addEventListener('blur', function(e) {
      const email = e.target.value.trim();
      if (email && !isValidEmail(email)) {
        emailInput.classList.add('invalid');
        showFieldError(emailInput, 'E-mail inválido');
      } else {
        emailInput.classList.remove('invalid');
        hideFieldError(emailInput);
      }
    });
  }
  
  // Validação de campos obrigatórios
  const requiredInputs = propertySubmissionForm.querySelectorAll('[required]');
  requiredInputs.forEach(input => {
    input.addEventListener('blur', function(e) {
      if (!e.target.value.trim()) {
        input.classList.add('invalid');
        showFieldError(input, 'Campo obrigatório');
      } else {
        input.classList.remove('invalid');
        hideFieldError(input);
      }
    });
  });
}

/**
 * Verifica se um e-mail é válido
 * @param {String} email - E-mail a ser validado
 * @returns {Boolean} Verdadeiro se o e-mail for válido
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Exibe uma mensagem de erro para um campo
 * @param {HTMLElement} input - Campo com erro
 * @param {String} message - Mensagem de erro
 */
function showFieldError(input, message) {
  // Remove mensagem de erro existente
  hideFieldError(input);
  
  // Cria a mensagem de erro
  const errorMessage = document.createElement('div');
  errorMessage.className = 'field-error';
  errorMessage.textContent = message;
  
  // Insere após o campo
  input.parentNode.insertBefore(errorMessage, input.nextSibling);
}

/**
 * Oculta a mensagem de erro de um campo
 * @param {HTMLElement} input - Campo com erro
 */
function hideFieldError(input) {
  const errorMessage = input.parentNode.querySelector('.field-error');
  if (errorMessage) {
    errorMessage.remove();
  }
}

/**
 * Formata um valor como moeda
 * @param {Number} value - Valor a ser formatado
 * @returns {String} Valor formatado
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value / 100);
}

/**
 * Inicializa o tema com base nas preferências salvas
 */
function initTheme() {
  // Verifica se há um tema salvo no localStorage
  const savedTheme = localStorage.getItem('theme');
  
  // Se não houver tema salvo, usa o tema do sistema
  if (!savedTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    return;
  }
  
  // Aplica o tema salvo
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Atualiza o ícone do botão de tema
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.innerHTML = savedTheme === 'dark' ? 
      '<i class="fas fa-sun"></i>' : 
      '<i class="fas fa-moon"></i>';
  }
}

/**
 * Exibe uma mensagem de erro
 * @param {String} title - Título da mensagem
 * @param {String} message - Texto da mensagem
 */
function showErrorMessage(title, message) {
  // Cria o elemento de mensagem
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-container';
  errorContainer.innerHTML = `
    <div class="error-message">
      <h2>${title}</h2>
      <p>${message}</p>
      <button class="btn btn-primary">Recarregar página</button>
    </div>
  `;
  
  // Adiciona ao body
  document.body.appendChild(errorContainer);
  
  // Adiciona evento ao botão
  const reloadButton = errorContainer.querySelector('button');
  reloadButton.addEventListener('click', () => {
    window.location.reload();
  });
}
