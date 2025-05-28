/**
 * ImobConnect - Sistema para Corretores de Imóveis
 * Módulo de Interface do Usuário
 */

// Referências aos elementos do DOM relacionados à UI
const mainContent = document.getElementById('main-content');
const loadingOverlay = document.getElementById('loading-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const themeToggle = document.getElementById('theme-toggle');
const navLinks = document.querySelectorAll('.nav-link');
const toastContainer = document.getElementById('toast-container');

/**
 * Inicializa o módulo de UI
 */
function initUI() {
  // Adiciona listeners aos elementos de UI
  addUIListeners();
  
  // Verifica se há uma página na URL (hash)
  checkUrlHash();
  
  // Adiciona listener para mudanças no hash da URL
  window.addEventListener('hashchange', checkUrlHash);
}

/**
 * Adiciona event listeners aos elementos de UI
 */
function addUIListeners() {
  // Toggle do menu mobile
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  
  // Toggle do tema (claro/escuro)
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Links de navegação
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  // Botões de carrossel
  const carouselPrevBtn = document.querySelector('.carousel-btn.prev');
  const carouselNextBtn = document.querySelector('.carousel-btn.next');
  
  if (carouselPrevBtn) {
    carouselPrevBtn.addEventListener('click', () => scrollCarousel('prev'));
  }
  
  if (carouselNextBtn) {
    carouselNextBtn.addEventListener('click', () => scrollCarousel('next'));
  }
  
  // Tabs de busca na página inicial
  const searchTabs = document.querySelectorAll('.search-tab');
  searchTabs.forEach(tab => {
    tab.addEventListener('click', handleSearchTabClick);
  });
  
  // Toggle de filtros na página de listagem
  const filterToggle = document.getElementById('filter-toggle');
  if (filterToggle) {
    filterToggle.addEventListener('click', toggleFilters);
  }
  
  // Botões de paginação
  const paginationButtons = document.querySelectorAll('.pagination-number');
  paginationButtons.forEach(button => {
    button.addEventListener('click', handlePagination);
  });
  
  // Botões de navegação do painel
  const dashboardNavLinks = document.querySelectorAll('.dashboard-nav-link');
  dashboardNavLinks.forEach(link => {
    link.addEventListener('click', handleDashboardNavigation);
  });
  
  // Fechamento de modais
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', closeModal);
  });
  
  // Botões de confirmação em modais
  const confirmYesBtn = document.getElementById('confirm-yes');
  const confirmNoBtn = document.getElementById('confirm-no');
  const alertOkBtn = document.getElementById('alert-ok');
  
  if (confirmYesBtn) confirmYesBtn.addEventListener('click', handleConfirmYes);
  if (confirmNoBtn) confirmNoBtn.addEventListener('click', closeModal);
  if (alertOkBtn) alertOkBtn.addEventListener('click', closeModal);
}

/**
 * Verifica o hash da URL para navegação
 */
function checkUrlHash() {
  const hash = window.location.hash.substring(1);
  
  if (hash) {
    // Se houver um hash, navega para a página correspondente
    navigateTo(`${hash}-page`);
  } else {
    // Se não houver hash, navega para a página inicial
    navigateTo('home-page');
  }
}

/**
 * Manipula a navegação entre páginas
 * @param {Event} e - Evento de clique no link
 */
function handleNavigation(e) {
  e.preventDefault();
  
  const pageId = this.getAttribute('data-page');
  navigateTo(`${pageId}-page`);
  
  // Atualiza o hash da URL (sem recarregar a página)
  window.history.pushState(null, null, `#${pageId}`);
}

/**
 * Navega para uma página específica
 * @param {String} pageId - ID da página de destino
 */
