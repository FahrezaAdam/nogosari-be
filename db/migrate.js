const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function migrate() {
  console.log('🚀 Starting Database Migration...');
  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await db.query(sql);
    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
