// Script to check existing users in the database
import { db } from './server/db.js'; // Corrected path

async function checkUsers() {
  try {
    const result = await db().execute('SELECT * FROM users;');
    console.log('Existing Users:', result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

checkUsers();
