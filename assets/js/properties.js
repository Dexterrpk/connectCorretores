/**
 * ImobConnect - Sistema para Corretores de Imóveis
 * Módulo de Gerenciamento de Imóveis
 */

// Referências aos elementos do DOM relacionados aos imóveis
const propertySubmissionForm = document.getElementById('property-submission-form');
const addPropertyForm = document.getElementById('add-property-form');
const addPropertyBtn = document.getElementById('add-property-btn');
const propertyImagesInput = document.getElementById('property-images');
const imagePreviewContainer = document.querySelector('.image-preview-container');
const propertiesGrid = document.querySelector('.properties-grid');
const featuredPropertiesContainer = document.querySelector('.property-cards');
const propertyDetailsPage = document.getElementById('property-details-page');
const propertiesTableBody = document.getElementById('properties-table-body');
const pendingPropertiesContainer = document.querySelector('.pending-properties-container');

// Armazena as imagens selecionadas para upload
let selectedImages = [];
// Armazena o imóvel em edição
let currentEditingProperty = null;

/**
 * Inicializa o módulo de gerenciamento de imóveis
 */
function initProperties() {
  // Adiciona listeners aos formulários e botões
  addPropertyListeners();
  
  // Carrega os imóveis em destaque para a página inicial
  loadFeaturedProperties();
  
  // Adiciona listener para o evento de mudança de página
  document.addEventListener('pageChanged', handlePageChanged);
}

/**
 * Adiciona event listeners aos elementos relacionados a imóveis
 */
function addPropertyListeners() {
  // Formulário de envio de imóvel por proprietário
  if (propertySubmissionForm) {
    propertySubmissionForm.addEventListener('submit', handlePropertySubmission);
  }
  
  // Formulário de adição/edição de imóvel pelo corretor
  if (addPropertyForm) {
    addPropertyForm.addEventListener('submit', handleAddEditProperty);
  }
  
  // Botão de adicionar imóvel
  if (addPropertyBtn) {
    addPropertyBtn.addEventListener('click', showAddPropertyModal);
  }
  
  // Input de upload de imagens
  if (propertyImagesInput) {
    propertyImagesInput.addEventListener('change', handleImageSelection);
    
    // Adiciona suporte para drag and drop
    const imageUploadArea = document.querySelector('.image-upload-area');
    if (imageUploadArea) {
      imageUploadArea.addEventListener('dragover', handleDragOver);
      imageUploadArea.addEventListener('drop', handleDrop);
      imageUploadArea.addEventListener('click', () => propertyImagesInput.click());
    }
  }
  
  // Filtros de imóveis
  const applyFiltersBtn = document.getElementById('apply-filters');
  const clearFiltersBtn = document.getElementById('clear-filters');
  
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }
  
  // Ordenação de imóveis
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSortChange);
  }
}

/**
 * Manipula o evento de mudança de página
 * @param {CustomEvent} e - Evento de mudança de página
 */
function handlePageChanged(e) {
  const pageId = e.detail.pageId;
  
  // Carrega os imóveis apropriados com base na página atual
  switch (pageId) {
    case 'properties-page':
      loadProperties();
      break;
    case 'dashboard-properties':
      loadUserProperties();
      break;
    case 'dashboard-pending':
      loadPendingProperties();
      break;
  }
}

/**
 * Carrega os imóveis em destaque para a página inicial
 */
