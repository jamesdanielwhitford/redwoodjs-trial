// RedwoodSDK Server Component - runs on the server, data fetching included
import { db } from '../lib/db';
import { getCurrentUser } from '../lib/auth';
import { redirect } from 'rwsdk/navigation';
import LoginPage from './login';
import Dashboard from '../components/Dashboard';

export default async function HomePage() {
  // Server Component - this runs on the server
  const user = await getCurrentUser();
  
  if (!user) {
    // User not authenticated, show login
    return <LoginPage />;
  }

  // Fetch data directly in Server Component - no API calls needed!
  const notes = await db.note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  // Pass data to client component
  return <Dashboard user={user} initialNotes={notes} />;
}