/**
 * ImobConnect - Sistema para Corretores de Imóveis
 * Módulo do Painel Administrativo
 */

// Referências aos elementos do DOM do dashboard
const dashboardUserName = document.getElementById("dashboard-user-name");
const dashboardUserEmail = document.getElementById("dashboard-user-email");
const dashboardUserAvatar = document.getElementById("dashboard-user-avatar");
const profileForm = document.getElementById("profile-form");
const avatarUploadInput = document.getElementById("avatar-upload");
const profileAvatarPreview = document.getElementById("profile-avatar-preview");
const appearanceForm = document.getElementById("dashboard-appearance"); // Assuming form wrapper
const logoUploadInput = document.getElementById("logo-upload");
const logoPreview = document.getElementById("logo-preview");
const removeLogoBtn = document.getElementById("remove-logo");
const primaryColorInput = document.getElementById("primary-color");
const secondaryColorInput = document.getElementById("secondary-color");
const textColorInput = document.getElementById("text-color");
const primaryColorHex = document.getElementById("primary-color-hex");
const secondaryColorHex = document.getElementById("secondary-color-hex");
const textColorHex = document.getElementById("text-color-hex");
const customUrlInput = document.getElementById("custom-url");
const saveAppearanceBtn = document.getElementById("save-appearance");
const resetAppearanceBtn = document.getElementById("reset-appearance");
const settingsForm = document.getElementById("dashboard-settings"); // Assuming form wrapper
const themeSwitch = document.getElementById("theme-switch");
const saveSettingsBtn = document.getElementById("save-settings");
const resetSettingsBtn = document.getElementById("reset-settings");
const deletePropertiesBtn = document.getElementById("delete-properties");
const deleteAccountBtn = document.getElementById("delete-account");

// Armazena o arquivo de avatar selecionado
let selectedAvatarFile = null;
// Armazena o arquivo de logo selecionado
let selectedLogoFile = null;

/**
 * Inicializa o módulo do dashboard
 */
function initDashboard() {
  // Adiciona listeners aos elementos do dashboard
  addDashboardListeners();

  // Adiciona listener para o evento de dados do usuário carregados
  document.addEventListener("userDataLoaded", (e) => {
    const userData = e.detail;
    populateDashboard(userData);
  });
}

/**
 * Adiciona event listeners aos elementos do dashboard
 */
function addDashboardListeners() {
  // Formulário de perfil
  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileUpdate);
  }

  // Upload de avatar
  if (avatarUploadInput) {
    avatarUploadInput.addEventListener("change", handleAvatarSelection);
  }

  // Upload de logo
  if (logoUploadInput) {
    logoUploadInput.addEventListener("change", handleLogoSelection);
  }

  // Remover logo
  if (removeLogoBtn) {
    removeLogoBtn.addEventListener("click", handleRemoveLogo);
  }

  // Atualização de cores
  if (primaryColorInput) primaryColorInput.addEventListener("input", handleColorChange);
  if (secondaryColorInput) secondaryColorInput.addEventListener("input", handleColorChange);
  if (textColorInput) textColorInput.addEventListener("input", handleColorChange);
  if (primaryColorHex) primaryColorHex.addEventListener("change", handleHexColorChange);
  if (secondaryColorHex) secondaryColorHex.addEventListener("change", handleHexColorChange);
  if (textColorHex) textColorHex.addEventListener("change", handleHexColorChange);

  // Salvar aparência
  if (saveAppearanceBtn) {
    saveAppearanceBtn.addEventListener("click", handleSaveAppearance);
  }

  // Restaurar aparência padrão
  if (resetAppearanceBtn) {
    resetAppearanceBtn.addEventListener("click", handleResetAppearance);
  }

  // Switch de tema nas configurações
  if (themeSwitch) {
    themeSwitch.addEventListener("change", handleSettingsThemeChange);
  }

  // Salvar configurações
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", handleSaveSettings);
  }

  // Restaurar configurações padrão
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener("click", handleResetSettings);
  }

  // Excluir todos os imóveis
  if (deletePropertiesBtn) {
    deletePropertiesBtn.addEventListener("click", handleDeleteAllProperties);
  }

  // Excluir conta
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", handleDeleteAccount);
  }
}

/**
 * Preenche o dashboard com os dados do usuário
 * @param {Object} userData - Dados do usuário
 */
