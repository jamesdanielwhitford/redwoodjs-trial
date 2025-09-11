// RedwoodSDK provides built-in database client
import { PrismaClient } from '@prisma/client';

// RedwoodSDK automatically configures the database client
// No manual connection management needed
export const db = new PrismaClient();