function navigateTo(pageId) {
  // Verifica se a página existe
  const targetPage = document.getElementById(pageId);
  if (!targetPage) return;
  
  // Verifica se é uma página protegida (requer autenticação)
  const protectedPages = ['dashboard-page', 'profile-page'];
  if (protectedPages.includes(pageId) && !firebaseHelper.getCurrentUser()) {
    showToast('warning', 'Acesso restrito', 'Faça login para acessar esta página.');
    navigateTo('login-page');
    return;
  }
  
  // Oculta todas as páginas
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  
  // Exibe a página de destino
  targetPage.classList.add('active');
  
  // Atualiza os links de navegação
  updateNavLinks(pageId);
  
  // Fecha o menu mobile (se estiver aberto)
  if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
    toggleMobileMenu();
  }
  
  // Rola para o topo da página
  window.scrollTo(0, 0);
  
  // Dispara evento de mudança de página
  const event = new CustomEvent('pageChanged', { detail: { pageId } });
  document.dispatchEvent(event);
}

/**
 * Atualiza os links de navegação (destaca o link ativo)
 * @param {String} activePageId - ID da página ativa
 */
function updateNavLinks(activePageId) {
  // Remove a classe 'active' de todos os links
  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  // Adiciona a classe 'active' ao link correspondente à página ativa
  const activeLink = document.querySelector(`.nav-link[data-page="${activePageId.replace('-page', '')}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

/**
 * Alterna a exibição do menu mobile
 */
function toggleMobileMenu() {
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
  }
}

/**
 * Alterna entre os temas claro e escuro
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Atualiza o atributo data-theme no elemento html
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Atualiza o ícone do botão
  themeToggle.innerHTML = newTheme === 'dark' ? 
    '<i class="fas fa-sun"></i>' : 
    '<i class="fas fa-moon"></i>';
  
  // Se o usuário estiver autenticado, salva a preferência no Firestore
  const currentUser = firebaseHelper.getCurrentUser();
  if (currentUser) {
    firebaseHelper.getUsersCollection().doc(currentUser.uid).update({
      'settings.theme': newTheme
    }).catch(error => {
      console.error('Erro ao salvar preferência de tema:', error);
    });
  }
  
  // Salva a preferência no localStorage (para usuários não autenticados)
  localStorage.setItem('theme', newTheme);
}

/**
 * Manipula o clique nas abas de busca
 * @param {Event} e - Evento de clique na aba
 */
function handleSearchTabClick(e) {
  // Remove a classe 'active' de todas as abas
  const tabs = document.querySelectorAll('.search-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  // Adiciona a classe 'active' à aba clicada
  e.currentTarget.classList.add('active');
  
  // Atualiza o formulário de busca com base no tipo selecionado
  const searchType = e.currentTarget.getAttribute('data-type');
  updateSearchForm(searchType);
}

/**
 * Atualiza o formulário de busca com base no tipo selecionado
 * @param {String} type - Tipo de busca (buy/rent)
 */
function updateSearchForm(type) {
  // Atualiza os campos do formulário de acordo com o tipo de busca
  const priceRangeSelect = document.getElementById('price-range');
  
  if (priceRangeSelect) {
    if (type === 'buy') {
      priceRangeSelect.innerHTML = `
        <option value="">Faixa de preço</option>
        <option value="0-200000">Até R$ 200.000</option>
        <option value="200000-500000">R$ 200.000 - R$ 500.000</option>
        <option value="500000-1000000">R$ 500.000 - R$ 1.000.000</option>
        <option value="1000000+">Acima de R$ 1.000.000</option>
      `;
    } else {
      priceRangeSelect.innerHTML = `
        <option value="">Faixa de preço</option>
        <option value="0-1000">Até R$ 1.000</option>
        <option value="1000-2000">R$ 1.000 - R$ 2.000</option>
        <option value="2000-5000">R$ 2.000 - R$ 5.000</option>
        <option value="5000+">Acima de R$ 5.000</option>
      `;
    }
  }
}

/**
 * Alterna a exibição dos filtros na página de listagem
 */
function toggleFilters() {
  const filtersSidebar = document.getElementById('filters-sidebar');
  
  if (filtersSidebar) {
    filtersSidebar.classList.toggle('active');
  }
}

/**
 * Manipula a paginação
 * @param {Event} e - Evento de clique no botão de paginação
 */
function handlePagination(e) {
  // Remove a classe 'active' de todos os botões
  const buttons = document.querySelectorAll('.pagination-number');
  buttons.forEach(button => button.classList.remove('active'));
  
  // Adiciona a classe 'active' ao botão clicado
  e.currentTarget.classList.add('active');
  
  // Aqui seria implementada a lógica para carregar os dados da página selecionada
  // Por enquanto, apenas exibe um toast informativo
  const page = e.currentTarget.textContent;
  showToast('info', 'Paginação', `Página ${page} selecionada.`);
}

/**
 * Manipula a navegação no painel administrativo
 * @param {Event} e - Evento de clique no link de navegação
 */
function handleDashboardNavigation(e) {
  e.preventDefault();
  
  // Remove a classe 'active' de todos os links
  const links = document.querySelectorAll('.dashboard-nav-link');
  links.forEach(link => link.classList.remove('active'));
  
  // Adiciona a classe 'active' ao link clicado
  e.currentTarget.classList.add('active');
  
  // Obtém o ID da seção a ser exibida
  const sectionId = e.currentTarget.getAttribute('data-section');
  
  // Oculta todas as seções
  const sections = document.querySelectorAll('.dashboard-section');
  sections.forEach(section => section.classList.remove('active'));
  
  // Exibe a seção selecionada
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

/**
 * Rola o carrossel de imóveis
 * @param {String} direction - Direção da rolagem (prev/next)
 */
function scrollCarousel(direction) {
  const carousel = document.querySelector('.property-cards');
  
  if (!carousel) return;
  
  const cardWidth = carousel.querySelector('.property-card').offsetWidth;
  const gap = 24; // Valor do gap entre os cards (--spacing-lg)
  const scrollAmount = cardWidth + gap;
  
  if (direction === 'prev') {
    carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

/**
 * Exibe o overlay de carregamento
 */
function showLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.add('active');
  }
}

/**
 * Oculta o overlay de carregamento
 */
function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove('active');
  }
}

/**
 * Exibe um toast de notificação
 * @param {String} type - Tipo de toast (success/error/warning/info)
 * @param {String} title - Título do toast
 * @param {String} message - Mensagem do toast
 * @param {Number} duration - Duração em milissegundos (padrão: 3000ms)
 */
function showToast(type, title, message, duration = 3000) {
  if (!toastContainer) return;
  
  // Cria o elemento do toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  // Define o ícone com base no tipo
  let icon = '';
  switch (type) {
    case 'success':
      icon = '<i class="fas fa-check-circle toast-icon success"></i>';
      break;
    case 'error':
      icon = '<i class="fas fa-times-circle toast-icon error"></i>';
      break;
    case 'warning':
      icon = '<i class="fas fa-exclamation-triangle toast-icon warning"></i>';
      break;
    case 'info':
    default:
      icon = '<i class="fas fa-info-circle toast-icon info"></i>';
      break;
  }
  
  // Define o conteúdo do toast
  toast.innerHTML = `
    ${icon}
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;
  
  // Adiciona o toast ao container
  toastContainer.appendChild(toast);
  
  // Adiciona evento de clique ao botão de fechar
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });
  
  // Remove o toast após a duração especificada
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