function populateDashboard(userData) {
  if (!userData) return;

  // Informações do usuário na sidebar
  if (dashboardUserName) dashboardUserName.textContent = userData.name || "Usuário";
  if (dashboardUserEmail) dashboardUserEmail.textContent = userData.email || "";
  if (dashboardUserAvatar) dashboardUserAvatar.src = userData.photoURL || "assets/images/default-avatar.png";

  // Formulário de perfil
  populateProfileForm(userData);

  // Formulário de aparência
  populateAppearanceForm(userData);

  // Formulário de configurações
  populateSettingsForm(userData);

  // Atualiza os contadores
  propertiesModule.updateDashboardCounters();
}

/**
 * Preenche o formulário de perfil
 * @param {Object} userData - Dados do usuário
 */
function populateProfileForm(userData) {
  if (!profileForm) return;

  document.getElementById("profile-name").value = userData.name || "";
  document.getElementById("profile-email").value = userData.email || "";
  document.getElementById("profile-phone").value = userData.phone || "";
  document.getElementById("profile-whatsapp").value = userData.whatsapp || "";
  document.getElementById("profile-company").value = userData.company || "";
  document.getElementById("profile-creci").value = userData.creci || "";
  document.getElementById("profile-bio").value = userData.bio || "";
  document.getElementById("profile-website").value = userData.social?.website || "";
  document.getElementById("profile-instagram").value = userData.social?.instagram || "";
  document.getElementById("profile-facebook").value = userData.social?.facebook || "";
  document.getElementById("profile-linkedin").value = userData.social?.linkedin || "";

  if (profileAvatarPreview) {
    profileAvatarPreview.src = userData.photoURL || "assets/images/default-avatar.png";
  }
}

/**
 * Preenche o formulário de aparência
 * @param {Object} userData - Dados do usuário
 */
function populateAppearanceForm(userData) {
  if (!appearanceForm) return;

  // Logo
  if (logoPreview) {
    logoPreview.src = userData.logoUrl || "assets/images/default-logo.png";
  }

  // Cores
  const settings = userData.settings || {};
  if (primaryColorInput) primaryColorInput.value = settings.primaryColor || "#4a6cf7";
  if (secondaryColorInput) secondaryColorInput.value = settings.secondaryColor || "#f97316";
  if (textColorInput) textColorInput.value = settings.textColor || "#1e293b";
  if (primaryColorHex) primaryColorHex.value = settings.primaryColor || "#4a6cf7";
  if (secondaryColorHex) secondaryColorHex.value = settings.secondaryColor || "#f97316";
  if (textColorHex) textColorHex.value = settings.textColor || "#1e293b";

  // Link personalizado
  if (customUrlInput) {
    customUrlInput.value = userData.customUrl || "";
  }
}

/**
 * Preenche o formulário de configurações
 * @param {Object} userData - Dados do usuário
 */
function populateSettingsForm(userData) {
  if (!settingsForm) return;

  const settings = userData.settings || {};

  // Tema
  if (themeSwitch) {
    themeSwitch.checked = settings.theme === "dark";
  }

  // Idioma (se implementado)
  // const languageSelect = document.getElementById("language-select");
  // if (languageSelect) languageSelect.value = settings.language || "pt-BR";

  // Notificações por e-mail
  const emailNotifications = settings.emailNotifications || {};
  document.querySelector("input[name='email-notifications'][value='new-message']").checked = emailNotifications.newMessage !== false;
  document.querySelector("input[name='email-notifications'][value='new-property']").checked = emailNotifications.newProperty !== false;
  document.querySelector("input[name='email-notifications'][value='property-view']").checked = emailNotifications.propertyView !== false;
  document.querySelector("input[name='email-notifications'][value='account']").checked = emailNotifications.account !== false;

  // Notificações push (se implementado)
  // const pushSwitch = document.getElementById("push-switch");
  // if (pushSwitch) pushSwitch.checked = settings.pushNotifications !== false;

  // Visibilidade do perfil (se implementado)
  // const profileVisibilitySelect = document.getElementById("profile-visibility");
  // if (profileVisibilitySelect) profileVisibilitySelect.value = settings.profileVisibility || "public";

  // Compartilhamento de dados (se implementado)
  // const dataSharingAnalytics = document.querySelector("input[name='data-sharing'][value='analytics']");
  // const dataSharingMarketing = document.querySelector("input[name='data-sharing'][value='marketing']");
  // if (dataSharingAnalytics) dataSharingAnalytics.checked = settings.dataSharing?.analytics !== false;
  // if (dataSharingMarketing) dataSharingMarketing.checked = settings.dataSharing?.marketing !== false;
}

