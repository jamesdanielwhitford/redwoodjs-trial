import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with test data...');
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', ['test@example.com']);
    
    if (existingUser.rows.length > 0) {
      console.log('ℹ️  Test user already exists. Skipping seed.');
      console.log('🔐 Login with: test@example.com / password123');
      return;
    }
    
    // Create test user
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      ['test@example.com', hashedPassword]
    );
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Created user: ${userResult.rows[0].email}`);
    
    // Create sample notes
    console.log('📝 Creating sample notes...');
    const sampleNotes = [
      {
        title: 'Welcome to Simple Notes!',
        content: 'This is your first note. You can create, view, and delete notes using this simple app.'
      },
      {
        title: 'Traditional Stack Complexity',
        content: 'Notice how much setup was required:\n• PostgreSQL installation\n• Environment configuration\n• Database migrations\n• Multiple terminal windows\n\nThis demonstrates why modern solutions like RedwoodSDK are valuable!'
      },
      {
        title: 'Shopping List',
        content: '• Milk\n• Bread\n• Eggs\n• Coffee\n• Apples'
      }
    ];
    
    for (const note of sampleNotes) {
      await pool.query(
        'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3)',
        [userId, note.title, note.content]
      );
      console.log(`✅ Created note: "${note.title}"`);
    }
    
    console.log('\n🎉 Database seeding completed!');
    console.log('📊 Summary:');
    console.log('   • 1 test user created');
    console.log('   • 3 sample notes created');
    console.log('\n🔐 Test Login Credentials:');
    console.log('   • Email: test@example.com');
    console.log('   • Password: password123');
    console.log('\n💡 Next steps:');
    console.log('   • Start backend: npm run dev');
    console.log('   • Start frontend: cd ../frontend && npm run dev');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Run migrations first: npm run migrate');
    console.error('   • Check database connection: npm run test-db');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();