# 📧 Gmail Email Setup Guide - Step 2

## How to Fill the Settings Form

### 1. Navigate to Settings
- Open your app: http://localhost:5173
- Click **⚙️ Settings** in the sidebar
- You'll see the Email Notification Settings page

---

## 2. Fill Out the Form (Copy These Values)

### ✅ Enable Email Notifications
**CHECK THIS BOX FIRST** - This enables all the input fields

---

### 📧 Email Configuration Section

| Field | Value | Example |
|-------|-------|---------|
| **SMTP Host** | `smtp.gmail.com` | smtp.gmail.com |
| **SMTP Port** | `587` | 587 |
| **SMTP Username** | Your Gmail address | john.doe@gmail.com |
| **SMTP Password** | Your 16-char App Password | abcd efgh ijkl mnop |
| **From Email** | Your Gmail address | john.doe@gmail.com |
| **From Name** | `Warehouse WMS` | Warehouse WMS |

**⚠️ IMPORTANT:** 
- SMTP Password = App Password (16 characters from Step 1)
- NOT your regular Gmail password!
- Remove spaces when pasting: `abcdefghijklmnop`

---

### 📬 Notification Recipients
Enter email(s) where you want to receive alerts:
```
john.doe@gmail.com
```

Or multiple emails (comma-separated):
```
john.doe@gmail.com, manager@company.com, admin@company.com
```

---

### 🔔 Notification Preferences Section

| Setting | Value | Description |
|---------|-------|-------------|
| **Low Stock Threshold** | `50` | Alert when stock < 50 units |
| **✅ Send Low Stock Alerts** | CHECKED | Enable low stock emails |
| **☐ Send Daily Report** | UNCHECKED | Disable for now (test later) |

---

## 3. Test Your Configuration

### Step 1: Click "📤 Send Test Email"
- Wait 5-10 seconds
- Check your inbox
- Check spam/junk folder if not in inbox

### Step 2: If Test Succeeds
- You'll see: ✅ "Test email sent successfully! Check your inbox."
- Click **"💾 Save Settings"**
- Done! ✨

---

## 4. What You'll Receive

### Test Email Preview:
```
From: Warehouse WMS <john.doe@gmail.com>
To: john.doe@gmail.com
Subject: Test Email - Warehouse WMS

This is a test email to verify your SMTP configuration.

If you received this email, your email settings are working correctly!

---
Warehouse WMS
Automated Email System
```

---

## 🔧 Troubleshooting

### ❌ "Authentication failed"
- **Cause:** Wrong App Password or using regular password
- **Fix:** 
  1. Go back to Step 1
  2. Generate a NEW App Password
  3. Copy it WITHOUT spaces
  4. Paste in SMTP Password field

### ❌ "Connection timeout"
- **Cause:** Wrong port or firewall blocking
- **Fix:** 
  1. Ensure port is `587` (not 465 or 25)
  2. Check your firewall/antivirus
  3. Try different network (mobile hotspot)

### ❌ "Invalid credentials"
- **Cause:** 2-Step Verification not enabled
- **Fix:** 
  1. Enable 2-Step Verification first
  2. Then generate App Password
  3. Try again

### ❌ Email not received
- **Check:** Spam/Junk folder
- **Check:** Notification Recipients field has correct email
- **Check:** Gmail inbox (not Promotions/Social tabs)

---

## 📋 Quick Copy-Paste Template

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: YOUR_EMAIL@gmail.com
SMTP Password: YOUR_16_CHAR_APP_PASSWORD
From Email: YOUR_EMAIL@gmail.com
From Name: Warehouse WMS
Notification Recipients: YOUR_EMAIL@gmail.com
Low Stock Threshold: 50
```

---

## ✅ Success Checklist

- [ ] Enabled Email Notifications toggle
- [ ] Filled SMTP Host: smtp.gmail.com
- [ ] Filled SMTP Port: 587
- [ ] Filled SMTP Username (your Gmail)
- [ ] Filled SMTP Password (16-char App Password, no spaces)
- [ ] Filled From Email (your Gmail)
- [ ] Filled Notification Recipients
- [ ] Checked "Send Low Stock Alerts"
- [ ] Clicked "Send Test Email"
- [ ] Received test email in inbox
- [ ] Clicked "Save Settings"

---

## 🎉 Next Steps After Success

1. **Test Low Stock Alert:**
   - Go to Products page
   - Find a product with stock < 50
   - Or adjust a product's stock to < 50
   - Check if you receive low stock alert email

2. **Enable Daily Report (Optional):**
   - Go back to Settings
   - Check "Send Daily Inventory Report"
   - Save Settings
   - You'll receive daily summary at midnight

---

**Need Help?** 
- Make sure you completed Step 1 (App Password generation)
- Double-check all values match exactly
- Remove any spaces from App Password
- Try with a different Gmail account if issues persist