/**
 * Manipula a atualização do perfil do usuário
 * @param {Event} e - Evento de submit do formulário
 */
function handleProfileUpdate(e) {
  e.preventDefault();

  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast("warning", "Acesso restrito", "Faça login para atualizar seu perfil.");
    return;
  }

  uiModule.showLoading();

  // Obtém os dados do formulário
  const name = document.getElementById("profile-name").value;
  const phone = document.getElementById("profile-phone").value;
  const whatsapp = document.getElementById("profile-whatsapp").value;
  const company = document.getElementById("profile-company").value;
  const creci = document.getElementById("profile-creci").value;
  const bio = document.getElementById("profile-bio").value;
  const website = document.getElementById("profile-website").value;
  const instagram = document.getElementById("profile-instagram").value;
  const facebook = document.getElementById("profile-facebook").value;
  const linkedin = document.getElementById("profile-linkedin").value;

  const profileData = {
    name,
    phone,
    whatsapp,
    company,
    creci,
    bio,
    social: {
      website,
      instagram,
      facebook,
      linkedin,
    },
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  // Atualiza os dados no Firestore
  const userDocRef = firebaseHelper.getUsersCollection().doc(currentUser.uid);
  userDocRef.update(profileData)
    .then(() => {
      // Atualiza o nome no Firebase Auth (se alterado)
      if (name !== currentUser.displayName) {
        return currentUser.updateProfile({ displayName: name });
      }
    })
    .then(() => {
      // Faz upload do avatar (se selecionado)
      if (selectedAvatarFile) {
        return uploadAvatar(currentUser.uid, selectedAvatarFile);
      }
    })
    .then(() => {
      // Atualiza a senha (se fornecida)
      const currentPassword = document.getElementById("profile-current-password").value;
      const newPassword = document.getElementById("profile-new-password").value;
      const confirmPassword = document.getElementById("profile-confirm-password").value;

      if (newPassword && currentPassword) {
        if (newPassword !== confirmPassword) {
          uiModule.hideLoading();
          uiModule.showToast("error", "Erro ao alterar senha", "As novas senhas não coincidem.");
          return Promise.reject("Passwords do not match");
        }
        return updatePassword(currentPassword, newPassword);
      }
    })
    .then(() => {
      uiModule.hideLoading();
      uiModule.showToast("success", "Perfil atualizado", "Suas informações foram salvas com sucesso.");
      selectedAvatarFile = null; // Limpa o arquivo selecionado
      // Limpa os campos de senha
      document.getElementById("profile-current-password").value = "";
      document.getElementById("profile-new-password").value = "";
      document.getElementById("profile-confirm-password").value = "";
    })
    .catch(error => {
      uiModule.hideLoading();
      console.error("Erro ao atualizar perfil:", error);
      if (error !== "Passwords do not match") {
        uiModule.showToast("error", "Erro ao atualizar", "Ocorreu um erro ao salvar suas informações.");
      }
    });
}

/**
 * Manipula a seleção do arquivo de avatar
 * @param {Event} e - Evento de change do input
 */
function handleAvatarSelection(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Verifica se é uma imagem
  if (!file.type.startsWith("image/")) {
    uiModule.showToast("warning", "Arquivo inválido", "Selecione um arquivo de imagem.");
    return;
  }

  // Verifica o tamanho (máximo 2MB)
  if (file.size > 2 * 1024 * 1024) {
    uiModule.showToast("warning", "Arquivo muito grande", "O tamanho máximo para o avatar é 2MB.");
    return;
  }

  selectedAvatarFile = file;

  // Exibe a prévia
  const reader = new FileReader();
  reader.onload = (event) => {
    if (profileAvatarPreview) {
      profileAvatarPreview.src = event.target.result;
    }
  };
  reader.readAsDataURL(file);
}

/**
 * Faz upload do avatar do usuário
 * @param {String} userId - ID do usuário
 * @param {File} file - Arquivo de imagem
 * @returns {Promise}
 */
