/**
 * KYA SMS - Exemple OTP
 * 
 * Exécuter avec: npx ts-node examples/otp.ts
 */

import { KyaSms, ApiError, ValidationError } from '../src';

const API_KEY = 'votre-cle-api';
const APP_ID = 'MonAppId';  // Votre Application ID
const TEST_PHONE = '22990123456';

async function main() {
  const client = new KyaSms(API_KEY);

  console.log('=== KYA SMS - Exemples OTP ===\n');

  // 1. Envoyer un OTP simple
  console.log('1. Envoi OTP simple');
  try {
    const result = await client.otp.send(APP_ID, TEST_PHONE, 'fr');

    if (result.isSuccess()) {
      console.log('   ✅ OTP envoyé!');
      console.log(`   Key: ${result.getKey()}`);
      console.log(`   Recipient: ${result.getRecipient()}`);
    }
  } catch (error) {
    handleError(error);
  }

  // 2. OTP avec durée d'expiration
  console.log('\n2. OTP avec expiration');
  try {
    const result = await client.otp.sendWithExpiration(
      APP_ID,
      TEST_PHONE,
      10,   // 10 minutes
      'fr'
    );

    console.log('   ✅ OTP envoyé (expire dans 10 min)!');
    console.log(`   Key: ${result.getKey()}`);
  } catch (error) {
    handleError(error);
  }

  // 3. OTP avec code personnalisé
  console.log('\n3. OTP avec code personnalisé');
  try {
    const result = await client.otp.sendWithCustomCode(
      APP_ID,
      TEST_PHONE,
      '123456',  // Code personnalisé
      'fr',
      5          // 5 minutes
    );

    console.log('   ✅ OTP personnalisé envoyé!');
    console.log(`   Key: ${result.getKey()}`);
  } catch (error) {
    handleError(error);
  }

  // 4. Vérification OTP (simulation)
  console.log('\n4. Vérification OTP');
  try {
    // D'abord envoyer un OTP
    const sendResult = await client.otp.send(APP_ID, TEST_PHONE, 'fr');
    const key = sendResult.getKey();
    
    console.log(`   OTP envoyé, Key: ${key}`);
    
    // Simuler une vérification (le code sera incorrect)
    const fakeCode = '000000';
    console.log(`   Vérification du code: ${fakeCode}`);
    
    const verifyResult = await client.otp.verify(APP_ID, key, fakeCode);
    
    if (client.otp.isVerified(verifyResult)) {
      console.log('   ✅ Code valide!');
    } else {
      console.log('   ❌ Code invalide ou expiré');
      console.log(`   Message: ${verifyResult.msg}`);
    }
  } catch (error) {
    handleError(error);
  }

  // 5. Flux complet
  console.log('\n5. Flux complet d\'authentification');
  try {
    // Étape 1: Envoyer
    console.log('   Étape 1: Envoi OTP...');
    const result = await client.otp.create({
      appId: APP_ID,
      recipient: TEST_PHONE,
      lang: 'fr',
      minutes: 5,
    });
    const key = result.getKey();
    console.log(`   Key reçue: ${key}`);

    // Étape 2: Stocker la clé (en production: session, redis, db...)
    console.log('   Étape 2: Stockage de la clé...');

    // Étape 3: Vérification (simulée)
    console.log('   Étape 3: Vérification...');
    const userCode = '123456';  // Code entré par l'utilisateur
    const verify = await client.otp.verify(APP_ID, key, userCode);
    
    console.log(`   Résultat: ${verify.msg}`);
    console.log(`   Status: ${verify.status}`);
  } catch (error) {
    handleError(error);
  }

  console.log('\n=== Fin des exemples OTP ===');
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
