import dotenv from "dotenv";
dotenv.config();

import { db } from "./db";

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    
    // Test basic connection
    const result = await db().execute("SELECT 1 as test");
    console.log("Database connection successful:", result);
    
    // Create users table
    console.log("Creating users table...");
    await db().execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        organization_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(15) NOT NULL,
        pin_code VARCHAR(10) NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        gov_id_number VARCHAR(100),
        aadhaar_number VARCHAR(12),
        is_verified BOOLEAN DEFAULT FALSE,
        role VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Users table created successfully!");
    
    // Create other tables
    console.log("Creating other tables...");
    await db().execute(`
      CREATE TABLE IF NOT EXISTS medicines (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id VARCHAR NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        expiry_date TIMESTAMP NOT NULL,
        batch_number VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL,
        cost_per_unit DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        is_sealed BOOLEAN DEFAULT TRUE,
        is_approved BOOLEAN DEFAULT FALSE,
        approved_by VARCHAR REFERENCES users(id),
        ai_verification_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await db().execute(`
      CREATE TABLE IF NOT EXISTS cart (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        medicine_id VARCHAR NOT NULL REFERENCES medicines(id),
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await db().execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        buyer_id VARCHAR NOT NULL REFERENCES users(id),
        total_amount DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_id VARCHAR(255),
        delivery_status VARCHAR(50) DEFAULT 'pending',
        delivery_address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await db().execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR NOT NULL REFERENCES orders(id),
        medicine_id VARCHAR NOT NULL REFERENCES medicines(id),
        sender_id VARCHAR NOT NULL REFERENCES users(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL
      );
    `);
    
    console.log("All tables created successfully!");
    
    // Create admin user
    console.log("Creating admin user...");
    await db().execute(`
      INSERT INTO users (id, email, password, organization_name, owner_name, mobile, pin_code, user_type, is_verified, role)
      VALUES (
        'admin-001',
        'admin@medcycle.com',
        '$2b$10$rQZ8K9X2Y1W3V4U5T6S7R8Q9P0O1N2M3L4K5J6H7G8F9E0D1C2B3A4',
        'MedCycle Admin',
        'System Administrator',
        '9999999999',
        '000000',
        'admin',
        true,
        'admin'
      ) ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Admin user created!");
    
  } catch (error) {
    console.error("Database error:", error);
  }
}

testDatabase();
