import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from './connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Migration files in order
const migrations = [
  '001_users.sql',
  '002_tasks.sql'
];

async function runMigration(filename) {
  try {
    const filePath = join(__dirname, 'migrations', filename);
    const sql = await readFile(filePath, 'utf8');
    
    console.log(`Running migration: ${filename}`);
    await query(sql);
    console.log(`✅ Migration completed: ${filename}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`, error.message);
    throw error;
  }
}

async function migrate() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Test database connection first
    await testConnection();
    
    // Run migrations sequentially
    for (const migration of migrations) {
      await runMigration(migration);
    }
    
    console.log('🎉 All migrations completed successfully!');
    console.log(`✅ Database is ready with ${migrations.length} migrations applied`);
    
  } catch (error) {
    console.error('💥 Migration process failed:', error.message);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { migrate };