/**
 * Exibe um modal de confirmação
 * @param {String} message - Mensagem de confirmação
 * @param {Function} onConfirm - Função a ser executada ao confirmar
 */
function showConfirmModal(message, onConfirm) {
  const confirmModal = document.getElementById('confirm-modal');
  const confirmMessage = document.getElementById('confirm-message');
  
  if (!confirmModal || !confirmMessage) return;
  
  // Define a mensagem
  confirmMessage.textContent = message;
  
  // Armazena a função de callback
  window.confirmCallback = onConfirm;
  
  // Exibe o modal
  confirmModal.classList.add('active');
}

/**
 * Exibe um modal de alerta
 * @param {String} message - Mensagem de alerta
 */
function showAlertModal(message) {
  const alertModal = document.getElementById('alert-modal');
  const alertMessage = document.getElementById('alert-message');
  
  if (!alertModal || !alertMessage) return;
  
  // Define a mensagem
  alertMessage.textContent = message;
  
  // Exibe o modal
  alertModal.classList.add('active');
}

/**
 * Manipula o clique no botão "Sim" do modal de confirmação
 */
function handleConfirmYes() {
  // Executa a função de callback (se existir)
  if (window.confirmCallback) {
    window.confirmCallback();
    window.confirmCallback = null;
  }
  
  // Fecha o modal
  closeModal();
}

