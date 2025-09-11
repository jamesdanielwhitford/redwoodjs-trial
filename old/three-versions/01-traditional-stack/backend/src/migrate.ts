import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Read and execute migration file
    const migrationPath = path.join(__dirname, '../../migrations/001_create_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    await pool.query(sql);
    
    console.log('✅ Migrations completed successfully!');
    console.log('📊 Database tables created:');
    console.log('   • users (id, email, password_hash, created_at)');
    console.log('   • notes (id, user_id, title, content, created_at)');
    console.log('\n💡 Next step: Run "npm run seed" to add test data');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Ensure PostgreSQL is running');
    console.error('   • Check DATABASE_URL in .env file');
    console.error('   • Verify database "simple_notes" exists');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();