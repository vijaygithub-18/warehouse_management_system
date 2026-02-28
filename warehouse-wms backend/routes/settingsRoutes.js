const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../controllers/authController');
const EmailService = require('../utils/emailService');

// Get email settings
router.get('/email', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM email_settings ORDER BY id DESC LIMIT 1');
    const settings = result.rows[0];
    
    if (!settings) {
      return res.json({
        enabled: false,
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_password: '',
        from_email: '',
        from_name: 'Warehouse WMS',
        notification_emails: '',
        low_stock_threshold: 50,
        send_daily_report: false,
        send_low_stock_alert: true
      });
    }

    // Don't send password to frontend
    const { smtp_password, ...safeSettings } = settings;
    res.json({
      ...safeSettings,
      smtp_password: smtp_password ? '••••••••' : ''
    });
  } catch (error) {
    console.error('Error fetching email settings:', error);
    res.status(500).json({ error: 'Failed to fetch email settings' });
  }
});

// Save email settings
router.post('/email', verifyToken, async (req, res) => {
  try {
    const {
      enabled,
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_password,
      from_email,
      from_name,
      notification_emails,
      low_stock_threshold,
      send_daily_report,
      send_low_stock_alert
    } = req.body;

    // Check if settings exist
    const existingResult = await pool.query('SELECT id, smtp_password FROM email_settings LIMIT 1');
    const existing = existingResult.rows[0];
    
    // Use existing password if new one is masked
    const finalPassword = smtp_password === '••••••••' && existing 
      ? existing.smtp_password 
      : smtp_password;

    if (existing) {
      await pool.query(`
        UPDATE email_settings 
        SET enabled = $1, smtp_host = $2, smtp_port = $3, smtp_user = $4, 
            smtp_password = $5, from_email = $6, from_name = $7, 
            notification_emails = $8, low_stock_threshold = $9, 
            send_daily_report = $10, send_low_stock_alert = $11,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
      `, [
        enabled, smtp_host, smtp_port, smtp_user, finalPassword,
        from_email, from_name, notification_emails, low_stock_threshold,
        send_daily_report, send_low_stock_alert, existing.id
      ]);
    } else {
      await pool.query(`
        INSERT INTO email_settings (
          enabled, smtp_host, smtp_port, smtp_user, smtp_password,
          from_email, from_name, notification_emails, low_stock_threshold,
          send_daily_report, send_low_stock_alert
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        enabled, smtp_host, smtp_port, smtp_user, finalPassword,
        from_email, from_name, notification_emails, low_stock_threshold,
        send_daily_report, send_low_stock_alert
      ]);
    }

    res.json({ success: true, message: 'Email settings saved successfully' });
  } catch (error) {
    console.error('Error saving email settings:', error);
    res.status(500).json({ error: 'Failed to save email settings' });
  }
});

// Send test email
router.post('/test-email', verifyToken, async (req, res) => {
  try {
    const settings = req.body;
    
    console.log('📧 Test email request received');
    console.log('SMTP Host:', settings.smtp_host);
    console.log('SMTP Port:', settings.smtp_port);
    console.log('SMTP User:', settings.smtp_user);
    console.log('From Email:', settings.from_email);
    console.log('Recipients:', settings.notification_emails);
    
    if (!settings.smtp_host || !settings.smtp_user) {
      return res.status(400).json({ error: 'SMTP host and user are required' });
    }

    // Get actual password if masked
    if (settings.smtp_password === '••••••••') {
      console.log('🔑 Fetching saved password from database...');
      const result = await pool.query('SELECT smtp_password FROM email_settings LIMIT 1');
      if (result.rows[0]) {
        settings.smtp_password = result.rows[0].smtp_password;
        console.log('✅ Password retrieved from database');
      } else {
        console.log('❌ No saved password found');
      }
    }

    console.log('📤 Creating email service and sending test email...');
    const emailService = new EmailService(settings);
    const recipients = settings.notification_emails || settings.smtp_user;
    
    await emailService.sendTestEmail(recipients);
    
    console.log('✅ Test email sent successfully!');
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    let errorMessage = 'Failed to send test email';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check your email and password (use App Password for Gmail)';
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection failed. Check SMTP host and port';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      code: error.code
    });
  }
});

// Check and send low stock alerts
router.post('/check-low-stock', verifyToken, async (req, res) => {
  try {
    const settingsResult = await pool.query(
      'SELECT * FROM email_settings WHERE enabled = TRUE AND send_low_stock_alert = TRUE LIMIT 1'
    );
    const settings = settingsResult.rows[0];
    
    if (!settings) {
      return res.json({ message: 'Email notifications not enabled' });
    }

    const lowStockResult = await pool.query(`
      SELECT name, sku, stock 
      FROM products
      WHERE stock < $1
    `, [settings.low_stock_threshold]);
    const lowStockProducts = lowStockResult.rows;

    if (lowStockProducts.length === 0) {
      return res.json({ message: 'No low stock products found' });
    }

    const emailService = new EmailService(settings);
    await emailService.sendLowStockAlert(lowStockProducts, settings.notification_emails);
    
    res.json({ 
      success: true, 
      message: `Low stock alert sent for ${lowStockProducts.length} products` 
    });
  } catch (error) {
    console.error('Error checking low stock:', error);
    res.status(500).json({ error: 'Failed to send low stock alert' });
  }
});

module.exports = router;