function loadFeaturedProperties() {
  if (!featuredPropertiesContainer) return;
  
  // Limpa o conteúdo atual (exceto os skeletons)
  const existingCards = featuredPropertiesContainer.querySelectorAll('.property-card:not(.skeleton)');
  existingCards.forEach(card => card.remove());
  
  // Exibe os skeletons
  const skeletons = featuredPropertiesContainer.querySelectorAll('.skeleton');
  skeletons.forEach(skeleton => skeleton.style.display = 'block');
  
  // Busca os imóveis em destaque no Firestore
  firebaseHelper.getPropertiesCollection()
    .where('featured', '==', true)
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .limit(6)
    .get()
    .then(snapshot => {
      // Oculta os skeletons
      skeletons.forEach(skeleton => skeleton.style.display = 'none');
      
      if (snapshot.empty) {
        // Se não houver imóveis em destaque, carrega os mais recentes
        loadRecentProperties();
        return;
      }
      
      // Adiciona os imóveis ao carrossel
      snapshot.forEach(doc => {
        const property = { id: doc.id, ...doc.data() };
        const card = uiModule.createPropertyCard(property);
        featuredPropertiesContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar imóveis em destaque:', error);
      
      // Oculta os skeletons
      skeletons.forEach(skeleton => skeleton.style.display = 'none');
      
      // Carrega os imóveis mais recentes como fallback
      loadRecentProperties();
    });
}

/**
 * Carrega os imóveis mais recentes (fallback para featured)
 */
function loadRecentProperties() {
  if (!featuredPropertiesContainer) return;
  
  firebaseHelper.getPropertiesCollection()
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .limit(6)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        // Se não houver imóveis, exibe uma mensagem
        featuredPropertiesContainer.innerHTML = '<p class="text-center">Nenhum imóvel disponível no momento.</p>';
        return;
      }
      
      // Adiciona os imóveis ao carrossel
      snapshot.forEach(doc => {
        const property = { id: doc.id, ...doc.data() };
        const card = uiModule.createPropertyCard(property);
        featuredPropertiesContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar imóveis recentes:', error);
      featuredPropertiesContainer.innerHTML = '<p class="text-center">Erro ao carregar imóveis. Tente novamente mais tarde.</p>';
    });
}

/**
 * Carrega todos os imóveis para a página de listagem
 */
function loadProperties() {
  if (!propertiesGrid) return;
  
  // Exibe o overlay de carregamento
  uiModule.showLoading();
  
  // Limpa o conteúdo atual (exceto os skeletons)
  const existingCards = propertiesGrid.querySelectorAll('.property-card:not(.skeleton)');
  existingCards.forEach(card => card.remove());
  
  // Exibe os skeletons
  const skeletons = propertiesGrid.querySelectorAll('.skeleton');
  skeletons.forEach(skeleton => skeleton.style.display = 'block');
  
  // Busca os imóveis no Firestore
  firebaseHelper.getPropertiesCollection()
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .get()
    .then(snapshot => {
      // Oculta os skeletons
      skeletons.forEach(skeleton => skeleton.style.display = 'none');
      
      if (snapshot.empty) {
        // Se não houver imóveis, exibe uma mensagem
        propertiesGrid.innerHTML = '<p class="text-center">Nenhum imóvel disponível no momento.</p>';
        uiModule.hideLoading();
        return;
      }
      
      // Adiciona os imóveis à grade
      snapshot.forEach(doc => {
        const property = { id: doc.id, ...doc.data() };
        const card = uiModule.createPropertyCard(property);
        propertiesGrid.appendChild(card);
      });
      
      // Oculta o overlay de carregamento
      uiModule.hideLoading();
    })
    .catch(error => {
      console.error('Erro ao carregar imóveis:', error);
      
      // Oculta os skeletons
      skeletons.forEach(skeleton => skeleton.style.display = 'none');
      
      // Exibe mensagem de erro
      propertiesGrid.innerHTML = '<p class="text-center">Erro ao carregar imóveis. Tente novamente mais tarde.</p>';
      
      // Oculta o overlay de carregamento
      uiModule.hideLoading();
    });
}

/**
 * Carrega os imóveis do usuário atual para o painel
 */
function loadUserProperties() {
  if (!propertiesTableBody) return;
  
  // Verifica se o usuário está autenticado
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast('warning', 'Acesso restrito', 'Faça login para acessar seus imóveis.');
    uiModule.navigateTo('login-page');
    return;
  }
  
  // Exibe o overlay de carregamento
  uiModule.showLoading();
  
  // Limpa o conteúdo atual (exceto os skeletons)
  const existingRows = propertiesTableBody.querySelectorAll('tr:not(.skeleton-row)');
  existingRows.forEach(row => row.remove());
  
  // Exibe os skeletons
  const skeletons = propertiesTableBody.querySelectorAll('.skeleton-row');
  skeletons.forEach(skeleton => skeleton.style.display = 'table-row');
  
  // Busca os imóveis do usuário no Firestore
  firebaseHelper.getPropertiesCollection()
    .where('userId', '==', currentUser.uid)
    .orderBy('createdAt', 'desc')
    .get()
    .then(snapshot => {
      // Oculta os skeletons
      skeletons.forEach(skeleton => skeleton.style.display = 'none');
      
      if (snapshot.empty) {
        // Se não houver imóveis, exibe uma mensagem
        propertiesTableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center">Você ainda não possui imóveis cadastrados.</td>
          </tr>
        `;
        uiModule.hideLoading();
        return;
      }
      
      // Adiciona os imóveis à tabela
      snapshot.forEach(doc => {
        const property = { id: doc.id, ...doc.data() };
        const row = createPropertyTableRow(property);
        propertiesTableBody.appendChild(row);
      });
      
      // Atualiza o contador de imóveis no dashboard
      updateDashboardCounters();
      
      // Oculta o overlay de carregamento
      uiModule.hideLoading();
    })
    .catch(error => {
      console.error('Erro ao carregar imóveis do usuário:', error);
      
      // Oculta os skeletons
      skeletons.forEach(skeleton => skeleton.style.display = 'none');
      
      // Exibe mensagem de erro
      propertiesTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">Erro ao carregar imóveis. Tente novamente mais tarde.</td>
        </tr>
      `;
      
      // Oculta o overlay de carregamento
      uiModule.hideLoading();
    });
}

/**
 * Carrega os imóveis pendentes para o painel
 */
function loadPendingProperties() {
  if (!pendingPropertiesContainer) return;
  
  // Verifica se o usuário está autenticado
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast('warning', 'Acesso restrito', 'Faça login para acessar imóveis pendentes.');
    uiModule.navigateTo('login-page');
    return;
  }
  
  // Exibe o overlay de carregamento
  uiModule.showLoading();
  
  // Limpa o conteúdo atual (exceto os skeletons)
  const existingCards = pendingPropertiesContainer.querySelectorAll('.pending-property-card:not(.skeleton)');
  existingCards.forEach(card => card.remove());
  
  // Exibe os skeletons
  const skeletons = pendingPropertiesContainer.querySelectorAll('.skeleton');
  skeletons.forEach(skeleton => skeleton.style.display = 'block');
  
  // Busca os imóveis pendentes no Firestore
  firebaseHelper.getPendingPropertiesCollection()
    .where('brokerId', '==', currentUser.uid)
    .orderBy('createdAt', 'desc')
    .get()
    .then(snapshot => {
      // Oculta os skeletons
      skeletons.forEach(skeleton => skeleton.style.display = 'none');
      
      if (snapshot.empty) {
        // Se não houver imóveis pendentes, exibe uma mensagem
        pendingPropertiesContainer.innerHTML = '<p class="text-center">Não há imóveis pendentes para aprovação.</p>';
        uiModule.hideLoading();
        return;
      }
      
      // Adiciona os imóveis pendentes ao container
      snapshot.forEach(doc => {
        const property = { id: doc.id, ...doc.data() };
        const card = createPendingPropertyCard(property);
        pendingPropertiesContainer.appendChild(card);
      });
      
      // Atualiza o contador de imóveis pendentes no dashboard
      updateDashboardCounters();
      
      // Oculta o overlay de carregamento
      uiModule.hideLoading();
    })
    .catch(error => {
      console.error('Erro ao carregar imóveis pendentes:', error);
      
      // Oculta os skeletons
      skeletons.forEach(skeleton => skeleton.style.display = 'none');
      
      // Exibe mensagem de erro
      pendingPropertiesContainer.innerHTML = '<p class="text-center">Erro ao carregar imóveis pendentes. Tente novamente mais tarde.</p>';
      
      // Oculta o overlay de carregamento
      uiModule.hideLoading();
    });
}

