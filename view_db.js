// Simple script to view database tables and data
const { execSync } = require('child_process');
const path = require('path');

console.log('📊 Database Viewer for MedCycleAI');
console.log('==================================\n');

console.log('📋 Available Database Tables:');
console.log('1. users - Healthcare entities (hospitals, pharmacies, etc.)');
console.log('2. medicines - Medicine listings');
console.log('3. cart - Shopping cart items');
console.log('4. orders - Completed purchases');
console.log('5. order_items - Individual items in orders\n');

console.log('🔧 To view your database data, you can:');
console.log('1. Use the Neon Database dashboard (if using Neon)');
console.log('2. Run SQL queries directly');
console.log('3. Use database management tools\n');

console.log('📁 Database Schema Location:');
console.log('- Schema file: MedCycleAI/shared/schema.ts');
console.log('- Database config: MedCycleAI/drizzle.config.ts');
console.log('- Connection: MedCycleAI/server/db.ts\n');

console.log('🚀 Quick Commands:');
console.log('- npm run dev (to start the application)');
console.log('- Check your .env file for DATABASE_URL');
console.log('- Use Neon Database dashboard for visual data viewing');
