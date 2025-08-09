const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'financial_planner',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
})

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...')
  
  try {
    // Test connection
    await pool.query('SELECT NOW()')
    console.log('✅ Database connection successful')
    
    // Check if data already exists
    const userCheck = await pool.query('SELECT COUNT(*) FROM users')
    if (parseInt(userCheck.rows[0].count) > 0) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise(resolve => {
        readline.question('Sample data already exists. Do you want to recreate it? (y/N): ', resolve)
      })
      
      readline.close()
      
      if (answer.toLowerCase() !== 'y') {
        console.log('🚫 Database seeding cancelled')
        process.exit(0)
      }
      
      // Clear existing data
      console.log('🗑️  Clearing existing data...')
      await pool.query('TRUNCATE users, accounts, transactions, budgets, goals, goal_contributions, statement_uploads CASCADE')
    }
    
    console.log('📊 Inserting sample data...')
    
    // Read and execute seed file
    const fs = require('fs')
    const path = require('path')
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../database/init/02-seed-data.sql'),
      'utf8'
    )
    
    await pool.query(seedSQL)
    console.log('✅ Sample data inserted successfully')
    
    // Display summary
    const summary = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM accounts) as accounts,
        (SELECT COUNT(*) FROM transactions) as transactions,
        (SELECT COUNT(*) FROM budgets) as budgets,
        (SELECT COUNT(*) FROM goals) as goals
    `)
    
    const stats = summary.rows[0]
    console.log('📈 Database seeded with:')
    console.log(`   • ${stats.accounts} accounts`)
    console.log(`   • ${stats.transactions} transactions`)
    console.log(`   • ${stats.budgets} budgets`)
    console.log(`   • ${stats.goals} goals`)
    
    console.log('🎉 Database seeding complete!')
    console.log('💡 You can now start the development server with "npm run dev"')
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seedDatabase()
