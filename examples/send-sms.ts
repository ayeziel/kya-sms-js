/**
 * KYA SMS - Exemple d'envoi SMS
 * 
 * Exécuter avec: npx ts-node examples/send-sms.ts
 */

import { KyaSms, ApiError, ValidationError } from '../src';

const API_KEY = 'votre-cle-api';
const TEST_PHONE = '22990123456';

async function main() {
  const client = new KyaSms(API_KEY);

  console.log('=== KYA SMS - Exemples SMS ===\n');

  // 1. Envoi simple
  console.log('1. Envoi SMS simple');
  try {
    const result = await client.sms.sendSimple(
      'TestApp',
      TEST_PHONE,
      'Bonjour! Ceci est un test du SDK JavaScript.'
    );

    if (result.isSuccess()) {
      console.log('   ✅ SMS envoyé!');
      console.log(`   Message ID: ${result.getMessageId()}`);
      console.log(`   Statut: ${result.getStatus()}`);
      console.log(`   Route: ${result.getRoute()}`);
      console.log(`   Prix: ${result.getPrice()} XOF`);
      console.log(`   Parties SMS: ${result.getSmsPart()}`);
    }
  } catch (error) {
    handleError(error);
  }

  // 2. Envoi à plusieurs destinataires
  console.log('\n2. Envoi à plusieurs destinataires');
  try {
    const result = await client.sms.sendSimple(
      'TestApp',
      [TEST_PHONE, '22991234567'],
      'Message groupé!'
    );

    console.log(`   ✅ ${result.getMessageIds().length} messages envoyés`);
    console.log(`   IDs: ${result.getMessageIds().join(', ')}`);
    console.log(`   Coût total: ${result.getTotalPrice()} XOF`);
  } catch (error) {
    handleError(error);
  }

  // 3. Vérifier le statut
  console.log('\n3. Vérifier le statut');
  try {
    const result = await client.sms.sendSimple('TestApp', TEST_PHONE, 'Test statut');
    const messageId = result.getMessageId();

    if (messageId) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const status = await client.sms.getMessageStatus(messageId);
      console.log(`   Message ${messageId}: ${status?.status || 'N/A'}`);

      const isDelivered = await client.sms.isDelivered(messageId);
      console.log(`   Livré: ${isDelivered ? 'Oui' : 'Non'}`);
    }
  } catch (error) {
    handleError(error);
  }

  // 4. Historique SMS
  console.log('\n4. Historique SMS');
  try {
    const history = await client.sms.getHistory({ page: 1, perPage: 5 });

    console.log(`   ${history.messages.length} messages récents:`);
    for (const msg of history.messages) {
      console.log(`   - ${msg.to}: ${msg.status} (${msg.price} XOF)`);
    }
  } catch (error) {
    handleError(error);
  }

  console.log('\n=== Fin des exemples ===');
}

function handleError(error: unknown) {
  if (error instanceof ValidationError) {
    console.log(`   ❌ Validation: ${error.message}`);
  } else if (error instanceof ApiError) {
    console.log(`   ❌ API [${error.statusCode}]: ${error.message}`);
  } else if (error instanceof Error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
}

main().catch(console.error);