/**
 * Cria uma linha da tabela para um imóvel
 * @param {Object} property - Dados do imóvel
 * @returns {HTMLElement} Elemento TR da tabela
 */
function createPropertyTableRow(property) {
  const row = document.createElement('tr');
  
  // Formata o preço
  const formattedPrice = firebaseHelper.formatCurrency(property.price);
  
  // Formata a data
  const formattedDate = property.createdAt ? 
    firebaseHelper.formatTimestamp(property.createdAt) : 
    'Data não disponível';
  
  // Define o status do imóvel
  let statusClass = '';
  let statusText = '';
  
  switch (property.status) {
    case 'active':
      statusClass = 'active';
      statusText = 'Ativo';
      break;
    case 'inactive':
      statusClass = 'inactive';
      statusText = 'Inativo';
      break;
    case 'sold':
      statusClass = 'sold';
      statusText = 'Vendido';
      break;
    case 'rented':
      statusClass = 'rented';
      statusText = 'Alugado';
      break;
    default:
      statusClass = 'inactive';
      statusText = 'Inativo';
  }
  
  // Define o tipo de imóvel
  let propertyType = '';
  
  switch (property.type) {
    case 'apartment':
      propertyType = 'Apartamento';
      break;
    case 'house':
      propertyType = 'Casa';
      break;
    case 'commercial':
      propertyType = 'Comercial';
      break;
    case 'land':
      propertyType = 'Terreno';
      break;
    default:
      propertyType = 'Outro';
  }
  
  // Define o conteúdo da linha
  row.innerHTML = `
    <td>
      <div class="property-table-image">
        <img src="${property.images && property.images.length > 0 ? property.images[0] : 'assets/images/property-placeholder.jpg'}" alt="${property.title}">
      </div>
      <div class="property-table-title">${property.title}</div>
      <div class="property-table-location">${property.neighborhood}, ${property.city}</div>
    </td>
    <td>${propertyType}</td>
    <td>${formattedPrice}</td>
    <td><span class="property-status ${statusClass}">${statusText}</span></td>
    <td>${property.views || 0}</td>
    <td>${formattedDate}</td>
    <td>
      <div class="table-actions">
        <button class="table-action-btn view" title="Visualizar">
          <i class="fas fa-eye"></i>
        </button>
        <button class="table-action-btn edit" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="table-action-btn delete" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </td>
  `;
  
  // Adiciona eventos aos botões de ação
  const viewBtn = row.querySelector('.view');
  const editBtn = row.querySelector('.edit');
  const deleteBtn = row.querySelector('.delete');
  
  viewBtn.addEventListener('click', () => {
    uiModule.loadPropertyDetails(property.id);
  });
  
  editBtn.addEventListener('click', () => {
    editProperty(property);
  });
  
  deleteBtn.addEventListener('click', () => {
    deleteProperty(property.id, property.title);
  });
  
  return row;
}

/**
 * Cria um card para um imóvel pendente
 * @param {Object} property - Dados do imóvel pendente
 * @returns {HTMLElement} Elemento do card
 */
