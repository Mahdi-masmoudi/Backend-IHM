const mongoose = require('mongoose');
const { env } = require('./src/config/env');
const User = require('./src/models/User');
const Candidat = require('./src/models/Candidat');
const Entreprise = require('./src/models/Entreprise');
const Offre = require('./src/models/Offre');
const Candidature = require('./src/models/Candidature');
const { seedSuperAdmin, seedDemoData } = require('./src/database/seed');

async function main() {
  console.log('[drop-and-seed] Connecting to MongoDB...');
  await mongoose.connect(env.mongoUri);
  console.log('[drop-and-seed] Connected.');

  console.log('[drop-and-seed] Dropping collections...');
  try { await User.collection.drop(); } catch(e){}
  try { await Candidat.collection.drop(); } catch(e){}
  try { await Entreprise.collection.drop(); } catch(e){}
  try { await Offre.collection.drop(); } catch(e){}
  try { await Candidature.collection.drop(); } catch(e){}
  console.log('[drop-and-seed] Collections dropped.');

  console.log('[drop-and-seed] Seeding SuperAdmin...');
  await seedSuperAdmin();

  console.log('[drop-and-seed] Seeding Demo Data...');
  await seedDemoData();

  console.log('[drop-and-seed] Finished.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('[drop-and-seed] Failed:', err);
  process.exit(1);
});
