const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Direktori penyimpanan file SQLite — dibuat otomatis jika belum ada
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(dataDir, 'satusehat.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PATH,
  logging: false, // matikan query log di console (ubah ke console.log untuk debug)
});

/**
 * Inisialisasi koneksi SQLite dan sinkronisasi tabel.
 * File database dibuat otomatis jika belum ada — tidak perlu setup apapun.
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    
    // Load models
    require('../models/EncounterRecord');
    require('../models/Practitioner');
    require('../models/Location');

    // sync({ alter: true }) — update tabel jika schema berubah, tidak hapus data
    await sequelize.sync({ alter: true });
    
    // Run seeders
    const seedPractitioners = require('../seeders/practitionerSeeder');
    await seedPractitioners();

    console.log(`[DB] SQLite siap: ${DB_PATH}`);
  } catch (err) {
    console.error('[DB] Gagal inisialisasi SQLite:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