function createPendingPropertyCard(property) {
  const card = document.createElement('div');
  card.className = 'pending-property-card';
  card.setAttribute('data-id', property.id);
  
  // Formata o preço
  const formattedPrice = firebaseHelper.formatCurrency(property.price);
  
  // Formata a data
  const formattedDate = property.createdAt ? 
    firebaseHelper.formatTimestamp(property.createdAt) : 
    'Data não disponível';
  
  // Define o tipo de negócio (venda/aluguel)
  const dealType = property.dealType === 'sale' ? 'Venda' : 'Aluguel';
  
  // Define o tipo de imóvel
  let propertyType = '';
  
  switch (property.type) {
    case 'apartment':
      propertyType = 'Apartamento';
      break;
    case 'house':
      propertyType = 'Casa';
      break;
    case 'commercial':
      propertyType = 'Comercial';
      break;
    case 'land':
      propertyType = 'Terreno';
      break;
    default:
      propertyType = 'Outro';
  }
  
  // Define o conteúdo do card
  card.innerHTML = `
    <div class="pending-property-image">
      <img src="${property.images && property.images.length > 0 ? property.images[0] : 'assets/images/property-placeholder.jpg'}" alt="${property.title}">
    </div>
    <div class="pending-property-content">
      <h3 class="pending-property-title">${property.title}</h3>
      <div class="pending-property-info">
        <p><i class="fas fa-map-marker-alt"></i> ${property.neighborhood}, ${property.city}</p>
        <p><i class="fas fa-tag"></i> ${formattedPrice} (${dealType})</p>
        <p><i class="fas fa-home"></i> ${propertyType}</p>
        <p><i class="fas fa-ruler-combined"></i> ${property.area} m² | <i class="fas fa-bed"></i> ${property.bedrooms} | <i class="fas fa-bath"></i> ${property.bathrooms}</p>
        <p><i class="fas fa-calendar-alt"></i> Enviado em: ${formattedDate}</p>
      </div>
      <div class="pending-property-owner">
        <h4>Dados do proprietário</h4>
        <p><i class="fas fa-user"></i> ${property.ownerName}</p>
        <p><i class="fas fa-envelope"></i> ${property.ownerEmail}</p>
        <p><i class="fas fa-phone"></i> ${property.ownerPhone}</p>
        ${property.ownerWhatsapp ? `<p><i class="fab fa-whatsapp"></i> ${property.ownerWhatsapp}</p>` : ''}
      </div>
      <div class="pending-property-actions">
        <button class="btn btn-primary approve-property">
          <i class="fas fa-check"></i> Aprovar
        </button>
        <button class="btn btn-outline edit-pending-property">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn btn-danger reject-property">
          <i class="fas fa-times"></i> Rejeitar
        </button>
      </div>
    </div>
  `;
  
  // Adiciona eventos aos botões de ação
  const approveBtn = card.querySelector('.approve-property');
  const editBtn = card.querySelector('.edit-pending-property');
  const rejectBtn = card.querySelector('.reject-property');
  
  approveBtn.addEventListener('click', () => {
    approveProperty(property);
  });
  
  editBtn.addEventListener('click', () => {
    editPendingProperty(property);
  });
  
  rejectBtn.addEventListener('click', () => {
    rejectProperty(property.id, property.title);
  });
  
  return card;
}

/**
 * Manipula o envio de um imóvel por proprietário
 * @param {Event} e - Evento de submit do formulário
 */
