import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(DB_PATH);

console.log('🔍 Checking products table schema...\n');

db.all("PRAGMA table_info(products);", (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }

  console.log('📋 Current columns in products table:');
  rows.forEach(col => {
    console.log(`  ${col.cid}. ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
  });

  const hasTP = rows.find(col => col.name === 'tiered_pricing');
  const hasDB = rows.find(col => col.name === 'discount_badges');

  console.log('\n✅ Schema check:');
  console.log(`  tiered_pricing: ${hasTP ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`  discount_badges: ${hasDB ? '✅ EXISTS' : '❌ MISSING'}`);

  if (!hasTP || !hasDB) {
    console.log('\n⚠️  Missing columns detected! Running ALTER TABLE...\n');

    if (!hasTP) {
      db.run('ALTER TABLE products ADD COLUMN tiered_pricing TEXT', (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('❌ Failed to add tiered_pricing:', err.message);
        } else {
          console.log('✅ tiered_pricing column added');
        }
      });
    }

    if (!hasDB) {
      db.run('ALTER TABLE products ADD COLUMN discount_badges INTEGER DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('❌ Failed to add discount_badges:', err.message);
        } else {
          console.log('✅ discount_badges column added');
        }
      });
    }

    setTimeout(() => {
      db.close();
      console.log('\n✅ Schema check and fix completed');
      process.exit(0);
    }, 1000);
  } else {
    db.close();
    console.log('\n✅ All required columns exist!');
    process.exit(0);
  }
});
