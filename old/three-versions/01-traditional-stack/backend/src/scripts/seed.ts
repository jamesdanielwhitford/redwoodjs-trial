import bcrypt from 'bcryptjs';
import { query } from '../models/database';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if data already exists
    const existingUsers = await query('SELECT COUNT(*) as count FROM users');
    if (parseInt(existingUsers.rows[0].count) > 0) {
      console.log('ℹ️  Database already has data. Skipping seed.');
      console.log('💡 To re-seed, clear the database first or delete existing data');
      process.exit(0);
    }
    
    // Create test user
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      ['test@example.com', hashedPassword]
    );
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Created user: ${userResult.rows[0].email} (ID: ${userId})`);
    
    // Sample jobs data
    const sampleJobs = [
      {
        title: 'Senior React Developer',
        company: 'TechCorp Inc.',
        status: 'Applied',
        description: 'Looking for an experienced React developer to join our frontend team.',
        salary_min: 90000,
        salary_max: 120000,
        application_url: 'https://techcorp.com/jobs/react-dev',
        date_applied: '2024-01-15',
        notes: 'Applied through company website. Seems like a good fit!'
      },
      {
        title: 'Full Stack Engineer',
        company: 'StartupXYZ',
        status: 'Interview',
        description: 'Join our small team building the next generation of productivity tools.',
        salary_min: 80000,
        salary_max: 110000,
        application_url: 'https://startupxyz.com/careers',
        date_applied: '2024-01-10',
        notes: 'First interview scheduled for next week. Very exciting opportunity!'
      },
      {
        title: 'Frontend Developer',
        company: 'WebSolutions Ltd',
        status: 'Rejected',
        description: 'Create beautiful and responsive user interfaces.',
        salary_min: 70000,
        salary_max: 90000,
        application_url: 'https://websolutions.com/jobs/frontend',
        date_applied: '2024-01-05',
        notes: 'Not selected. Looking for someone with more Vue.js experience.'
      },
      {
        title: 'JavaScript Developer',
        company: 'Digital Agency Pro',
        status: 'New',
        description: 'Work on various client projects using modern JavaScript frameworks.',
        salary_min: 75000,
        salary_max: 95000,
        application_url: 'https://digitalagencypro.com/careers',
        date_applied: null,
        notes: 'Found this position on LinkedIn. Planning to apply this week.'
      },
      {
        title: 'Senior Software Engineer',
        company: 'Enterprise Solutions Inc',
        status: 'Offer',
        description: 'Lead development of enterprise software solutions.',
        salary_min: 110000,
        salary_max: 140000,
        application_url: 'https://enterprise-solutions.com/jobs',
        date_applied: '2024-01-01',
        notes: 'Received offer! Need to review terms and negotiate salary.'
      }
    ];
    
    // Insert sample jobs
    console.log('💼 Creating sample job applications...');
    for (const job of sampleJobs) {
      const result = await query(`
        INSERT INTO jobs (
          user_id, title, company, status, description, 
          salary_min, salary_max, application_url, date_applied, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, title, company
      `, [
        userId,
        job.title,
        job.company,
        job.status,
        job.description,
        job.salary_min,
        job.salary_max,
        job.application_url,
        job.date_applied,
        job.notes
      ]);
      
      console.log(`✅ Created job: ${result.rows[0].title} at ${result.rows[0].company}`);
    }
    
    // Summary
    const jobCount = await query('SELECT COUNT(*) as count FROM jobs WHERE user_id = $1', [userId]);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • Users created: 1`);
    console.log(`   • Jobs created: ${jobCount.rows[0].count}`);
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('   • Email: test@example.com');
    console.log('   • Password: password123');
    
    console.log('\n💡 Next steps:');
    console.log('   • Start the backend server: npm run dev');
    console.log('   • Start the frontend development server');
    console.log('   • Login with the test credentials above');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Ensure migrations have been run: npm run migrate');
    console.error('   • Check database connection: npm run test-db');
    console.error('   • Verify PostgreSQL is running');
    process.exit(1);
  }
  
  process.exit(0);
}

// Run seeding
seedDatabase();