function handlePropertySubmission(e) {
  e.preventDefault();
  
  // Exibe o overlay de carregamento
  uiModule.showLoading();
  
  // Obtém os valores do formulário
  const title = document.getElementById('property-title').value;
  const description = document.getElementById('property-description').value;
  const type = document.getElementById('property-type-select').value;
  const dealType = document.getElementById('deal-type').value;
  const price = parseFloat(document.getElementById('property-price').value);
  const area = parseFloat(document.getElementById('property-area').value);
  const bedrooms = parseInt(document.getElementById('property-bedrooms').value) || 0;
  const bathrooms = parseInt(document.getElementById('property-bathrooms').value) || 0;
  const garage = parseInt(document.getElementById('property-garage').value) || 0;
  const city = document.getElementById('property-city').value;
  const neighborhood = document.getElementById('property-neighborhood').value;
  const address = document.getElementById('property-address').value;
  const ownerName = document.getElementById('owner-name').value;
  const ownerEmail = document.getElementById('owner-email').value;
  const ownerPhone = document.getElementById('owner-phone').value;
  const ownerWhatsapp = document.getElementById('owner-whatsapp').value;
  
  // Obtém as comodidades selecionadas
  const amenitiesCheckboxes = document.querySelectorAll('input[name="amenities"]:checked');
  const amenities = Array.from(amenitiesCheckboxes).map(checkbox => checkbox.value);
  
  // Obtém o corretor selecionado (se houver)
  const brokerSelect = document.getElementById('broker-select');
  const brokerId = brokerSelect ? brokerSelect.value : '';
  
  // Verifica se há imagens selecionadas
  if (selectedImages.length === 0) {
    uiModule.hideLoading();
    uiModule.showToast('error', 'Erro no envio', 'É necessário enviar pelo menos uma imagem do imóvel.');
    return;
  }
  
  // Cria o objeto do imóvel pendente
  const pendingProperty = {
    title,
    description,
    type,
    dealType,
    price,
    area,
    bedrooms,
    bathrooms,
    garage,
    city,
    neighborhood,
    address,
    ownerName,
    ownerEmail,
    ownerPhone,
    ownerWhatsapp,
    amenities,
    brokerId: brokerId || null,
    status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  // Adiciona o imóvel pendente ao Firestore
  firebaseHelper.getPendingPropertiesCollection().add(pendingProperty)
    .then(docRef => {
      // Upload das imagens
      uploadPropertyImages(docRef.id, selectedImages, 'pending')
        .then(imageUrls => {
          // Atualiza o documento com as URLs das imagens
          return firebaseHelper.getPendingPropertiesCollection().doc(docRef.id).update({
            images: imageUrls
          });
        })
        .then(() => {
          // Envio bem-sucedido
          uiModule.hideLoading();
          uiModule.showToast('success', 'Imóvel enviado', 'Seu imóvel foi enviado para análise e será publicado após aprovação.');
          
          // Limpa o formulário
          propertySubmissionForm.reset();
          selectedImages = [];
          if (imagePreviewContainer) {
            imagePreviewContainer.innerHTML = '';
          }
          
          // Navega para a página inicial
          uiModule.navigateTo('home-page');
          
          // Notifica o corretor (se especificado)
          if (brokerId) {
            notifyBroker(brokerId, 'Novo imóvel pendente', `Um novo imóvel foi enviado para sua aprovação: ${title}`);
          }
        })
        .catch(error => {
          console.error('Erro ao fazer upload das imagens:', error);
          uiModule.hideLoading();
          uiModule.showToast('error', 'Erro no envio', 'Ocorreu um erro ao enviar as imagens. Tente novamente mais tarde.');
        });
    })
    .catch(error => {
      console.error('Erro ao enviar imóvel:', error);
      uiModule.hideLoading();
      uiModule.showToast('error', 'Erro no envio', 'Ocorreu um erro ao enviar o imóvel. Tente novamente mais tarde.');
    });
}

/**
 * Manipula a adição/edição de um imóvel pelo corretor
 * @param {Event} e - Evento de submit do formulário
 */
function handleAddEditProperty(e) {
  e.preventDefault();
  
  // Verifica se o usuário está autenticado
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast('warning', 'Acesso restrito', 'Faça login para adicionar ou editar imóveis.');
    uiModule.navigateTo('login-page');
    return;
  }
  
  // Exibe o overlay de carregamento
  uiModule.showLoading();
  
  // Obtém os valores do formulário
  // (Implementação similar à função handlePropertySubmission)
  // ...
  
  // Cria o objeto do imóvel
  const property = {
    // Propriedades do imóvel
    // ...
    userId: currentUser.uid,
    status: 'active',
    views: currentEditingProperty ? currentEditingProperty.views || 0 : 0,
    featured: false // Por padrão, não é destaque
  };
  
  // Se for uma edição, mantém a data de criação original
  if (currentEditingProperty && currentEditingProperty.createdAt) {
    property.createdAt = currentEditingProperty.createdAt;
    property.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  } else {
    property.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  }
  
  // Adiciona ou atualiza o imóvel no Firestore
  const propertyRef = currentEditingProperty ? 
    firebaseHelper.getPropertiesCollection().doc(currentEditingProperty.id) : 
    firebaseHelper.getPropertiesCollection().doc();
  
  propertyRef.set(property, { merge: true })
    .then(() => {
      // Upload das imagens (se houver novas)
      if (selectedImages.length > 0) {
        uploadPropertyImages(propertyRef.id, selectedImages)
          .then(imageUrls => {
            // Combina as URLs existentes com as novas (se for edição)
            let allImageUrls = imageUrls;
            if (currentEditingProperty && currentEditingProperty.images) {
              allImageUrls = [...currentEditingProperty.images, ...imageUrls];
            }
            
            // Atualiza o documento com as URLs das imagens
            return propertyRef.update({
              images: allImageUrls
            });
          })
          .then(() => {
            finishPropertySave(currentEditingProperty ? 'update' : 'add');
          })
          .catch(error => {
            console.error('Erro ao fazer upload das imagens:', error);
            uiModule.hideLoading();
            uiModule.showToast('error', 'Erro no upload', 'Ocorreu um erro ao enviar as imagens. Tente novamente mais tarde.');
          });
      } else {
        finishPropertySave(currentEditingProperty ? 'update' : 'add');
      }
    })
    .catch(error => {
      console.error('Erro ao salvar imóvel:', error);
      uiModule.hideLoading();
      uiModule.showToast('error', 'Erro ao salvar', 'Ocorreu um erro ao salvar o imóvel. Tente novamente mais tarde.');
    });
}

/**
 * Finaliza o processo de salvamento de um imóvel
 * @param {String} action - Ação realizada (add/update)
 */
function finishPropertySave(action) {
  // Oculta o overlay de carregamento
  uiModule.hideLoading();
  
  // Exibe mensagem de sucesso
  if (action === 'add') {
    uiModule.showToast('success', 'Imóvel adicionado', 'O imóvel foi adicionado com sucesso.');
  } else {
    uiModule.showToast('success', 'Imóvel atualizado', 'O imóvel foi atualizado com sucesso.');
  }
  
  // Fecha o modal
  closeModal();
  
  // Limpa o formulário e variáveis
  if (addPropertyForm) {
    addPropertyForm.reset();
  }
  selectedImages = [];
  currentEditingProperty = null;
  
  // Recarrega os imóveis do usuário
  loadUserProperties();
}

/**
 * Manipula a seleção de imagens
 * @param {Event} e - Evento de change do input de arquivo
 */
function handleImageSelection(e) {
  const files = e.target.files;
  
  if (!files || files.length === 0) return;
  
  // Adiciona as novas imagens à lista de selecionadas
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Verifica se o arquivo é uma imagem
    if (!file.type.startsWith('image/')) {
      uiModule.showToast('warning', 'Arquivo inválido', 'Por favor, selecione apenas arquivos de imagem.');
      continue;
    }
    
    // Verifica o tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      uiModule.showToast('warning', 'Arquivo muito grande', 'O tamanho máximo permitido é 5MB por imagem.');
      continue;
    }
    
    // Adiciona o arquivo à lista
    selectedImages.push(file);
    
    // Cria a prévia da imagem
    createImagePreview(file);
  }
}

