# ImobConnect - Sistema para Corretores de Imóveis

ImobConnect é um sistema completo para corretores de imóveis, desenvolvido com HTML, CSS e JavaScript puro, utilizando Firebase como backend. O sistema permite que cada corretor tenha seu próprio painel personalizado, com identidade visual própria e funcionalidades completas de gerenciamento de imóveis.

## Funcionalidades Principais

### Autenticação e Personalização
- Cadastro e login de usuários (corretores e proprietários)
- Personalização de logotipo, cores e tema
- URL personalizada para cada corretor

### Cadastro de Imóveis
- Formulário completo com múltiplos campos
- Upload de múltiplas imagens
- Categorização e filtros avançados

### Listagem e Visualização
- Listagem de imóveis com filtros
- Página de detalhes com galeria de imagens
- Contato direto via WhatsApp

### Painel Administrativo
- Dashboard com estatísticas
- Gerenciamento de imóveis
- Configurações de perfil e aparência

### Envio de Imóveis por Proprietários
- Formulário público para envio de imóveis
- Sistema de aprovação pelo corretor
- Notificações de novos imóveis

### Tema e Visual
- Tema claro/escuro
- Animações e transições
- Interface responsiva para mobile

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (Flexbox/Grid), JavaScript puro
- **Backend/Infra**: Firebase Authentication, Firestore Database, Firebase Storage, Firebase Hosting

## Configuração do Firebase

Para utilizar o sistema, você precisa configurar seu próprio projeto no Firebase:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Adicione um aplicativo web ao seu projeto
4. Copie as credenciais de configuração
5. Substitua as credenciais no arquivo `assets/js/config.js`

```javascript
// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID"
};
```

6. Ative os serviços necessários no console do Firebase:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage

## Estrutura de Arquivos

```
imobiliaria/
├── index.html
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   └── themes.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── config.js
│   │   ├── dashboard.js
│   │   ├── properties.js
│   │   └── ui.js
│   └── images/
│       ├── default-avatar.png
│       ├── default-logo.png
│       ├── property-placeholder.jpg
│       └── ...
└── README.md
```

## Deploy no Netlify

Para fazer o deploy do sistema no Netlify:

1. Crie uma conta no [Netlify](https://www.netlify.com/)
2. Clique em "New site from Git"
3. Conecte sua conta do GitHub, GitLab ou Bitbucket
4. Selecione o repositório do projeto
5. Configure as opções de build (não é necessário comando de build para este projeto)
6. Clique em "Deploy site"

## Regras de Segurança do Firebase

Para garantir a segurança dos dados, configure as regras de segurança do Firestore e Storage:

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Imóveis podem ser lidos por todos, mas escritos apenas pelo proprietário
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Imóveis pendentes podem ser lidos/escritos pelo corretor designado
    match /pendingProperties/{propertyId} {
      allow read: if request.auth != null && (resource.data.brokerId == request.auth.uid || resource.data.brokerId == null);
      allow write: if request.auth != null && (resource.data.brokerId == request.auth.uid || resource.data.brokerId == null);
      allow create: if true;
    }
    
    // Mensagens podem ser lidas/escritas pelos participantes
    match /messages/{messageId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.senderId || request.auth.uid == resource.data.receiverId);
      allow write: if request.auth != null && (request.auth.uid == resource.data.senderId || request.auth.uid == resource.data.receiverId);
    }
  }
}
```

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Usuários podem ler/escrever apenas em suas próprias pastas
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Imóveis pendentes podem ser lidos por todos e escritos por qualquer usuário autenticado
    match /pending/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Personalização

### Cores

Você pode personalizar as cores do sistema editando as variáveis CSS no arquivo `assets/css/themes.css`:

```css
:root {
  --primary-color: #4a6cf7;
  --secondary-color: #f97316;
  /* ... outras variáveis ... */
}
```

### Logo

Para alterar o logo padrão, substitua o arquivo `assets/images/default-logo.png` pelo seu próprio logo.

## Suporte e Contato

Para suporte ou dúvidas sobre o sistema, entre em contato através do email: suporte@imobconnect.com.br

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
