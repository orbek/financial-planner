const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'financial_planner',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
})

async function setupDatabase() {
  console.log('🗄️  Setting up local database...')
  
  try {
    // Test connection
    await pool.query('SELECT NOW()')
    console.log('✅ Database connection successful')
    
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    
    if (tablesResult.rows.length > 0) {
      console.log('📋 Existing tables found:', tablesResult.rows.map(r => r.table_name).join(', '))
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise(resolve => {
        readline.question('Do you want to recreate all tables? This will delete existing data. (y/N): ', resolve)
      })
      
      readline.close()
      
      if (answer.toLowerCase() !== 'y') {
        console.log('🚫 Database setup cancelled')
        process.exit(0)
      }
      
      // Drop existing tables
      console.log('🗑️  Dropping existing tables...')
      await pool.query('DROP SCHEMA public CASCADE')
      await pool.query('CREATE SCHEMA public')
      await pool.query('GRANT ALL ON SCHEMA public TO postgres')
      await pool.query('GRANT ALL ON SCHEMA public TO public')
    }
    
    console.log('📊 Creating database schema...')
    
    // Read and execute schema file
    const fs = require('fs')
    const path = require('path')
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../database/init/01-create-tables.sql'),
      'utf8'
    )
    
    await pool.query(schemaSQL)
    console.log('✅ Database schema created successfully')
    
    console.log('🌱 Database setup complete!')
    console.log('💡 Run "npm run db:seed" to add sample data')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase()