function uploadAvatar(userId, file) {
  return new Promise((resolve, reject) => {
    const extension = file.name.split(".").pop();
    const fileName = `avatar.${extension}`;
    const storageRef = firebaseHelper.getProfileImagesStorage(userId).child(fileName);

    const uploadTask = storageRef.put(file);

    uploadTask.on("state_changed",
      (snapshot) => { /* Progresso */ },
      (error) => {
        console.error("Erro no upload do avatar:", error);
        reject(error);
      },
      () => {
        // Upload concluído, obtém a URL
        uploadTask.snapshot.ref.getDownloadURL()
          .then(downloadURL => {
            // Atualiza a URL no Firebase Auth
            return firebaseHelper.getCurrentUser().updateProfile({ photoURL: downloadURL })
              .then(() => {
                // Atualiza a URL no Firestore
                return firebaseHelper.getUsersCollection().doc(userId).update({ photoURL: downloadURL });
              });
          })
          .then(() => {
            // Atualiza a imagem na UI
            if (dashboardUserAvatar) dashboardUserAvatar.src = firebaseHelper.getCurrentUser().photoURL;
            if (profileAvatarPreview) profileAvatarPreview.src = firebaseHelper.getCurrentUser().photoURL;
            const userAvatarHeader = document.getElementById("user-avatar");
            if (userAvatarHeader) userAvatarHeader.src = firebaseHelper.getCurrentUser().photoURL;
            resolve();
          })
          .catch(error => {
            console.error("Erro ao atualizar URL do avatar:", error);
            reject(error);
          });
      }
    );
  });
}

/**
 * Atualiza a senha do usuário
 * @param {String} currentPassword - Senha atual
 * @param {String} newPassword - Nova senha
 * @returns {Promise}
 */
function updatePassword(currentPassword, newPassword) {
  const user = firebaseHelper.getCurrentUser();
  const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);

  // Reautentica o usuário antes de alterar a senha
  return user.reauthenticateWithCredential(credential)
    .then(() => {
      // Reautenticação bem-sucedida, atualiza a senha
      return user.updatePassword(newPassword);
    })
    .catch(error => {
      console.error("Erro ao reautenticar ou atualizar senha:", error);
      let message = "Ocorreu um erro ao alterar a senha.";
      if (error.code === "auth/wrong-password") {
        message = "Senha atual incorreta.";
      }
      uiModule.showToast("error", "Erro ao alterar senha", message);
      return Promise.reject(error);
    });
}

/**
 * Manipula a seleção do arquivo de logo
 * @param {Event} e - Evento de change do input
 */
function handleLogoSelection(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Verifica se é uma imagem
  if (!file.type.startsWith("image/")) {
    uiModule.showToast("warning", "Arquivo inválido", "Selecione um arquivo de imagem.");
    return;
  }

  // Verifica o tamanho (máximo 2MB)
  if (file.size > 2 * 1024 * 1024) {
    uiModule.showToast("warning", "Arquivo muito grande", "O tamanho máximo para o logo é 2MB.");
    return;
  }

  selectedLogoFile = file;

  // Exibe a prévia
  const reader = new FileReader();
  reader.onload = (event) => {
    if (logoPreview) {
      logoPreview.src = event.target.result;
    }
  };
  reader.readAsDataURL(file);
}

/**
 * Manipula a remoção do logo
 */
function handleRemoveLogo() {
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) return;

  uiModule.showConfirmModal("Tem certeza que deseja remover seu logo?", () => {
    uiModule.showLoading();
    const userId = currentUser.uid;

    // Remove a URL do Firestore
    firebaseHelper.getUsersCollection().doc(userId).update({
      logoUrl: firebase.firestore.FieldValue.delete()
    })
    .then(() => {
      // Remove o arquivo do Storage (opcional, mas recomendado)
      // Pode ser necessário listar arquivos na pasta e deletar
      // const logoRef = firebaseHelper.getLogoStorage(userId).child("logo.ext"); // Precisa saber o nome/extensão
      // return logoRef.delete();
    })
    .then(() => {
      uiModule.hideLoading();
      uiModule.showToast("success", "Logo removido", "Seu logo foi removido com sucesso.");
      // Atualiza a UI
      if (logoPreview) logoPreview.src = "assets/images/default-logo.png";
      const headerLogo = document.getElementById("logo-img");
      if (headerLogo) headerLogo.src = "assets/images/default-logo.png";
      selectedLogoFile = null;
    })
    .catch(error => {
      uiModule.hideLoading();
      console.error("Erro ao remover logo:", error);
      uiModule.showToast("error", "Erro ao remover", "Ocorreu um erro ao remover o logo.");
    });
  });
}