/**
 * Manipula o evento de arrastar sobre a área de upload
 * @param {Event} e - Evento de dragover
 */
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.add('dragover');
}

/**
 * Manipula o evento de soltar arquivos na área de upload
 * @param {Event} e - Evento de drop
 */
function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  
  if (!files || files.length === 0) return;
  
  // Simula a seleção de arquivos
  const event = { target: { files } };
  handleImageSelection(event);
}

/**
 * Cria uma prévia de imagem
 * @param {File} file - Arquivo de imagem
 */
function createImagePreview(file) {
  if (!imagePreviewContainer) return;
  
  // Cria um elemento de prévia
  const preview = document.createElement('div');
  preview.className = 'image-preview';
  
  // Cria um ID único para o arquivo
  const fileId = `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  preview.setAttribute('data-file-id', fileId);
  file.id = fileId;
  
  // Cria a imagem
  const img = document.createElement('img');
  const reader = new FileReader();
  
  reader.onload = function(e) {
    img.src = e.target.result;
  };
  
  reader.readAsDataURL(file);
  
  // Cria o botão de remover
  const removeBtn = document.createElement('div');
  removeBtn.className = 'remove-image';
  removeBtn.innerHTML = '<i class="fas fa-times"></i>';
  removeBtn.addEventListener('click', () => removeImagePreview(fileId));
  
  // Adiciona os elementos à prévia
  preview.appendChild(img);
  preview.appendChild(removeBtn);
  
  // Adiciona a prévia ao container
  imagePreviewContainer.appendChild(preview);
}

/**
 * Remove uma prévia de imagem
 * @param {String} fileId - ID do arquivo
 */
function removeImagePreview(fileId) {
  // Remove o elemento de prévia
  const preview = document.querySelector(`.image-preview[data-file-id="${fileId}"]`);
  if (preview) {
    preview.remove();
  }
  
  // Remove o arquivo da lista
  selectedImages = selectedImages.filter(file => file.id !== fileId);
}

/**
 * Faz upload das imagens de um imóvel
 * @param {String} propertyId - ID do imóvel
 * @param {Array} images - Array de arquivos de imagem
 * @param {String} type - Tipo de imóvel (normal/pending)
 * @returns {Promise<Array>} Promise com array de URLs das imagens
 */
function uploadPropertyImages(propertyId, images, type = 'normal') {
  return new Promise((resolve, reject) => {
    if (!images || images.length === 0) {
      resolve([]);
      return;
    }
    
    const currentUser = firebaseHelper.getCurrentUser();
    if (!currentUser) {
      reject(new Error('Usuário não autenticado'));
      return;
    }
    
    const userId = currentUser.uid;
    const imageUrls = [];
    let uploadedCount = 0;
    
    // Determina a pasta de destino com base no tipo
    const folder = type === 'pending' ? 'pending' : 'properties';
    
    // Faz upload de cada imagem
    images.forEach((image, index) => {
      const extension = image.name.split('.').pop();
      const imageName = `${propertyId}_${Date.now()}_${index}.${extension}`;
      const imageRef = storage.ref(`users/${userId}/${folder}/${propertyId}/${imageName}`);
      
      const uploadTask = imageRef.put(image);
      
      uploadTask.on('state_changed',
        // Progresso do upload
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload da imagem ${index + 1}: ${progress.toFixed(2)}%`);
        },
        // Erro no upload
        (error) => {
          console.error('Erro no upload da imagem:', error);
          reject(error);
        },
        // Upload concluído
        () => {
          // Obtém a URL da imagem
          uploadTask.snapshot.ref.getDownloadURL()
            .then(downloadURL => {
              imageUrls.push(downloadURL);
              uploadedCount++;
              
              // Verifica se todas as imagens foram enviadas
              if (uploadedCount === images.length) {
                resolve(imageUrls);
              }
            })
            .catch(error => {
              console.error('Erro ao obter URL da imagem:', error);
              reject(error);
            });
        }
      );
    });
  });
}

/**
 * Exibe o modal de adicionar imóvel
 */
