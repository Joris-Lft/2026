/**
 * Script utilitaire pour créer un utilisateur dans Airtable avec un mot de passe hashé
 * 
 * Usage:
 *   npx ts-node scripts/create-user.ts email@example.com motdepasse123
 * 
 * Ou depuis Node.js:
 *   import { createUser } from '../services/airtable';
 *   await createUser('email@example.com', 'motdepasse123');
 */

import { createUser } from '../services/airtable';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: npx ts-node scripts/create-user.ts <email> <password>');
    process.exit(1);
  }

  const [email, password] = args;

  console.log(`Création de l'utilisateur ${email}...`);
  
  const result = await createUser(email, password);
  
  if (result.user) {
    console.log('✅ Utilisateur créé avec succès!');
    console.log(`ID: ${result.user.id}`);
    console.log(`Email: ${result.user.email}`);
  } else {
    console.error('❌ Erreur lors de la création de l\'utilisateur');
    console.error(`Erreur: ${result.error || 'Erreur inconnue'}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Erreur:', error);
  process.exit(1);
});

