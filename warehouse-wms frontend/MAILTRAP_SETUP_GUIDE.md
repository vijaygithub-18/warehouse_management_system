# 📧 Mailtrap Setup Guide (2 Minutes)

## What is Mailtrap?
- Free email testing service
- Emails don't actually send to real inboxes
- Perfect for testing without spam/setup hassles
- View all test emails in Mailtrap dashboard

---

## Step 1: Sign Up (1 minute)

1. **Go to:** https://mailtrap.io
2. **Click:** "Sign Up" (top right)
3. **Choose one:**
   - Sign up with Google (fastest)
   - Sign up with GitHub
   - Sign up with Email

4. **If using email:**
   - Enter your email
   - Create password
   - Click "Sign Up"
   - Verify email (check inbox)

---

## Step 2: Get SMTP Credentials (30 seconds)

1. **After login**, you'll see "My Inbox"
2. **Click:** "My Inbox" or "Email Testing"
3. **Click:** "SMTP Settings" dropdown
4. **Select:** "Nodemailer" (or show credentials)

You'll see something like:

```
Host: sandbox.smtp.mailtrap.io
Port: 2525
Username: 1a2b3c4d5e6f7g
Password: 9h8i7j6k5l4m3n
```

---

## Step 3: Fill Your Settings Page

**Copy these values to your Warehouse WMS Settings:**

```
✅ Enable Email Notifications: [CHECK THIS]

SMTP Host: sandbox.smtp.mailtrap.io
SMTP Port: 2525
SMTP Username: [paste from Mailtrap]
SMTP Password: [paste from Mailtrap]
From Email: test@warehouse.com
From Name: Warehouse WMS

Notification Recipients: test@warehouse.com
Low Stock Threshold: 50

✅ Send Low Stock Alerts: [CHECK THIS]
☐ Send Daily Report: [LEAVE UNCHECKED]
```

---

## Step 4: Test It

1. **Click:** "📤 Send Test Email" in your app
2. **Go back to Mailtrap dashboard**
3. **Refresh** the inbox
4. **You'll see the test email!**

---

## Visual Guide

### After Sign Up:
```
Mailtrap Dashboard
├── My Inbox (click here)
│   ├── SMTP Settings (dropdown)
│   │   └── Show Credentials
│   │       ├── Host: sandbox.smtp.mailtrap.io
│   │       ├── Port: 2525
│   │       ├── Username: xxxxxxxxxx
│   │       └── Password: xxxxxxxxxx
```

---

## Example Credentials

**Your credentials will look like this:**

```
Host: sandbox.smtp.mailtrap.io
Port: 2525
Username: 1a2b3c4d5e6f7g
Password: 9h8i7j6k5l4m3n
Auth: Plain
TLS: Optional
```

---

## Benefits of Mailtrap

✅ **No App Password needed**
✅ **Works instantly** (no 2FA setup)
✅ **See all emails** in one dashboard
✅ **Test without spam**
✅ **Free forever** (500 emails/month)
✅ **No real emails sent** (safe testing)

---

## After Testing

Once you confirm emails work with Mailtrap, you can:

1. **Switch to real email** (Gmail/Outlook) later
2. **Keep using Mailtrap** for development
3. **Use both:** Mailtrap for testing, Gmail for production

---

## Quick Start (Copy-Paste)

1. Go to: https://mailtrap.io
2. Sign up with Google (1 click)
3. Click "My Inbox"
4. Copy SMTP credentials
5. Paste in your Settings page
6. Click "Send Test Email"
7. Check Mailtrap inbox
8. Done! ✨

---

## Troubleshooting

### Can't find SMTP Settings?
- Click "My Inbox" in left sidebar
- Look for "SMTP Settings" dropdown at top
- Or click "Show Credentials"

### Wrong credentials?
- Make sure you copied from "Nodemailer" section
- Port should be 2525 (not 587)
- Host should be sandbox.smtp.mailtrap.io

### Email not showing in Mailtrap?
- Refresh the inbox page
- Check if test email succeeded in your app
- Look at backend terminal for errors

---

## Next Steps

After successful test:

1. ✅ Click "Save Settings" in your app
2. ✅ Test low stock alerts
3. ✅ Test daily reports
4. ✅ Switch to real email when ready for production

---

**Total Time: 2 minutes** ⏱️
**Difficulty: Super Easy** 😊
**Cost: Free Forever** 💰
