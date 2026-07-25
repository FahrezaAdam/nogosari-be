require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runInit() {
  try {
    console.log('Reading init.sql...');
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    
    console.log('Executing SQL script...');
    await db.query(sql);
    
    console.log('Database initialization successful!');
  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    process.exit(0);
  }
}

runInit();
