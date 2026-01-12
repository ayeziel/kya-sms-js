# KYA SMS JavaScript/TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@kyasms/sdk.svg)](https://www.npmjs.com/package/@kyasms/sdk)
[![License](https://img.shields.io/npm/l/@kyasms/sdk.svg)](https://github.com/ayeziel/kya-sms-js/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

SDK JavaScript/TypeScript officiel pour l'API KYA SMS. Envoyez des SMS, OTP et gérez vos campagnes facilement.

## 📋 Table des matières

- [Installation](#installation)
- [Quick Start](#quick-start)
- [SMS API](#sms-api)
- [OTP API](#otp-api)
- [Campaign API](#campaign-api)
- [Gestion des erreurs](#gestion-des-erreurs)
- [License](#license)

---

## Installation

```bash
# npm
npm install @kyasms/sdk

# yarn
yarn add @kyasms/sdk

# pnpm
pnpm add @kyasms/sdk
```

### Prérequis

- Node.js >= 16.0.0
- TypeScript >= 4.7 (optionnel)

---

## Quick Start

```typescript
import { KyaSms } from '@kyasms/sdk';

// Créer le client
const client = new KyaSms('votre-cle-api');

// Envoyer un SMS
const result = await client.sms.sendSimple('MonApp', '22990123456', 'Bonjour!');

console.log('Message ID:', result.getMessageId());
console.log('Statut:', result.getStatus());
```

### Configuration

```typescript
import { KyaSms } from '@kyasms/sdk';

// Méthode 1: Simple
const client = new KyaSms('votre-cle-api');

// Méthode 2: Avec URL personnalisée
const client = new KyaSms('votre-cle-api', 'https://route.kyasms.net/api/v3');

// Méthode 3: Configuration complète
const client = new KyaSms({
  apiKey: 'votre-cle-api',
  baseUrl: 'https://route.kyasms.com/api/v3',
  timeout: 30000,
  debug: true,
});

// Méthode 4: Variables d'environnement
// Définir: KYA_SMS_API_KEY=votre-cle-api
const client = KyaSms.fromEnvironment();
```

---

## SMS API

### Envoyer un SMS simple

```typescript
const result = await client.sms.sendSimple(
  'MonApp',           // Sender ID (max 11 caractères)
  '22990123456',      // Numéro
  'Votre message'     // Message
);

if (result.isSuccess()) {
  console.log('✅ SMS envoyé!');
  console.log('Message ID:', result.getMessageId());
  console.log('Route:', result.getRoute());
  console.log('Prix:', result.getPrice(), 'XOF');
  console.log('Parties SMS:', result.getSmsPart());
}
```

### Envoyer à plusieurs destinataires

```typescript
const result = await client.sms.sendSimple(
  'MonApp',
  ['22990123456', '22991234567', '22992345678'],
  'Message pour tout le monde!'
);

// Récupérer tous les IDs
const messageIds = result.getMessageIds();
console.log('IDs:', messageIds);

// Coût total
console.log('Coût total:', result.getTotalPrice(), 'XOF');
```

### Envoyer un SMS Flash

```typescript
const result = await client.sms.sendFlash(
  'Alerte',
  '22990123456',
  'URGENT: Votre code est 1234'
);
```

### Envoyer avec Template

```typescript
const result = await client.sms.sendWithTemplate(
  'MonApp',
  '22990123456',
  'template-api-key',
  'fr'  // Langue
);
```

### Envoi Bulk (vers des groupes)

```typescript
// Message simple vers des groupes
const result = await client.sms.sendBulk(
  'MonApp',
  ['groupe-id-1', 'groupe-id-2'],
  'Bonjour {phone_name}! Voici nos offres.'
);

// Bulk avec template
const result = await client.sms.sendBulkWithTemplate(
  'MonApp',
  ['groupe-id-1'],
  'promo-template',
  'fr'
);
```

### Envoi avec options avancées

```typescript
const result = await client.sms.send({
  from: 'MonApp',
  to: '22990123456',
  message: 'Votre code: 123456',
  type: 'text',           // 'text' ou 'flash'
  isBulk: false,
  isTemplate: false,
  wallet: 'principal',
  refCustom: 'order-123',
});
```

### Historique SMS

```typescript
// Récupérer l'historique
const history = await client.sms.getHistory({
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  page: 1,
  perPage: 50,
});

console.log(`${history.messages.length} messages trouvés`);

for (const msg of history.messages) {
  console.log(`${msg.to}: ${msg.status} - ${msg.price} XOF`);
}
```

### Statut des messages

```typescript
// Plusieurs messages
const statuses = await client.sms.getStatus([
  'message-id-1',
  'message-id-2',
]);

// Un seul message
const status = await client.sms.getMessageStatus('message-id');
console.log('Statut:', status?.status);

// Vérifier si livré
const isDelivered = await client.sms.isDelivered('message-id');
```

### Méthodes SmsResult

```typescript
const result = await client.sms.sendSimple('MonApp', '22990123456', 'Test');

// Vérifications
result.isSuccess();          // true/false
result.getMessageId();       // Premier ID
result.getMessageIds();      // Tous les IDs (envoi multiple)

// Informations premier message
result.getStatus();          // 'PENDING', 'DELIVERED', etc.
result.getRoute();           // Route utilisée
result.getPrice();           // Prix en XOF
result.getSmsPart();         // Nombre de segments SMS
result.getTo();              // Numéro destinataire
result.getMessage();         // Contenu du message
result.getCreatedAt();       // Date de création

// Envoi multiple
result.getTotalPrice();      // Prix total de tous les messages
result.getData();            // Tableau de tous les messages
result.getFirstMessage();    // Premier message complet

// Debug
result.getRawResponse();     // Réponse API brute
```

---

## OTP API

### Envoyer un OTP

```typescript
// OTP simple
const result = await client.otp.send(
  'MonAppId',       // Application ID
  '22990123456',    // Numéro de téléphone
  'fr'              // Langue (fr, en, es, de)
);

if (result.isSuccess()) {
  console.log('OTP Key:', result.getKey());  // Nécessaire pour vérification
  console.log('Recipient:', result.getRecipient());
}
```

### OTP avec options personnalisées

```typescript
// Avec code personnalisé
const result = await client.otp.sendWithCustomCode(
  'MonAppId',
  '22990123456',
  '123456',         // Code personnalisé
  'fr',             // Langue
  10                // Validité en minutes
);

// Avec durée d'expiration
const result = await client.otp.sendWithExpiration(
  'MonAppId',
  '22990123456',
  15,               // Validité en minutes
  'fr'              // Langue
);

// Avec toutes les options
const result = await client.otp.create({
  appId: 'MonAppId',
  recipient: '22990123456',
  lang: 'fr',
  code: '123456',    // Optionnel
  minutes: 10,       // Optionnel
});
```

### Vérifier un OTP

```typescript
const appId = 'MonAppId';
const key = result.getKey();  // Clé reçue lors de l'envoi
const codeUtilisateur = '123456';

const verifyResult = await client.otp.verify(appId, key, codeUtilisateur);

if (client.otp.isVerified(verifyResult)) {
  console.log('✅ Code valide!');
} else {
  console.log('❌ Code invalide ou expiré');
  console.log('Message:', verifyResult.msg);
}
```

### Flux complet d'authentification

```typescript
// 1. Envoyer l'OTP
const sendResult = await client.otp.send('MonAppId', '22990123456', 'fr');
const key = sendResult.getKey();

// 2. Stocker key (session, database, etc.)
// ...

// 3. Quand l'utilisateur entre le code
const userCode = '123456';
const verifyResult = await client.otp.verify('MonAppId', key, userCode);

if (client.otp.isVerified(verifyResult)) {
  // Authentification réussie
} else {
  // Code incorrect
}
```

### Méthodes OtpResult

```typescript
const result = await client.otp.send('MonAppId', '22990123456', 'fr');

result.isSuccess();          // true/false
result.getKey();             // Clé pour vérification
result.getRecipient();       // Numéro/email destinataire
result.getStatus();          // Statut
result.getMessageId();       // ID du message SMS envoyé
result.getRawResponse();     // Réponse API brute
```

---

## Campaign API

### Créer une campagne automatique

```typescript
const result = await client.campaign.createAutomatic(
  'Promo Flash',           // Nom
  ['groupe-clients'],      // Groupes
  'MonApp',                // Sender ID
  'Profitez de -50%!'      // Message
);

console.log('Campaign ID:', result.getCampaignId());
```

### Créer une campagne programmée

```typescript
const result = await client.campaign.createScheduled(
  'Promo Nouvel An',
  ['groupe-clients'],
  'MonApp',
  'Bonne année 2026!',
  '2026-01-01 00:00:00',   // Date d'exécution (Y-m-d H:i:s)
  'Africa/Porto-Novo'      // Timezone
);
```

### Créer une campagne périodique

```typescript
const result = await client.campaign.createPeriodic(
  'Newsletter Hebdo',
  ['newsletter'],
  'MonApp',
  'Voici les nouveautés!',
  'weekly_start',          // Type de période
  'Africa/Porto-Novo'
);

// Types de périodes disponibles:
// 'weekly_start' | 'weekly_end' | 'monthly_start' | 'monthly_end' 
// | 'specific_day_of_month' | 'beginning_of_year' | 'christmas'
```

### Créer avec template

```typescript
const result = await client.campaign.createWithTemplate(
  'Anniversaires',
  ['anniversaires-janvier'],
  'MonApp',
  'birthday-template',
  'fr'
);
```

### Créer avec toutes les options

```typescript
const result = await client.campaign.create({
  name: 'Ma Campagne',
  groups: ['groupe-1', 'groupe-2'],
  senderId: 'MonApp',
  type: 'auto',              // 'auto' | 'customize' | 'periodic'
  smsType: 'text',           // 'text' | 'flash' | 'unicode'
  message: 'Mon message',    // Ou utiliser templateId
  // templateId: 'template-id',
  // templateLang: 'fr',
  timezone: 'Africa/Porto-Novo',
  // scheduleDate: '2026-01-01 00:00:00',  // Pour 'customize'
  // campaignPeriodic: 'weekly_start',      // Pour 'periodic'
});
```

### Suivi de campagne

```typescript
const campaignId = 123;

// Statut complet
const status = await client.campaign.getStatus(campaignId);
console.log('Statut:', status.data.status);
console.log('Progress:', status.data.progress);

// Progression en pourcentage
const progress = await client.campaign.getProgress(campaignId);
console.log(`Progression: ${progress}%`);

// Vérifier si terminée
const completed = await client.campaign.isCompleted(campaignId);
```

### Historique des campagnes

```typescript
const records = await client.campaign.getRecords(1, 20);

for (const campaign of records.campaigns) {
  console.log(`${campaign.name}: ${campaign.status}`);
  console.log(`  Envoyés: ${campaign.stats.total_sent}`);
  console.log(`  Délivrés: ${campaign.stats.delivered}`);
}

// Avec filtres
const filtered = await client.campaign.getRecordsFiltered({
  page: 1,
  perPage: 20,           // Max 50
  status: 'executed',    // pending, active, executed, paused
  type: 'auto',          // auto, customize, periodic
  startDate: '2026-01-01',
  endDate: '2026-01-31',
});
```

### Calculer le coût

```typescript
const cost = await client.campaign.calculateCost(
  ['groupe-1', 'groupe-2'],
  'Bonjour {phone_name}! Votre code: {phone_custom1}'
);

console.log(`Coût estimé: ${cost.estimated_cost} XOF`);
console.log(`Destinataires: ${cost.total_recipients}`);
console.log(`Segments SMS: ${cost.total_sms_parts}`);

// Breakdown par pays/opérateur
for (const breakdown of cost.country_breakdown) {
  console.log(`${breakdown.country}(${breakdown.operator}): ${breakdown.cost} XOF`);
}
```

### Méthodes CampaignResult

```typescript
const result = await client.campaign.createAutomatic(...);

result.isSuccess();          // true/false
result.getCampaignId();      // ID de la campagne créée
result.getStatus();          // Statut ('pending', 'active', etc.)
result.getScheduledAt();     // Date programmée (si applicable)
result.getRawResponse();     // Réponse API brute
```

### Filtres historique SMS complets

```typescript
const history = await client.sms.getHistory({
  page: 1,
  perPage: 50,           // Max 100
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  status: 'DELIVERED',   // PENDING, DELIVERED, FAILED, ERROR
  sender: 'MonApp',      // Filtrer par sender ID
  contact: '22990',      // Filtrer par numéro (préfixe)
});
```

---

## Gestion des erreurs

```typescript
import { 
  KyaSms,
  KyaSmsError,
  AuthenticationError,
  ValidationError,
  ApiError,
  NetworkError,
} from '@kyasms/sdk';

const client = new KyaSms('votre-cle-api');

try {
  const result = await client.sms.sendSimple('MonApp', '22990123456', 'Test');
  
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('❌ Clé API invalide');
    
  } else if (error instanceof ValidationError) {
    console.error('❌ Erreur de validation:', error.message);
    console.error('Erreurs:', error.getErrors());
    
  } else if (error instanceof ApiError) {
    console.error(`❌ Erreur API [${error.statusCode}]:`, error.message);
    
    if (error.isInsufficientBalance()) {
      console.error('→ Rechargez votre compte');
    } else if (error.isRateLimitError()) {
      console.error('→ Trop de requêtes');
    }
    
  } else if (error instanceof NetworkError) {
    console.error('❌ Erreur réseau:', error.message);
  }
}
```

### Failover entre serveurs

```typescript
const servers = [
  'https://route.kyasms.com/api/v3',
  'https://route.kyasms.net/api/v3',
];

async function sendWithFailover(from: string, to: string, message: string) {
  for (const server of servers) {
    try {
      const client = new KyaSms('api-key', server);
      return await client.sms.sendSimple(from, to, message);
    } catch (error) {
      if (error instanceof ApiError && error.isServerError()) {
        console.log(`Serveur ${server} indisponible...`);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Tous les serveurs sont indisponibles');
}
```

---

## Variables dynamiques

| Variable | Description |
|----------|-------------|
| `{phone_name}` | Nom du contact |
| `{phone_email}` | Email du contact |
| `{phone_custom1}` | Champ personnalisé 1 |
| `{phone_custom2}` | Champ personnalisé 2 |

---

## License

MIT License - voir [LICENSE](LICENSE)

## Support

- Documentation: https://docs.kyasms.com
- Email: support@kyasms.com
- Issues: https://github.com/ayeziel/kya-sms-js/issues
