import { query } from '../models/database';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔄 Testing database connection...\n');
  
  try {
    // Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const result = await query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Connection successful!');
    console.log(`   • Current time: ${result.rows[0].current_time}`);
    console.log(`   • PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[1]}`);
    
    // Test database name
    console.log('\n2️⃣ Checking database info...');
    const dbInfo = await query('SELECT current_database() as db_name, current_user as db_user');
    console.log('✅ Database info retrieved!');
    console.log(`   • Database name: ${dbInfo.rows[0].db_name}`);
    console.log(`   • Connected user: ${dbInfo.rows[0].db_user}`);
    
    // Test if tables exist
    console.log('\n3️⃣ Checking for existing tables...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ Found existing tables:');
      tables.rows.forEach((table: any) => {
        console.log(`   • ${table.table_name}`);
      });
    } else {
      console.log('ℹ️  No tables found - you may need to run migrations');
      console.log('   Run: npm run migrate');
    }
    
    console.log('\n🎉 Database connection test completed successfully!');
    console.log('💡 Your database is ready to use');
    
  } catch (error: any) {
    console.error('❌ Database connection failed!');
    console.error(`   Error: ${error.message}`);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('   1. Check if PostgreSQL is running:');
    console.error('      • macOS: brew services list | grep postgresql');
    console.error('      • Linux: sudo systemctl status postgresql');
    console.error('      • Windows: Check Services in Task Manager');
    console.error('\n   2. Verify your DATABASE_URL in .env file');
    console.error(`      Current: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
    console.error('\n   3. Test manual connection:');
    console.error(`      psql "${process.env.DATABASE_URL}"`);
    console.error('\n   4. Check if database exists:');
    console.error('      createdb job_tracker (if using local PostgreSQL)');
    
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the test
testConnection();