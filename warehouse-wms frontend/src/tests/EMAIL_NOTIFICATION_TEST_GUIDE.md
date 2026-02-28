# Email Notifications Feature - Test Guide

## Overview
Email notification system for low stock alerts and daily inventory reports.

## Features
- ✅ SMTP email configuration
- ✅ Low stock alerts
- ✅ Daily inventory reports
- ✅ Multiple recipients
- ✅ Test email functionality
- ✅ Dark mode support

## Setup Instructions

### 1. Access Settings
1. Navigate to **Settings** page
2. You'll see "⚙️ Email Notification Settings"

### 2. Configure SMTP (Gmail Example)
**Steps:**
1. Enable "Enable Email Notifications" toggle
2. Fill in SMTP details:
   - **SMTP Host:** smtp.gmail.com
   - **SMTP Port:** 587
   - **SMTP Username:** your-email@gmail.com
   - **SMTP Password:** Your App Password (not regular password)
   - **From Email:** noreply@yourcompany.com
   - **From Name:** Warehouse WMS

**Gmail App Password Setup:**
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new
4. Use generated password in settings

### 3. Add Recipients
**Steps:**
1. In "Notification Recipients" field
2. Add emails separated by commas:
   ```
   admin@company.com, manager@company.com, warehouse@company.com
   ```

### 4. Configure Notifications
**Options:**
- **Low Stock Threshold:** Set value (default: 50)
- **Send Low Stock Alerts:** Enable/Disable
- **Send Daily Report:** Enable/Disable

### 5. Test Configuration
**Steps:**
1. Click "📤 Send Test Email" button
2. Check recipient inbox
3. Verify email received

**Expected Email:**
- Subject: "Test Email - Warehouse WMS"
- Body: Configuration test message
- From: Your configured sender

## Test Cases

### Test 1: SMTP Configuration
**Steps:**
1. Fill in all SMTP details
2. Click "Send Test Email"

**Expected Results:**
- ✅ Success toast: "Test email sent successfully!"
- ✅ Email received in inbox
- ✅ No errors in console

### Test 2: Low Stock Alert
**Steps:**
1. Enable low stock alerts
2. Set threshold to 50
3. Create/update product with stock < 50
4. Wait for alert (or trigger manually)

**Expected Email:**
- Subject: "⚠️ Low Stock Alert - Warehouse WMS"
- Body: List of low stock products
- Product details: Name, SKU, Current Stock

### Test 3: Multiple Recipients
**Steps:**
1. Add 3+ email addresses
2. Send test email

**Expected Results:**
- ✅ All recipients receive email
- ✅ No duplicate emails
- ✅ All emails delivered successfully

### Test 4: Daily Report
**Steps:**
1. Enable "Send Daily Report"
2. Wait for scheduled time (or trigger manually)

**Expected Email:**
- Subject: "📊 Daily Inventory Report"
- Body: Summary of inventory
- Includes: Total products, stock levels, alerts

### Test 5: Save Settings
**Steps:**
1. Configure all settings
2. Click "💾 Save Settings"
3. Refresh page

**Expected Results:**
- ✅ Success toast: "Email settings saved successfully!"
- ✅ Settings persist after refresh
- ✅ All fields retain values

### Test 6: Disable Notifications
**Steps:**
1. Uncheck "Enable Email Notifications"
2. Save settings

**Expected Results:**
- ✅ All fields become disabled
- ✅ No emails sent
- ✅ Settings saved

### Test 7: Dark Mode
**Steps:**
1. Enable dark mode (🌙 button)
2. Check settings page

**Expected Results:**
- ✅ Dark background
- ✅ Light text
- ✅ Info card has dark gradient
- ✅ All elements readable

## Email Templates

### Low Stock Alert Email
```
Subject: ⚠️ Low Stock Alert - Warehouse WMS

Dear Team,

The following products have fallen below the minimum stock threshold:

1. Paper Cups (SKU: PC001)
   Current Stock: 25 units
   Minimum Required: 50 units

2. Plastic Plates (SKU: PP002)
   Current Stock: 15 units
   Minimum Required: 50 units

Please reorder these items immediately.

Best regards,
Warehouse WMS
```

### Daily Report Email
```
Subject: 📊 Daily Inventory Report - [Date]

Inventory Summary for [Date]:

Total Products: 150
Total Stock Value: $45,000
Low Stock Items: 5
Out of Stock Items: 2

Top Low Stock Products:
- Paper Cups: 25 units
- Plastic Plates: 15 units

Action Required: Review and reorder low stock items.

Best regards,
Warehouse WMS
```

## Troubleshooting

### Email Not Sending
- ✅ Check SMTP credentials
- ✅ Verify port number (587 for TLS)
- ✅ Enable "Less secure apps" (Gmail)
- ✅ Use App Password instead of regular password
- ✅ Check firewall settings

### Test Email Failed
- ✅ Verify internet connection
- ✅ Check SMTP server status
- ✅ Validate email format
- ✅ Check spam folder
- ✅ Review console errors

### Recipients Not Receiving
- ✅ Verify email addresses
- ✅ Check spam/junk folders
- ✅ Ensure proper comma separation
- ✅ Validate email format

## SMTP Providers

### Gmail
- Host: smtp.gmail.com
- Port: 587 (TLS) or 465 (SSL)
- Requires: App Password

### Outlook/Office 365
- Host: smtp.office365.com
- Port: 587
- Requires: Account credentials

### SendGrid
- Host: smtp.sendgrid.net
- Port: 587
- Requires: API Key

### Amazon SES
- Host: email-smtp.[region].amazonaws.com
- Port: 587
- Requires: SMTP credentials

## Success Criteria
✅ SMTP configuration saves correctly
✅ Test email sends successfully
✅ Low stock alerts trigger automatically
✅ Multiple recipients receive emails
✅ Settings persist after refresh
✅ Dark mode works properly
✅ All validations work
✅ No console errors
