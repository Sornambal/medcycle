// Script to view existing users in the database
import dotenv from 'dotenv';
dotenv.config();

import { db } from './server/db.js';

async function viewUsers() {
  try {
    console.log('Fetching users...');
    const result = await db().execute('SELECT id, email, organization_name, user_type, role FROM users;');
    console.log('Existing Users:', result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

viewUsers();