function showAddPropertyModal() {
  // Verifica se o usuário está autenticado
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast('warning', 'Acesso restrito', 'Faça login para adicionar imóveis.');
    uiModule.navigateTo('login-page');
    return;
  }
  
  // Limpa o formulário e variáveis
  if (addPropertyForm) {
    addPropertyForm.reset();
  }
  selectedImages = [];
  currentEditingProperty = null;
  
  // Limpa as prévias de imagem
  if (imagePreviewContainer) {
    imagePreviewContainer.innerHTML = '';
  }
  
  // Atualiza o título do modal
  const modalTitle = document.querySelector('#add-property-modal .modal-header h2');
  if (modalTitle) {
    modalTitle.textContent = 'Adicionar imóvel';
  }
  
  // Exibe o modal
  const modal = document.getElementById('add-property-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Edita um imóvel
 * @param {Object} property - Dados do imóvel
 */
function editProperty(property) {
  // Verifica se o usuário está autenticado
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast('warning', 'Acesso restrito', 'Faça login para editar imóveis.');
    uiModule.navigateTo('login-page');
    return;
  }
  
  // Verifica se o usuário é o proprietário do imóvel
  if (property.userId !== currentUser.uid) {
    uiModule.showToast('warning', 'Acesso restrito', 'Você não tem permissão para editar este imóvel.');
    return;
  }
  
  // Armazena o imóvel em edição
  currentEditingProperty = property;
  
  // Limpa as prévias de imagem
  if (imagePreviewContainer) {
    imagePreviewContainer.innerHTML = '';
  }
  
  // Limpa a lista de imagens selecionadas
  selectedImages = [];
  
  // Preenche o formulário com os dados do imóvel
  // (Implementação depende dos campos do formulário)
  // ...
  
  // Cria prévias para as imagens existentes
  if (property.images && property.images.length > 0) {
    property.images.forEach((imageUrl, index) => {
      // Cria um elemento de prévia
      const preview = document.createElement('div');
      preview.className = 'image-preview';
      
      // Cria um ID único para a imagem
      const imageId = `existing-image-${index}`;
      preview.setAttribute('data-image-id', imageId);
      
      // Cria a imagem
      const img = document.createElement('img');
      img.src = imageUrl;
      
      // Cria o botão de remover
      const removeBtn = document.createElement('div');
      removeBtn.className = 'remove-image';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.addEventListener('click', () => removeExistingImage(imageId, index));
      
      // Adiciona os elementos à prévia
      preview.appendChild(img);
      preview.appendChild(removeBtn);
      
      // Adiciona a prévia ao container
      if (imagePreviewContainer) {
        imagePreviewContainer.appendChild(preview);
      }
    });
  }
  
  // Atualiza o título do modal
  const modalTitle = document.querySelector('#add-property-modal .modal-header h2');
  if (modalTitle) {
    modalTitle.textContent = 'Editar imóvel';
  }
  
  // Exibe o modal
  const modal = document.getElementById('add-property-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Remove uma imagem existente de um imóvel
 * @param {String} imageId - ID da imagem
 * @param {Number} index - Índice da imagem no array
 */
function removeExistingImage(imageId, index) {
  // Remove o elemento de prévia
  const preview = document.querySelector(`.image-preview[data-image-id="${imageId}"]`);
  if (preview) {
    preview.remove();
  }
  
  // Remove a imagem do array de imagens do imóvel
  if (currentEditingProperty && currentEditingProperty.images) {
    currentEditingProperty.images.splice(index, 1);
  }
}

/**
 * Exclui um imóvel
 * @param {String} propertyId - ID do imóvel
 * @param {String} propertyTitle - Título do imóvel
 */
function deleteProperty(propertyId, propertyTitle) {
  // Verifica se o usuário está autenticado
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast('warning', 'Acesso restrito', 'Faça login para excluir imóveis.');
    uiModule.navigateTo('login-page');
    return;
  }
  
  // Exibe modal de confirmação
  uiModule.showConfirmModal(`Tem certeza que deseja excluir o imóvel "${propertyTitle}"?`, () => {
    // Exibe overlay de carregamento
    uiModule.showLoading();
    
    // Exclui o imóvel do Firestore
    firebaseHelper.getPropertiesCollection().doc(propertyId).delete()
      .then(() => {
        // Exclusão bem-sucedida
        uiModule.hideLoading();
        uiModule.showToast('success', 'Imóvel excluído', 'O imóvel foi excluído com sucesso.');
        
        // Recarrega os imóveis do usuário
        loadUserProperties();
      })
      .catch(error => {
        console.error('Erro ao excluir imóvel:', error);
        uiModule.hideLoading();
        uiModule.showToast('error', 'Erro ao excluir', 'Ocorreu um erro ao excluir o imóvel. Tente novamente mais tarde.');
      });
  });
}

/**
 * Edita um imóvel pendente
 * @param {Object} property - Dados do imóvel pendente
 */
function editPendingProperty(property) {
  // Implementação similar à função editProperty
  // ...
}

/**
 * Aprova um imóvel pendente
 * @param {Object} property - Dados do imóvel pendente
 */
function approveProperty(property) {
  // Verifica se o usuário está autenticado
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast('warning', 'Acesso restrito', 'Faça login para aprovar imóveis.');
    uiModule.navigateTo('login-page');
    return;
  }
  
  // Exibe modal de confirmação
  uiModule.showConfirmModal(`Tem certeza que deseja aprovar o imóvel "${property.title}"?`, () => {
    // Exibe overlay de carregamento
    uiModule.showLoading();
    
    // Cria o objeto do imóvel aprovado
    const approvedProperty = {
      ...property,
      status: 'active',
      userId: currentUser.uid,
      approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      views: 0
    };
    
    // Remove campos desnecessários
    delete approvedProperty.id;
    
    // Adiciona o imóvel aprovado à coleção de imóveis
    firebaseHelper.getPropertiesCollection().add(approvedProperty)
      .then(() => {
        // Remove o imóvel pendente
        return firebaseHelper.getPendingPropertiesCollection().doc(property.id).delete();
      })
      .then(() => {
        // Aprovação bem-sucedida
        uiModule.hideLoading();
        uiModule.showToast('success', 'Imóvel aprovado', 'O imóvel foi aprovado e publicado com sucesso.');
        
        // Recarrega os imóveis pendentes
        loadPendingProperties();
        
        // Notifica o proprietário
        if (property.ownerEmail) {
          // Implementação da notificação por e-mail (se disponível)
          // ...
        }
      })
      .catch(error => {
        console.error('Erro ao aprovar imóvel:', error);
        uiModule.hideLoading();
        uiModule.showToast('error', 'Erro ao aprovar', 'Ocorreu um erro ao aprovar o imóvel. Tente novamente mais tarde.');
      });
  });
}

