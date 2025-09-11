import fs from 'fs';
import path from 'path';
import { query } from '../models/database';

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Create migrations tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Get list of executed migrations
    const executedMigrations = await query('SELECT filename FROM migrations ORDER BY id');
    const executedFilenames = executedMigrations.rows.map((row: any) => row.filename);
    
    // Read migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📂 Found ${migrationFiles.length} migration files`);
    
    // Execute pending migrations
    for (const filename of migrationFiles) {
      if (executedFilenames.includes(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }
      
      console.log(`🔄 Executing migration: ${filename}`);
      
      const filePath = path.join(migrationsDir, filename);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      // Execute migration
      await query(sql);
      
      // Record migration
      await query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      );
      
      console.log(`✅ Completed migration: ${filename}`);
    }
    
    console.log('🎉 All migrations completed successfully!');
    console.log('\n📊 Database is ready for use');
    console.log('💡 Next steps:');
    console.log('   • Run "npm run seed" to add sample data');
    console.log('   • Start the server with "npm run dev"');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Ensure PostgreSQL is running');
    console.error('   • Check your DATABASE_URL in .env file');
    console.error('   • Verify database permissions');
    process.exit(1);
  }
}

// Run migrations
runMigrations();