/**
 * Fecha o modal ativo
 */
function closeModal() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.remove('active');
  });
}

/**
 * Cria um elemento de card de imóvel
 * @param {Object} property - Dados do imóvel
 * @returns {HTMLElement} Elemento do card
 */
function createPropertyCard(property) {
  const card = document.createElement('div');
  card.className = 'property-card';
  card.setAttribute('data-id', property.id);
  
  // Formata o preço
  const formattedPrice = firebaseHelper.formatCurrency(property.price);
  
  // Define o tipo de negócio (venda/aluguel)
  const dealType = property.dealType === 'sale' ? 'Venda' : 'Aluguel';
  const dealTypeClass = property.dealType === 'sale' ? 'sale' : 'rent';
  
  // Define o conteúdo do card
  card.innerHTML = `
    <div class="property-card-image">
      <img src="${property.images[0] || 'assets/images/property-placeholder.jpg'}" alt="${property.title}">
      <div class="property-card-badge ${dealTypeClass}">${dealType}</div>
    </div>
    <div class="property-card-content">
      <h3 class="property-card-title">${property.title}</h3>
      <div class="property-card-location">
        <i class="fas fa-map-marker-alt"></i>
        ${property.neighborhood}, ${property.city}
      </div>
      <div class="property-card-price">${formattedPrice}</div>
      <div class="property-card-features">
        <div class="property-card-feature">
          <i class="fas fa-ruler-combined"></i>
          <span>Área</span>
          <strong>${property.area} m²</strong>
        </div>
        <div class="property-card-feature">
          <i class="fas fa-bed"></i>
          <span>Quartos</span>
          <strong>${property.bedrooms}</strong>
        </div>
        <div class="property-card-feature">
          <i class="fas fa-bath"></i>
          <span>Banheiros</span>
          <strong>${property.bathrooms}</strong>
        </div>
        <div class="property-card-feature">
          <i class="fas fa-car"></i>
          <span>Vagas</span>
          <strong>${property.garage}</strong>
        </div>
      </div>
    </div>
  `;
  
  // Adiciona evento de clique para abrir a página de detalhes
  card.addEventListener('click', () => {
    loadPropertyDetails(property.id);
  });
  
  return card;
}

/**
 * Carrega os detalhes de um imóvel
 * @param {String} propertyId - ID do imóvel
 */
function loadPropertyDetails(propertyId) {
  // Exibe overlay de carregamento
  showLoading();
  
  // Busca os dados do imóvel no Firestore
  firebaseHelper.getPropertiesCollection().doc(propertyId).get()
    .then(doc => {
      if (doc.exists) {
        const property = { id: doc.id, ...doc.data() };
        
        // Renderiza os detalhes do imóvel
        renderPropertyDetails(property);
        
        // Navega para a página de detalhes
        navigateTo('property-details-page');
        
        // Incrementa o contador de visualizações
        incrementPropertyViews(propertyId);
      } else {
        showToast('error', 'Imóvel não encontrado', 'O imóvel solicitado não foi encontrado.');
      }
      
      // Oculta overlay de carregamento
      hideLoading();
    })
    .catch(error => {
      console.error('Erro ao carregar detalhes do imóvel:', error);
      showToast('error', 'Erro ao carregar', 'Ocorreu um erro ao carregar os detalhes do imóvel.');
      hideLoading();
    });
}