/**
 * Rejeita um imóvel pendente
 * @param {String} propertyId - ID do imóvel pendente
 * @param {String} propertyTitle - Título do imóvel pendente
 */
function rejectProperty(propertyId, propertyTitle) {
  // Verifica se o usuário está autenticado
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast('warning', 'Acesso restrito', 'Faça login para rejeitar imóveis.');
    uiModule.navigateTo('login-page');
    return;
  }
  
  // Exibe modal de confirmação
  uiModule.showConfirmModal(`Tem certeza que deseja rejeitar o imóvel "${propertyTitle}"?`, () => {
    // Exibe overlay de carregamento
    uiModule.showLoading();
    
    // Exclui o imóvel pendente do Firestore
    firebaseHelper.getPendingPropertiesCollection().doc(propertyId).delete()
      .then(() => {
        // Rejeição bem-sucedida
        uiModule.hideLoading();
        uiModule.showToast('success', 'Imóvel rejeitado', 'O imóvel foi rejeitado com sucesso.');
        
        // Recarrega os imóveis pendentes
        loadPendingProperties();
      })
      .catch(error => {
        console.error('Erro ao rejeitar imóvel:', error);
        uiModule.hideLoading();
        uiModule.showToast('error', 'Erro ao rejeitar', 'Ocorreu um erro ao rejeitar o imóvel. Tente novamente mais tarde.');
      });
  });
}

/**
 * Aplica os filtros na página de listagem de imóveis
 */
function applyFilters() {
  // Implementação dos filtros
  // ...
  
  uiModule.showToast('info', 'Filtros aplicados', 'Os filtros foram aplicados com sucesso.');
}

/**
 * Limpa os filtros na página de listagem de imóveis
 */
function clearFilters() {
  // Limpa os filtros
  // ...
  
  uiModule.showToast('info', 'Filtros limpos', 'Os filtros foram limpos com sucesso.');
}

/**
 * Manipula a mudança de ordenação
 * @param {Event} e - Evento de change do select
 */
function handleSortChange(e) {
  const sortValue = e.target.value;
  
  // Implementação da ordenação
  // ...
  
  uiModule.showToast('info', 'Ordenação alterada', `Imóveis ordenados por: ${getSortLabel(sortValue)}`);
}

/**
 * Obtém o label de uma opção de ordenação
 * @param {String} sortValue - Valor da ordenação
 * @returns {String} Label da ordenação
 */
function getSortLabel(sortValue) {
  const sortLabels = {
    'recent': 'Mais recentes',
    'oldest': 'Mais antigos',
    'price-asc': 'Menor preço',
    'price-desc': 'Maior preço',
    'views-desc': 'Mais visualizados'
  };
  
  return sortLabels[sortValue] || sortValue;
}

/**
 * Notifica um corretor sobre um evento
 * @param {String} brokerId - ID do corretor
 * @param {String} title - Título da notificação
 * @param {String} message - Mensagem da notificação
 */
function notifyBroker(brokerId, title, message) {
  // Adiciona uma notificação ao Firestore
  firebaseHelper.db.collection('notifications').add({
    userId: brokerId,
    title,
    message,
    read: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(error => {
    console.error('Erro ao enviar notificação:', error);
  });
}

/**
 * Atualiza os contadores no dashboard
 */
function updateDashboardCounters() {
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  
  // Contador de imóveis
  firebaseHelper.getPropertiesCollection()
    .where('userId', '==', userId)
    .get()
    .then(snapshot => {
      const totalProperties = snapshot.size;
      const totalPropertiesElement = document.getElementById('total-properties');
      if (totalPropertiesElement) {
        totalPropertiesElement.textContent = totalProperties;
      }
    })
    .catch(error => {
      console.error('Erro ao contar imóveis:', error);
    });
  
  // Contador de imóveis pendentes
  firebaseHelper.getPendingPropertiesCollection()
    .where('brokerId', '==', userId)
    .get()
    .then(snapshot => {
      const pendingProperties = snapshot.size;
      const pendingPropertiesElement = document.getElementById('pending-properties');
      if (pendingPropertiesElement) {
        pendingPropertiesElement.textContent = pendingProperties;
      }
    })
    .catch(error => {
      console.error('Erro ao contar imóveis pendentes:', error);
    });
  
  // Contador de visualizações
  firebaseHelper.getPropertiesCollection()
    .where('userId', '==', userId)
    .get()
    .then(snapshot => {
      let totalViews = 0;
      snapshot.forEach(doc => {
        const property = doc.data();
        totalViews += property.views || 0;
      });
      
      const totalViewsElement = document.getElementById('total-views');
      if (totalViewsElement) {
        totalViewsElement.textContent = totalViews;
      }
    })
    .catch(error => {
      console.error('Erro ao contar visualizações:', error);
    });
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

// Exportação das funções para uso em outros arquivos
window.propertiesModule = {
  initProperties,
  loadFeaturedProperties,
  loadProperties,
  loadUserProperties,
  loadPendingProperties,
  handlePropertySubmission,
  handleAddEditProperty,
  showAddPropertyModal,
  editProperty,
  deleteProperty,
  approveProperty,
  rejectProperty
};