/**
 * Faz upload do logo do usuário
 * @param {String} userId - ID do usuário
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<String>} Promise com a URL do logo
 */
function uploadLogo(userId, file) {
  return new Promise((resolve, reject) => {
    const extension = file.name.split(".").pop();
    const fileName = `logo.${extension}`;
    const storageRef = firebaseHelper.getLogoStorage(userId).child(fileName);

    const uploadTask = storageRef.put(file);

    uploadTask.on("state_changed",
      (snapshot) => { /* Progresso */ },
      (error) => {
        console.error("Erro no upload do logo:", error);
        reject(error);
      },
      () => {
        // Upload concluído, obtém a URL
        uploadTask.snapshot.ref.getDownloadURL()
          .then(downloadURL => {
            resolve(downloadURL);
          })
          .catch(error => {
            console.error("Erro ao obter URL do logo:", error);
            reject(error);
          });
      }
    );
  });
}

/**
 * Manipula a mudança de cor nos inputs color
 * @param {Event} e - Evento de input
 */
function handleColorChange(e) {
  const input = e.target;
  const hexInputId = input.id + "-hex";
  const hexInput = document.getElementById(hexInputId);
  if (hexInput) {
    hexInput.value = input.value;
  }
  updateThemePreview();
}

/**
 * Manipula a mudança de cor nos inputs text (hex)
 * @param {Event} e - Evento de change
 */
function handleHexColorChange(e) {
  const hexInput = e.target;
  const colorInputId = hexInput.id.replace("-hex", "");
  const colorInput = document.getElementById(colorInputId);
  if (colorInput && /^#[0-9A-F]{6}$/i.test(hexInput.value)) {
    colorInput.value = hexInput.value;
  }
  updateThemePreview();
}

/**
 * Atualiza a pré-visualização do tema
 */
function updateThemePreview() {
  const previewContainer = document.querySelector(".theme-preview-container");
  if (!previewContainer) return;

  const primary = primaryColorInput?.value || "#4a6cf7";
  const secondary = secondaryColorInput?.value || "#f97316";
  const text = textColorInput?.value || "#1e293b";

  const previewHeader = previewContainer.querySelector(".preview-header");
  const previewCards = previewContainer.querySelectorAll(".preview-card");
  const previewButton = previewContainer.querySelector(".preview-button");

  if (previewHeader) previewHeader.style.backgroundColor = primary;
  if (previewButton) previewButton.style.backgroundColor = secondary;
  previewCards.forEach(card => card.style.borderColor = primary);

  // Simular cor do texto (pode ser mais complexo)
  // previewContainer.style.color = text;
}

/**
 * Manipula o salvamento das configurações de aparência
 */
function handleSaveAppearance() {
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast("warning", "Acesso restrito", "Faça login para personalizar a aparência.");
    return;
  }

  uiModule.showLoading();
  const userId = currentUser.uid;

  const primaryColor = primaryColorInput?.value || "#4a6cf7";
  const secondaryColor = secondaryColorInput?.value || "#f97316";
  const textColor = textColorInput?.value || "#1e293b";
  const customUrl = customUrlInput?.value.trim() || "";

  const appearanceData = {
    "settings.primaryColor": primaryColor,
    "settings.secondaryColor": secondaryColor,
    "settings.textColor": textColor,
    customUrl: customUrl,
  };

  // Faz upload do logo (se selecionado)
  const uploadPromise = selectedLogoFile ? uploadLogo(userId, selectedLogoFile) : Promise.resolve(null);

  uploadPromise
    .then(logoUrl => {
      if (logoUrl) {
        appearanceData.logoUrl = logoUrl;
      }
      // Atualiza os dados no Firestore
      return firebaseHelper.getUsersCollection().doc(userId).update(appearanceData);
    })
    .then(() => {
      uiModule.hideLoading();
      uiModule.showToast("success", "Aparência salva", "Suas configurações de aparência foram salvas.");
      selectedLogoFile = null; // Limpa o arquivo selecionado

      // Aplica as mudanças na UI imediatamente
      uiModule.applyCustomColors({ primaryColor, secondaryColor, textColor });
      if (appearanceData.logoUrl) {
        const headerLogo = document.getElementById("logo-img");
        if (headerLogo) headerLogo.src = appearanceData.logoUrl;
        if (logoPreview) logoPreview.src = appearanceData.logoUrl;
      }
      if (customUrl) {
        const customLinkDisplay = document.getElementById("custom-link");
        if (customLinkDisplay) customLinkDisplay.value = `https://imobconnect.com.br/corretor/${customUrl}`;
        uiModule.generateQRCode(customUrl);
      }
    })
    .catch(error => {
      uiModule.hideLoading();
      console.error("Erro ao salvar aparência:", error);
      uiModule.showToast("error", "Erro ao salvar", "Ocorreu um erro ao salvar a aparência.");
    });
}

