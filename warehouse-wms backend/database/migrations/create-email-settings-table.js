const pool = require('../../config/db');

async function createEmailSettingsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS email_settings (
      id SERIAL PRIMARY KEY,
      enabled BOOLEAN DEFAULT FALSE,
      smtp_host VARCHAR(255),
      smtp_port INTEGER,
      smtp_user VARCHAR(255),
      smtp_password VARCHAR(255),
      from_email VARCHAR(255),
      from_name VARCHAR(255) DEFAULT 'Warehouse WMS',
      notification_emails TEXT,
      low_stock_threshold INTEGER DEFAULT 50,
      send_daily_report BOOLEAN DEFAULT FALSE,
      send_low_stock_alert BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(createTableQuery);
    console.log('✅ Email settings table created successfully');
    
    // Insert default settings
    const checkQuery = 'SELECT COUNT(*) as count FROM email_settings';
    const result = await pool.query(checkQuery);
    
    if (parseInt(result.rows[0].count) === 0) {
      const insertQuery = `
        INSERT INTO email_settings (enabled, low_stock_threshold, send_low_stock_alert)
        VALUES (FALSE, 50, TRUE)
      `;
      await pool.query(insertQuery);
      console.log('✅ Default email settings inserted');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating email settings table:', error);
    process.exit(1);
  }
}

createEmailSettingsTable();
