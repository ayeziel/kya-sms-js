/**
 * KYA SMS - Exemple Campagnes
 * 
 * Exécuter avec: npx ts-node examples/campaign.ts
 */

import { KyaSms, ApiError, ValidationError } from '../src';

const API_KEY = 'votre-cle-api';
const TEST_GROUP = 'E6A510FB';  // Remplacer par un vrai ID de groupe

async function main() {
  const client = new KyaSms(API_KEY);

  console.log('=== KYA SMS - Exemples Campagnes ===\n');

  // 1. Calculer le coût d'une campagne
  console.log('1. Calculer le coût');
  try {
    const cost = await client.campaign.calculateCost(
      [TEST_GROUP],
      'Bonjour {phone_name}! Profitez de nos offres exclusives.'
    );

    console.log(`   Coût estimé: ${cost.estimated_cost} XOF`);
    console.log(`   Destinataires: ${cost.total_recipients}`);
    console.log(`   Valides: ${cost.valid_recipients}`);
    console.log(`   Segments SMS: ${cost.total_sms_parts}`);
    console.log(`   Encodage: ${cost.message_info.encoding}`);
    
    console.log('   Breakdown par pays:');
    for (const b of cost.country_breakdown) {
      console.log(`   - ${b.country}(${b.operator}): ${b.contacts} contacts, ${b.cost} XOF`);
    }
  } catch (error) {
    handleError(error);
  }

  // 2. Créer une campagne automatique
  console.log('\n2. Campagne automatique');
  try {
    const result = await client.campaign.createAutomatic(
      'Test SDK JS',
      [TEST_GROUP],
      'KYA SMS',
      'Test depuis le SDK JavaScript!'
    );

    if (result.isSuccess()) {
      console.log('   ✅ Campagne créée!');
      console.log(`   ID: ${result.getCampaignId()}`);
      console.log(`   Statut: ${result.getStatus()}`);
    }
  } catch (error) {
    handleError(error);
  }

  // 3. Créer une campagne programmée
  console.log('\n3. Campagne programmée');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    // Format: Y-m-d H:i:s
    const scheduleDate = tomorrow.toISOString().slice(0, 10) + ' 09:00:00';

    const result = await client.campaign.createScheduled(
      'Promo Demain',
      [TEST_GROUP],
      'KYA SMS',
      'Ne manquez pas notre promo de demain!',
      scheduleDate,
      'Africa/Porto-Novo'
    );

    console.log(`   ✅ Campagne programmée pour: ${result.getScheduledAt()}`);
    console.log(`   ID: ${result.getCampaignId()}`);
  } catch (error) {
    handleError(error);
  }

  // 4. Créer une campagne périodique
  console.log('\n4. Campagne périodique');
  try {
    const result = await client.campaign.createPeriodic(
      'Newsletter Hebdo',
      [TEST_GROUP],
      'KYA SMS',
      'Voici les nouveautés de la semaine!',
      'weekly_start',
      'Africa/Porto-Novo'
    );

    console.log('   ✅ Campagne périodique créée!');
    console.log(`   ID: ${result.getCampaignId()}`);
  } catch (error) {
    handleError(error);
  }

  // 5. Créer avec toutes les options
  console.log('\n5. Campagne avec options complètes');
  try {
    const result = await client.campaign.create({
      name: 'Campagne Complète',
      groups: [TEST_GROUP],
      senderId: 'KYA SMS',
      type: 'auto',
      smsType: 'text',
      message: 'Message personnalisé pour {phone_name}',
      timezone: 'Africa/Porto-Novo',
    });

    console.log('   ✅ Campagne créée!');
    console.log(`   ID: ${result.getCampaignId()}`);
  } catch (error) {
    handleError(error);
  }

  // 6. Liste des campagnes
  console.log('\n6. Historique des campagnes');
  try {
    const records = await client.campaign.getRecords(1, 5);

    console.log(`   ${records.campaigns.length} campagnes récentes:`);
    for (const camp of records.campaigns) {
      console.log(`\n   📧 ${camp.name}`);
      console.log(`      ID: ${camp.id}`);
      console.log(`      Type: ${camp.type}`);
      console.log(`      Statut: ${camp.status}`);
      if (camp.stats) {
        console.log(`      Envoyés: ${camp.stats.total_sent}`);
        console.log(`      Délivrés: ${camp.stats.delivered}`);
        console.log(`      Taux: ${camp.stats.delivery_rate}%`);
      }
    }

    console.log(`\n   Page ${records.pagination.current_page}/${records.pagination.total_pages}`);
  } catch (error) {
    handleError(error);
  }

  // 7. Statut d'une campagne
  console.log('\n7. Statut d\'une campagne');
  try {
    const records = await client.campaign.getRecords(1, 1);
    if (records.campaigns.length > 0) {
      const campaignId = records.campaigns[0].id;
      
      const status = await client.campaign.getStatus(campaignId);
      console.log(`   Campagne #${campaignId}:`);
      console.log(`   Nom: ${status.data.name}`);
      console.log(`   Statut: ${status.data.status}`);
      
      const progress = await client.campaign.getProgress(campaignId);
      console.log(`   Progression: ${progress}%`);
      
      const completed = await client.campaign.isCompleted(campaignId);
      console.log(`   Terminée: ${completed ? 'Oui' : 'Non'}`);
    }
  } catch (error) {
    handleError(error);
  }

  console.log('\n=== Fin des exemples Campagnes ===');
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