/**
 * Renderiza os detalhes de um imóvel na página de detalhes
 * @param {Object} property - Dados do imóvel
 */
function renderPropertyDetails(property) {
  const detailsContainer = document.querySelector('.property-details-container');
  
  if (!detailsContainer) return;
  
  // Formata o preço
  const formattedPrice = firebaseHelper.formatCurrency(property.price);
  
  // Define o tipo de negócio (venda/aluguel)
  const dealType = property.dealType === 'sale' ? 'Venda' : 'Aluguel';
  const dealTypeClass = property.dealType === 'sale' ? 'sale' : 'rent';
  
  // Formata a data de publicação
  const formattedDate = property.createdAt ? 
    firebaseHelper.formatTimestamp(property.createdAt) : 
    'Data não disponível';
  
  // Cria o HTML da galeria de imagens
  let galleryHTML = '';
  if (property.images && property.images.length > 0) {
    galleryHTML = `
      <div class="property-gallery">
        <div class="property-gallery-main">
          <img src="${property.images[0]}" alt="${property.title}">
        </div>
        <div class="property-gallery-thumbs">
          ${property.images.map((image, index) => `
            <div class="gallery-thumb ${index === 0 ? 'active' : ''}" data-index="${index}">
              <img src="${image}" alt="${property.title} - Imagem ${index + 1}">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    galleryHTML = `
      <div class="property-gallery">
        <div class="property-gallery-main">
          <img src="assets/images/property-placeholder.jpg" alt="${property.title}">
        </div>
      </div>
    `;
  }
  
  // Cria o HTML das comodidades
  let amenitiesHTML = '';
  if (property.amenities && property.amenities.length > 0) {
    amenitiesHTML = `
      <div class="property-amenities">
        <h3>Comodidades</h3>
        <div class="amenities-list">
          ${property.amenities.map(amenity => `
            <div class="amenity-item">
              <i class="fas fa-check"></i>
              <span>${getAmenityLabel(amenity)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Busca os dados do corretor
  let brokerHTML = '';
  if (property.userId) {
    firebaseHelper.getUsersCollection().doc(property.userId).get()
      .then(doc => {
        if (doc.exists) {
          const broker = doc.data();
          
          brokerHTML = `
            <div class="property-contact">
              <h3>Informações de contato</h3>
              <div class="broker-info">
                <div class="broker-avatar">
                  <img src="${broker.photoURL || 'assets/images/default-avatar.png'}" alt="${broker.name}">
                </div>
                <div class="broker-details">
                  <h4>${broker.name}</h4>
                  <p>${broker.email}</p>
                  <p>${broker.phone || 'Telefone não disponível'}</p>
                  ${broker.creci ? `<p>CRECI: ${broker.creci}</p>` : ''}
                </div>
              </div>
              <div class="contact-buttons">
                <a href="https://wa.me/${formatPhoneForWhatsApp(broker.phone || '')}" target="_blank" class="btn whatsapp-btn">
                  <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
                <a href="tel:${broker.phone || ''}" class="btn phone-btn">
                  <i class="fas fa-phone"></i> Ligar
                </a>
              </div>
            </div>
          `;
          
          // Atualiza o contêiner de contato
          const contactContainer = detailsContainer.querySelector('.property-contact');
          if (contactContainer) {
            contactContainer.innerHTML = brokerHTML;
          } else {
            detailsContainer.querySelector('.property-info').insertAdjacentHTML('beforeend', brokerHTML);
          }
        }
      })
      .catch(error => {
        console.error('Erro ao carregar dados do corretor:', error);
      });
  }
  
  // Define o conteúdo do contêiner de detalhes
  detailsContainer.innerHTML = `
    ${galleryHTML}
    <div class="property-info">
      <div class="property-header">
        <h1 class="property-title">${property.title}</h1>
        <div class="property-location">
          <i class="fas fa-map-marker-alt"></i>
          ${property.neighborhood}, ${property.city}
        </div>
        <div class="property-price">${formattedPrice}</div>
        <div class="property-badges">
          <div class="property-badge ${dealTypeClass}">${dealType}</div>
          ${property.isNew ? '<div class="property-badge new">Novo</div>' : ''}
        </div>
      </div>
      
      <div class="property-features">
        <div class="property-feature">
          <i class="fas fa-ruler-combined"></i>
          <span>Área</span>
          <strong>${property.area} m²</strong>
        </div>
        <div class="property-feature">
          <i class="fas fa-bed"></i>
          <span>Quartos</span>
          <strong>${property.bedrooms}</strong>
        </div>
        <div class="property-feature">
          <i class="fas fa-bath"></i>
          <span>Banheiros</span>
          <strong>${property.bathrooms}</strong>
        </div>
        <div class="property-feature">
          <i class="fas fa-car"></i>
          <span>Vagas</span>
          <strong>${property.garage}</strong>
        </div>
        <div class="property-feature">
          <i class="fas fa-calendar-alt"></i>
          <span>Publicado</span>
          <strong>${formattedDate}</strong>
        </div>
      </div>
      
      <div class="property-description">
        <h3>Descrição</h3>
        <p>${property.description}</p>
      </div>
      
      ${amenitiesHTML}
      ${brokerHTML}
    </div>
  `;
  
  // Adiciona eventos aos thumbnails da galeria
  const galleryThumbs = detailsContainer.querySelectorAll('.gallery-thumb');
  galleryThumbs.forEach(thumb => {
    thumb.addEventListener('click', handleGalleryThumbClick);
  });
}

/**
 * Manipula o clique em um thumbnail da galeria
 * @param {Event} e - Evento de clique
 */
function handleGalleryThumbClick(e) {
  const thumb = e.currentTarget;
  const index = thumb.getAttribute('data-index');
  const galleryMain = document.querySelector('.property-gallery-main img');
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');
  
  if (!galleryMain) return;
  
  // Atualiza a imagem principal
  galleryMain.src = thumb.querySelector('img').src;
  
  // Atualiza a classe 'active' nos thumbnails
  galleryThumbs.forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

/**
 * Incrementa o contador de visualizações de um imóvel
 * @param {String} propertyId - ID do imóvel
 */
function incrementPropertyViews(propertyId) {
  firebaseHelper.getPropertiesCollection().doc(propertyId).update({
    views: firebase.firestore.FieldValue.increment(1)
  }).catch(error => {
    console.error('Erro ao incrementar visualizações:', error);
  });
}

/**
 * Obtém o label de uma comodidade
 * @param {String} amenity - Código da comodidade
 * @returns {String} Label da comodidade
 */
function getAmenityLabel(amenity) {
  const amenityLabels = {
    pool: 'Piscina',
    gym: 'Academia',
    garden: 'Jardim',
    barbecue: 'Churrasqueira',
    security: 'Segurança 24h',
    elevator: 'Elevador',
    furnished: 'Mobiliado',
    pet: 'Aceita pet'
  };
  
  return amenityLabels[amenity] || amenity;
}

/**
 * Formata um número de telefone para o formato do WhatsApp
 * @param {String} phone - Número de telefone
 * @returns {String} Número formatado para WhatsApp
 */
function formatPhoneForWhatsApp(phone) {
  // Remove caracteres não numéricos
  return phone.replace(/\D/g, '');
}

/**
 * Inicializa a personalização do usuário
 * @param {Object} userData - Dados do usuário
 */
function initUserCustomization(userData) {
  if (!userData) return;
  
  // Aplica o logo personalizado
  if (userData.logoUrl) {
    const logoElements = document.querySelectorAll('#logo-img, .footer-logo img');
    logoElements.forEach(element => {
      element.src = userData.logoUrl;
    });
  }
  
  // Aplica o nome da empresa/corretor
  if (userData.company) {
    const brandElements = document.querySelectorAll('#brand-name, .footer-logo h2');
    brandElements.forEach(element => {
      element.textContent = userData.company;
    });
  }
  
  // Aplica as cores personalizadas
  if (userData.settings && (userData.settings.primaryColor || userData.settings.secondaryColor)) {
    applyCustomColors(userData.settings);
  }
  
  // Atualiza o link personalizado
  if (userData.customUrl) {
    const customLinkInput = document.getElementById('custom-link');
    if (customLinkInput) {
      customLinkInput.value = `https://imobconnect.com.br/corretor/${userData.customUrl}`;
    }
    
    // Gera QR Code para o link personalizado
    generateQRCode(userData.customUrl);
  }
}

/**
 * Aplica cores personalizadas à interface
 * @param {Object} settings - Configurações do usuário
 */
function applyCustomColors(settings) {
  if (!settings) return;
  
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
  
  // Remove estilos personalizados anteriores
  const existingStyle = document.getElementById('custom-colors');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Adiciona o novo estilo
  style.id = 'custom-colors';
  document.head.appendChild(style);
  
  // Atualiza os inputs de cor no painel de aparência
  const primaryColorInput = document.getElementById('primary-color');
  const secondaryColorInput = document.getElementById('secondary-color');
  const textColorInput = document.getElementById('text-color');
  const primaryColorHex = document.getElementById('primary-color-hex');
  const secondaryColorHex = document.getElementById('secondary-color-hex');
  const textColorHex = document.getElementById('text-color-hex');
  
  if (primaryColorInput && settings.primaryColor) {
    primaryColorInput.value = settings.primaryColor;
    if (primaryColorHex) primaryColorHex.value = settings.primaryColor;
  }
  
  if (secondaryColorInput && settings.secondaryColor) {
    secondaryColorInput.value = settings.secondaryColor;
    if (secondaryColorHex) secondaryColorHex.value = settings.secondaryColor;
  }
  
  if (textColorInput && settings.textColor) {
    textColorInput.value = settings.textColor;
    if (textColorHex) textColorHex.value = settings.textColor;
  }
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

/**
 * Gera um QR Code para o link personalizado
 * @param {String} customUrl - URL personalizada
 */
function generateQRCode(customUrl) {
  const qrCodeImg = document.getElementById('qr-code');
  
  if (!qrCodeImg) return;
  
  // URL completa
  const fullUrl = `https://imobconnect.com.br/corretor/${customUrl}`;
  
  // URL da API do Google Charts para gerar QR Code
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(fullUrl)}&choe=UTF-8`;
  
  // Atualiza a imagem do QR Code
  qrCodeImg.src = qrCodeUrl;
  
  // Adiciona evento ao botão de download
  const downloadQrBtn = document.getElementById('download-qr');
  if (downloadQrBtn) {
    downloadQrBtn.addEventListener('click', () => {
      // Cria um link temporário para download
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qrcode-${customUrl}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}

// Adiciona listener para o evento de dados do usuário carregados
document.addEventListener('userDataLoaded', (e) => {
  const userData = e.detail;
  initUserCustomization(userData);
});

// Exportação das funções para uso em outros arquivos
window.uiModule = {
  initUI,
  navigateTo,
  showLoading,
  hideLoading,
  showToast,
  showConfirmModal,
  showAlertModal,
  createPropertyCard,
  loadPropertyDetails,
  toggleMobileMenu,
  toggleTheme,
  applyCustomColors,
  initUserCustomization
};