/**
 * Manipula a restauração da aparência padrão
 */
function handleResetAppearance() {
  uiModule.showConfirmModal("Tem certeza que deseja restaurar a aparência padrão?", () => {
    // Restaura os valores padrão nos inputs
    if (primaryColorInput) primaryColorInput.value = "#4a6cf7";
    if (secondaryColorInput) secondaryColorInput.value = "#f97316";
    if (textColorInput) textColorInput.value = "#1e293b";
    if (primaryColorHex) primaryColorHex.value = "#4a6cf7";
    if (secondaryColorHex) secondaryColorHex.value = "#f97316";
    if (textColorHex) textColorHex.value = "#1e293b";
    if (customUrlInput) customUrlInput.value = "";
    if (logoPreview) logoPreview.src = "assets/images/default-logo.png";
    selectedLogoFile = null;

    // Salva os valores padrão
    handleSaveAppearance();
  });
}

/**
 * Manipula a mudança de tema nas configurações
 * @param {Event} e - Evento de change do switch
 */
function handleSettingsThemeChange(e) {
  const isChecked = e.target.checked;
  const newTheme = isChecked ? "dark" : "light";

  // Aplica o tema visualmente
  document.documentElement.setAttribute("data-theme", newTheme);

  // Atualiza o ícone do botão principal
  const mainThemeToggle = document.getElementById("theme-toggle");
  if (mainThemeToggle) {
    mainThemeToggle.innerHTML = newTheme === "dark" ?
      '<i class="fas fa-sun"></i>' :
      '<i class="fas fa-moon"></i>';
  }
}

/**
 * Manipula o salvamento das configurações gerais
 */
function handleSaveSettings() {
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) {
    uiModule.showToast("warning", "Acesso restrito", "Faça login para salvar as configurações.");
    return;
  }

  uiModule.showLoading();
  const userId = currentUser.uid;

  // Obtém os valores do formulário
  const theme = themeSwitch?.checked ? "dark" : "light";
  // const language = document.getElementById("language-select")?.value || "pt-BR";
  const emailNotifications = {
    newMessage: document.querySelector("input[name='email-notifications'][value='new-message']")?.checked,
    newProperty: document.querySelector("input[name='email-notifications'][value='new-property']")?.checked,
    propertyView: document.querySelector("input[name='email-notifications'][value='property-view']")?.checked,
    account: document.querySelector("input[name='email-notifications'][value='account']")?.checked,
  };
  // const pushNotifications = document.getElementById("push-switch")?.checked;
  // const profileVisibility = document.getElementById("profile-visibility")?.value || "public";
  // const dataSharing = {
  //   analytics: document.querySelector("input[name='data-sharing'][value='analytics']")?.checked,
  //   marketing: document.querySelector("input[name='data-sharing'][value='marketing']")?.checked,
  // };

  const settingsData = {
    "settings.theme": theme,
    // "settings.language": language,
    "settings.emailNotifications": emailNotifications,
    // "settings.pushNotifications": pushNotifications,
    // "settings.profileVisibility": profileVisibility,
    // "settings.dataSharing": dataSharing,
  };

  // Atualiza os dados no Firestore
  firebaseHelper.getUsersCollection().doc(userId).update(settingsData)
    .then(() => {
      uiModule.hideLoading();
      uiModule.showToast("success", "Configurações salvas", "Suas configurações foram salvas com sucesso.");
    })
    .catch(error => {
      uiModule.hideLoading();
      console.error("Erro ao salvar configurações:", error);
      uiModule.showToast("error", "Erro ao salvar", "Ocorreu um erro ao salvar as configurações.");
    });
}

/**
 * Manipula a restauração das configurações padrão
 */
function handleResetSettings() {
  uiModule.showConfirmModal("Tem certeza que deseja restaurar as configurações padrão?", () => {
    // Restaura os valores padrão nos inputs
    if (themeSwitch) themeSwitch.checked = false;
    document.querySelectorAll("input[name='email-notifications']").forEach(input => input.checked = true);

    // Salva os valores padrão
    handleSaveSettings();
  });
}

