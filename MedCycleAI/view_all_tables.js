// Script to view all tables and their data
import dotenv from 'dotenv';
dotenv.config();

import { db } from './server/db.js';

async function viewAllTables() {
  try {
    console.log('=== DATABASE OVERVIEW ===\n');

    // Users table
    console.log('1. USERS TABLE:');
    const users = await db().execute('SELECT id, email, organization_name, user_type, role FROM users;');
    console.log(`Total users: ${users.rows.length}`);
    console.table(users.rows);

    // Medicines table
    console.log('\n2. MEDICINES TABLE:');
    const medicines = await db().execute('SELECT id, name, company, quantity, cost_per_unit, sender_id, is_approved FROM medicines;');
    console.log(`Total medicines: ${medicines.rows.length}`);
    console.table(medicines.rows);

    // Cart table
    console.log('\n3. CART TABLE:');
    const cart = await db().execute('SELECT * FROM cart;');
    console.log(`Total cart items: ${cart.rows.length}`);
    console.table(cart.rows);

    // Orders table
    console.log('\n4. ORDERS TABLE:');
    const orders = await db().execute('SELECT * FROM orders;');
    console.log(`Total orders: ${orders.rows.length}`);
    console.table(orders.rows);

    // Order items table
    console.log('\n5. ORDER_ITEMS TABLE:');
    const orderItems = await db().execute('SELECT * FROM order_items;');
    console.log(`Total order items: ${orderItems.rows.length}`);
    console.table(orderItems.rows);

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

viewAllTables();
