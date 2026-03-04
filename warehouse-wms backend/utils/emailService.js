const nodemailer = require('nodemailer');

class EmailService {
  constructor(settings) {
    this.settings = settings;
    this.transporter = null;
  }

  createTransporter() {
    if (!this.settings || !this.settings.smtp_host) {
      throw new Error('Email settings not configured');
    }

    this.transporter = nodemailer.createTransport({
      host: this.settings.smtp_host,
      port: parseInt(this.settings.smtp_port),
      secure: parseInt(this.settings.smtp_port) === 465,
      auth: {
        user: this.settings.smtp_user,
        pass: this.settings.smtp_password
      }
    });

    return this.transporter;
  }

  async sendEmail(to, subject, html) {
    try {
      if (!this.transporter) {
        this.createTransporter();
      }

      const mailOptions = {
        from: `"${this.settings.from_name}" <${this.settings.from_email}>`,
        to: to,
        subject: subject,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw error;
    }
  }

  async sendTestEmail(to) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">🧪 Test Email - Warehouse WMS</h2>
        <p>This is a test email to verify your SMTP configuration.</p>
        <p>If you received this email, your email settings are configured correctly!</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Sent from Warehouse WMS<br>
          ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    return await this.sendEmail(to, 'Test Email - Warehouse WMS', html);
  }

  async sendLowStockAlert(products, recipients) {
    const productList = products.map(p => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${p.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${p.sku}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #ef4444; font-weight: bold;">${p.stock}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${this.settings.low_stock_threshold}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">⚠️ Low Stock Alert</h2>
        <p>The following products have fallen below the minimum stock threshold:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">SKU</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Current Stock</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Min Required</th>
            </tr>
          </thead>
          <tbody>
            ${productList}
          </tbody>
        </table>
        
        <p style="color: #ef4444; font-weight: bold;">⚡ Action Required: Please reorder these items immediately.</p>
        
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Sent from Warehouse WMS<br>
          ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    return await this.sendEmail(recipients, '⚠️ Low Stock Alert - Warehouse WMS', html);
  }

  async sendDailyReport(stats, recipients) {
    let lowStockTable = '';
    
    if (stats.lowStockProducts && stats.lowStockProducts.length > 0) {
      const productRows = stats.lowStockProducts.map(p => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${p.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${p.sku}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #ef4444; font-weight: bold;">${p.stock}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${p.minimum_stock}</td>
        </tr>
      `).join('');
      
      lowStockTable = `
        <div style="margin: 20px 0;">
          <h3 style="color: #ef4444;">⚠️ Low Stock Alert (Top 10)</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">SKU</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Current Stock</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Min Required</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>
        </div>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">📊 Daily Inventory Report</h2>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Inventory Summary</h3>
          <p><strong>Total Products:</strong> ${stats.totalProducts}</p>
          <p><strong>Products In Stock:</strong> ${stats.totalValue}</p>
          <p><strong>Low Stock Items:</strong> <span style="color: #f59e0b;">${stats.lowStockCount}</span></p>
          <p><strong>Out of Stock Items:</strong> <span style="color: #ef4444;">${stats.outOfStockCount}</span></p>
        </div>
        
        ${lowStockTable}
        
        <p>Review your inventory and take necessary actions.</p>
        
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Sent from Warehouse WMS<br>
          ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    return await this.sendEmail(recipients, `📊 Daily Inventory Report - ${new Date().toLocaleDateString()}`, html);
  }
}

module.exports = EmailService;