/**
 * Manipula a exclusão de todos os imóveis do usuário
 */
function handleDeleteAllProperties() {
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) return;

  uiModule.showConfirmModal("ATENÇÃO: Esta ação é irreversível! Tem certeza que deseja excluir TODOS os seus imóveis cadastrados?", () => {
    uiModule.showLoading();
    const userId = currentUser.uid;
    const propertiesRef = firebaseHelper.getPropertiesCollection();

    // Busca todos os imóveis do usuário
    propertiesRef.where("userId", "==", userId).get()
      .then(snapshot => {
        if (snapshot.empty) {
          uiModule.hideLoading();
          uiModule.showToast("info", "Nenhum imóvel", "Você não possui imóveis para excluir.");
          return Promise.resolve();
        }

        // Cria um batch para exclusão em massa
        const batch = firebaseHelper.db.batch();
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });

        // Executa o batch
        return batch.commit();
      })
      .then(() => {
        uiModule.hideLoading();
        uiModule.showToast("success", "Imóveis excluídos", "Todos os seus imóveis foram excluídos com sucesso.");
        // Recarrega a tabela de imóveis
        propertiesModule.loadUserProperties();
      })
      .catch(error => {
        uiModule.hideLoading();
        console.error("Erro ao excluir imóveis:", error);
        uiModule.showToast("error", "Erro ao excluir", "Ocorreu um erro ao excluir seus imóveis.");
      });
  });
}

/**
 * Manipula a exclusão da conta do usuário
 */
function handleDeleteAccount() {
  const currentUser = firebaseHelper.getCurrentUser();
  if (!currentUser) return;

  uiModule.showConfirmModal("ATENÇÃO: Esta ação é irreversível e excluirá sua conta e TODOS os seus dados! Tem certeza que deseja excluir sua conta?", () => {
    uiModule.showLoading();
    const userId = currentUser.uid;

    // 1. Excluir dados do Firestore (usuário, imóveis, etc.)
    const deleteFirestoreData = Promise.all([
      firebaseHelper.getUsersCollection().doc(userId).delete(),
      // Excluir imóveis (pode ser feito em batch como em handleDeleteAllProperties)
      firebaseHelper.getPropertiesCollection().where("userId", "==", userId).get().then(snapshot => {
        const batch = firebaseHelper.db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        return batch.commit();
      }),
      // Excluir imóveis pendentes (se aplicável)
      firebaseHelper.getPendingPropertiesCollection().where("brokerId", "==", userId).get().then(snapshot => {
        const batch = firebaseHelper.db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        return batch.commit();
      }),
      // Excluir outros dados relacionados (mensagens, notificações, etc.)
    ]);

    deleteFirestoreData
      .then(() => {
        // 2. Excluir dados do Storage (avatar, logo, imagens de imóveis)
        // Implementação pode ser complexa, requer listar e excluir arquivos/pastas
        // Exemplo simplificado:
        // const avatarRef = firebaseHelper.getProfileImagesStorage(userId).child("avatar.ext");
        // const logoRef = firebaseHelper.getLogoStorage(userId).child("logo.ext");
        // return Promise.all([avatarRef.delete(), logoRef.delete(), /* delete property images */]);
        return Promise.resolve(); // Simplificado por enquanto
      })
      .then(() => {
        // 3. Excluir usuário do Firebase Authentication
        return currentUser.delete();
      })
      .then(() => {
        uiModule.hideLoading();
        uiModule.showToast("success", "Conta excluída", "Sua conta foi excluída com sucesso.");
        // Redireciona para a página inicial (após logout implícito)
        uiModule.navigateTo("home-page");
      })
      .catch(error => {
        uiModule.hideLoading();
        console.error("Erro ao excluir conta:", error);
        // Se a exclusão falhar por exigir reautenticação recente
        if (error.code === "auth/requires-recent-login") {
          uiModule.showToast("error", "Reautenticação necessária", "Por segurança, faça login novamente antes de excluir sua conta.");
          // Redirecionar para login?
        } else {
          uiModule.showToast("error", "Erro ao excluir", "Ocorreu um erro ao excluir sua conta.");
        }
      });
  });
}

// Exportação das funções para uso em outros arquivos
window.dashboardModule = {
  initDashboard,
  populateDashboard,
};

