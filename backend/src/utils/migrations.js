import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from '../models/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// Create migrations table if it doesn't exist
const createMigrationsTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await db.run(createTableSQL);
    console.log('✅ Migrations table ready');
  } catch (error) {
    console.error('❌ Error creating migrations table:', error);
    throw error;
  }
};

// Get list of executed migrations
const getExecutedMigrations = async () => {
  try {
    const rows = await db.all('SELECT filename FROM migrations ORDER BY executed_at');
    return rows.map(row => row.filename);
  } catch (error) {
    console.error('❌ Error fetching executed migrations:', error);
    return [];
  }
};

// Mark migration as executed
const markMigrationExecuted = async (filename) => {
  try {
    await db.run('INSERT INTO migrations (filename) VALUES (?)', [filename]);
    console.log(`✅ Migration marked as executed: ${filename}`);
  } catch (error) {
    console.error(`❌ Error marking migration as executed: ${filename}`, error);
    throw error;
  }
};

// Execute a single migration file
const executeMigration = async (filename) => {
  const migrationPath = path.join(MIGRATIONS_DIR, filename);

  try {
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL statements by semicolon and execute each one
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        await db.run(statement);
      }
    }

    await markMigrationExecuted(filename);
    console.log(`✅ Migration executed successfully: ${filename}`);

  } catch (error) {
    console.error(`❌ Error executing migration ${filename}:`, error);
    throw error;
  }
};

// Run all pending migrations
export const runMigrations = async () => {
  try {
    console.log('🔄 Checking for database migrations...');

    // Ensure migrations table exists
    await createMigrationsTable();

    // Check if migrations directory exists
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('📁 Migrations directory not found, creating it...');
      fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }

    // Get all migration files
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in alphabetical order

    if (migrationFiles.length === 0) {
      console.log('📂 No migration files found');
      return;
    }

    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations();

    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(file =>
      !executedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ All migrations are up to date');
      return;
    }

    console.log(`🚀 Found ${pendingMigrations.length} pending migration(s):`);
    pendingMigrations.forEach(file => console.log(`   - ${file}`));

    // Execute pending migrations
    for (const migrationFile of pendingMigrations) {
      await executeMigration(migrationFile);
    }

    console.log('✅ All migrations completed successfully');

  } catch (error) {
    console.error('❌ Migration process failed:', error);
    throw error;
  }
};

export default { runMigrations };