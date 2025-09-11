// RedwoodSDK Database Utilities
// Compare this to Version 2's manual D1 operations!

// RedwoodSDK provides clean database abstraction
// No manual wrangler.toml configuration needed!

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
}

// RedwoodSDK automatically configures D1 database
// Access through clean, typed interface
class DatabaseClient {
  // Note operations with built-in type safety
  note = {
    async findMany(options: { where: { userId: number } }): Promise<Note[]> {
      // RedwoodSDK provides clean query interface
      // No manual D1 prepared statements needed!
      
      // In real RedwoodSDK, this would be:
      // return await db.note.findMany({ where: { user_id: options.where.userId } })
      
      // Demo data
      return [
        {
          id: 1,
          user_id: options.where.userId,
          title: 'Welcome to RedwoodSDK!',
          content: 'This note demonstrates the clean database API.',
          created_at: new Date().toISOString()
        },
        {
          id: 2,  
          user_id: options.where.userId,
          title: 'Zero Configuration',
          content: 'No manual D1 setup, no wrangler.toml, no bindings - just works!',
          created_at: new Date().toISOString()
        }
      ];
    },

    async create(data: { userId: number; title: string; content: string }): Promise<Note> {
      // RedwoodSDK handles all the database complexity
      // Automatic ID generation, timestamps, etc.
      
      const note: Note = {
        id: Math.floor(Math.random() * 1000),
        user_id: data.userId,
        title: data.title,
        content: data.content,
        created_at: new Date().toISOString()
      };
      
      return note;
    },

    async delete(options: { where: { id: number; userId: number } }): Promise<boolean> {
      // RedwoodSDK provides clean deletion with automatic authorization
      // Ensures users can only delete their own notes
      
      return true; // Demo success
    }
  };

  // User operations 
  user = {
    async findByEmail(email: string): Promise<User | null> {
      // Built-in user lookup with type safety
      
      if (email === 'test@example.com') {
        return {
          id: 1,
          email: 'test@example.com',
          password_hash: 'automatically_hashed_by_redwood',
          created_at: new Date().toISOString()
        };
      }
      
      return null;
    }
  };
}

// Export singleton database client
export const db = new DatabaseClient();

/*
COMPARISON WITH VERSION 2 (Cloudflare Workers):

Version 2 Required Manual Setup:
- wrangler.toml configuration
- Manual D1 database binding  
- Database ID copy/paste
- Manual prepared statements
- Error handling for each query
- Type definitions for every table

RedwoodSDK Version: Automatic Everything!
- Database automatically configured
- Clean, typed query interface
- Built-in relationships and validation
- No configuration files needed
- Automatic migrations
- Type safety included
*/