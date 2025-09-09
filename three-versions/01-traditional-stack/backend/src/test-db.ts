import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  console.log('🔄 Testing database connection...\n');
  
  try {
    // Test basic connection
    console.log('1️⃣ Testing connection to PostgreSQL...');
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Connection successful!');
    console.log(`   • Time: ${result.rows[0].current_time}`);
    console.log(`   • PostgreSQL: ${result.rows[0].postgres_version.split(' ')[1]}`);
    
    // Check database info
    console.log('\n2️⃣ Checking database info...');
    const dbInfo = await pool.query('SELECT current_database() as db_name');
    console.log('✅ Database info:');
    console.log(`   • Database: ${dbInfo.rows[0].db_name}`);
    
    // Check for tables
    console.log('\n3️⃣ Checking for tables...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ Found tables:');
      tables.rows.forEach((table: any) => {
        console.log(`   • ${table.table_name}`);
      });
      
      // Check for data
      console.log('\n4️⃣ Checking for data...');
      const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
      const noteCount = await pool.query('SELECT COUNT(*) as count FROM notes');
      
      console.log('✅ Data summary:');
      console.log(`   • Users: ${userCount.rows[0].count}`);
      console.log(`   • Notes: ${noteCount.rows[0].count}`);
      
      if (parseInt(userCount.rows[0].count) === 0) {
        console.log('\nℹ️  No test data found. Run: npm run seed');
      }
    } else {
      console.log('⚠️  No tables found. Run: npm run migrate');
    }
    
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Database connection failed!');
    console.error(`Error: ${error.message}`);
    
    console.error('\n🔧 Common fixes:');
    console.error('1. Is PostgreSQL running?');
    console.error('   macOS: brew services start postgresql');
    console.error('   Linux: sudo systemctl start postgresql');
    console.error('   Windows: Check Services panel');
    
    console.error('\n2. Does the database exist?');
    console.error('   createdb simple_notes');
    
    console.error('\n3. Is the connection string correct in .env?');
    console.error(`   Current: ${process.env.DATABASE_URL ? 'Set' : 'Missing'}`);
    
    console.error('\n4. Try manual connection:');
    console.error('   psql "postgresql://username@localhost:5432/simple_notes"');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();