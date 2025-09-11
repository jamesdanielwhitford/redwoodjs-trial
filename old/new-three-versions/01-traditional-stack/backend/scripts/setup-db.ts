import { database } from '../database/db';

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    await database.init();
    console.log('Database setup completed successfully!');
    console.log('Tables created:');
    console.log('- users (id, email, password_hash, created_at)');
    console.log('- notes (id, user_id, title, content, created_at, updated_at)');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    database.close();
  }
}

setupDatabase();