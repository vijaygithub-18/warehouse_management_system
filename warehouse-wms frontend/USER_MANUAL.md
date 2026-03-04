# 📚 Warehouse WMS - User Manual

**Version:** 1.0  
**Last Updated:** 2024

---

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Product Management](#product-management)
4. [Inventory Operations](#inventory-operations)
5. [Orders Management](#orders-management)
6. [Reports & Analytics](#reports--analytics)
7. [Settings](#settings)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Login
1. Open browser: `http://localhost:5173`
2. Enter username and password
3. Click "Login"

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

### First Time Setup
1. Login as admin
2. Go to **Settings** → Configure email notifications
3. Go to **Products** → Add your first product
4. Go to **Customers** → Add customers
5. Go to **Suppliers** → Add suppliers

---

## 📊 Dashboard

### Overview
The dashboard shows real-time warehouse metrics:

**Top Stats:**
- 📦 Total Products
- 📊 Total Stock
- ⚠️ Low Stock Items
- 📥 Recent Receipts

**Today's Summary:**
- Inward Today (with quantity)
- Outward Today (with quantity)
- Stock Adjustments Today
- Pending Shipments

**Financial Overview:**
- Gross Profit
- Total Sales
- Total Purchases
- Stock Value
- Monthly comparisons

**Quick Actions:**
- Click "View All" buttons to navigate
- Click "Refresh" to update data
- Use quick action buttons to add new entries

---

## 📦 Product Management

### Add New Product

1. Go to **Products** page
2. Click **"+ Add Product"**
3. Fill in details:
   - **Name:** Product name (required)
   - **Category:** Select from dropdown (required)
   - **Material:** Product material
   - **Size:** Product dimensions
   - **Carton Quantity:** Units per carton
   - **Minimum Stock:** Alert threshold
   - **Rack:** Storage location
4. Click **"Add Product"**

**Note:** SKU is auto-generated based on category:
- Paper Cups → PC-0001
- Pizza Boxes → PB-0001
- Lids → LD-0001
- Food Boxes → FB-0001

### Edit Product

1. Find product in list
2. Click **"Edit"** button
3. Modify details
4. Click **"Update Product"**

### Delete Product

1. Click **"Delete"** button
2. Confirm deletion
3. **Note:** Cannot delete if product has inward/outward records

### Search Products

- Use search bar to find by name or SKU
- Results update in real-time

---

## 📥 Inventory Operations

### Inward (Goods Receipt)

**Purpose:** Record incoming stock from suppliers

1. Go to **Inward** page
2. Click **"+ Add Inward"**
3. Fill details:
   - **Product:** Select product
   - **Quantity:** Number of cartons
   - **Rack:** Storage location
   - **Supplier:** Select supplier
   - **GRN:** Goods Receipt Note number (unique)
4. Click **"Add Inward"**

**What Happens:**
- ✅ Stock automatically increases
- ✅ Inventory record created
- ✅ Activity logged

**Important:** GRN must be unique. System prevents duplicates.

### Outward (Goods Dispatch)

**Purpose:** Record outgoing stock to customers

1. Go to **Outward** page
2. Click **"+ Add Outward"**
3. Fill details:
   - **Product:** Select product
   - **Quantity:** Number of cartons
   - **Customer:** Select customer
   - **Invoice:** Invoice number (unique)
4. Click **"Add Outward"**

**What Happens:**
- ✅ Stock automatically decreases
- ✅ Inventory record created
- ✅ Activity logged

**Important:** 
- System checks stock availability
- Cannot sell more than available stock
- Invoice must be unique

### Stock Adjustments

**Purpose:** Adjust stock for damages, corrections, etc.

1. Go to **Stock Adjustments** page
2. Select **Product**
3. Enter **Quantity**
4. Select **Reason:**
   - Damaged
   - Expired
   - Lost
   - Found
   - Correction
   - Return
   - Other
5. Add **Notes** (optional)
6. Click **"Adjust IN"** or **"Adjust OUT"**

**What Happens:**
- ✅ Stock updated
- ✅ Activity logged with reason
- ✅ Audit trail maintained

---

## 🚚 Shipment Tracking

### View Shipments

1. Go to **Shipments** page
2. See all outward entries with tracking info

### Update Shipment

1. Click **"Update"** button on any shipment
2. Fill tracking details:
   - **Tracking Type:** AWB or LRN
   - **Courier/Transport:** Select from dropdown
   - **Tracking Number:** Enter number
   - **Status:** Select status
   - **Estimated Delivery:** Select date
   - **Notes:** Additional info
3. Click **"Update Shipment"**

**Tracking Types:**
- **AWB (Air Waybill):** For courier services
- **LRN (Lorry Receipt):** For transport services

**Supported Couriers:**
- Delhivery (AWB & LRN)
- BlueDart
- DTDC
- FedEx
- DHL
- India Post

**Shipment Status:**
- Pending
- Processing
- Shipped
- In Transit
- Out for Delivery
- Delivered
- Failed
- RTO

---

## 📋 Orders Management

### Sales Orders

**Create Sales Order:**
1. Go to **Sales Orders** page
2. Click **"+ New Sales Order"**
3. Fill details:
   - **Customer:** Select customer
   - **Order Date:** Select date
   - **Expected Delivery:** Select date
   - **Status:** Draft/Confirmed/Packed/Shipped/Delivered
4. Add products:
   - Select product
   - Enter quantity
   - Enter price
   - Click "Add Item"
5. Click **"Create Order"**

**Order Status Flow:**
Draft → Confirmed → Packed → Shipped → Delivered

### Purchase Orders

**Create Purchase Order:**
1. Go to **Purchase Orders** page
2. Click **"+ New Purchase Order"**
3. Fill details:
   - **Supplier:** Select supplier
   - **Order Date:** Select date
   - **Expected Delivery:** Select date
   - **Status:** Draft/Issued/Received/Completed
4. Add products and quantities
5. Click **"Create Order"**

---

## 📊 Reports & Analytics

### Available Reports

1. **Supplier Performance**
   - Total orders per supplier
   - Total amount spent
   - Total deliveries

2. **Customer Analytics**
   - Total orders per customer
   - Total revenue
   - Total shipments

3. **Product Movement**
   - Select product
   - Select date range
   - View IN/OUT movements
   - See references (GRN/Invoice)

### Export Data

- Click **"Export"** button on any report
- Downloads as CSV file
- Open in Excel/Google Sheets

### Activity Logs

1. Go to **Activity Logs** page
2. View all system activities:
   - Who did what
   - When it happened
   - Details of changes
3. Filter by:
   - Action type (CREATE, UPDATE, DELETE, ADJUST)
   - Entity type (PRODUCT, INWARD, OUTWARD, etc.)
   - Date range

---

## ⚙️ Settings

### Email Notifications

**Setup Email:**
1. Go to **Settings** page
2. Enable **"Email Notifications"**
3. Configure SMTP:
   - **Host:** smtp.gmail.com
   - **Port:** 587
   - **Username:** your-email@gmail.com
   - **Password:** App Password (not regular password)
   - **From Email:** noreply@yourcompany.com
   - **Recipients:** admin@yourcompany.com

4. Set preferences:
   - **Low Stock Threshold:** 50 (default)
   - **Send Low Stock Alerts:** ✓
   - **Send Daily Report:** ✓

5. Click **"Save Settings"**

**Test Email:**
- Click **"Send Test Email"**
- Check inbox for test message

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in settings

### Daily Reports

**What's Included:**
- Total Products
- Products In Stock
- Low Stock Items (with details)
- Out of Stock Items

**Schedule:** 8:00 AM daily (automatic)

---

## 🔐 User Management

### User Roles

**Admin:**
- Full access to all features
- Can manage users
- Can configure settings
- Can delete records

**Manager:**
- Can view all data
- Can create/edit records
- Cannot delete
- Cannot manage users

**Staff:**
- Can view data
- Can create records
- Limited edit access
- Cannot delete

### Add New User

1. Go to **Users** page
2. Click **"+ Add User"**
3. Fill details:
   - Username
   - Email
   - Password
   - Role
4. Click **"Create User"**

### Reset User Password (Admin Only)

1. Go to **Users** page
2. Click **"Reset Password"** on user
3. System generates temporary password
4. Share with user
5. User must change on first login

---

## 🎨 Dark Mode

**Toggle Dark Mode:**
- Click moon/sun icon in navigation
- Preference saved automatically
- Works across all pages

---

## 🔍 Search & Filters

### Global Search
- Available on most pages
- Search by name, SKU, invoice, GRN
- Real-time results

### Filters
- **Products:** Category, stock level
- **Inward:** Date range, supplier
- **Outward:** Date range, customer
- **Shipments:** Status, courier

### Pagination
- Default: 25 items per page
- Options: 10, 25, 50, 100
- Navigate with page numbers

---

## ⚠️ Troubleshooting

### Common Issues

**1. Cannot Login**
- Check username/password
- Ensure Caps Lock is off
- Contact admin for password reset

**2. "No token provided" Error**
- Logout and login again
- Clear browser cache
- Check if session expired

**3. "Insufficient stock" Error**
- Check current stock level
- Cannot sell more than available
- Add inward first if needed

**4. "Duplicate invoice/GRN" Error**
- Invoice/GRN already exists
- Use unique number
- Check existing records

**5. Email Not Sending**
- Check email settings
- Verify SMTP credentials
- Test with "Send Test Email"
- Check spam folder

**6. Low Stock Alert Not Working**
- Enable in Settings
- Check threshold value
- Ensure email configured
- Check notification recipients

**7. Data Not Loading**
- Check internet connection
- Refresh page (F5)
- Check backend server is running
- Clear browser cache

**8. Dashboard Not Updating**
- Click "Refresh" button
- Check last updated time
- Verify backend connection

---

## 📱 Best Practices

### Daily Operations

**Morning:**
1. Check Dashboard for today's summary
2. Review low stock alerts
3. Process pending shipments

**During Day:**
1. Record inward as goods arrive
2. Process outward for orders
3. Update shipment tracking

**Evening:**
1. Review activity logs
2. Check pending orders
3. Verify stock levels

### Data Entry

**Do's:**
✅ Use unique GRN/Invoice numbers
✅ Double-check quantities
✅ Select correct product/customer
✅ Add notes for clarity
✅ Update shipment status regularly

**Don'ts:**
❌ Don't use duplicate numbers
❌ Don't skip required fields
❌ Don't delete records with history
❌ Don't share login credentials

### Security

1. **Change default password** immediately
2. **Use strong passwords** (min 6 characters)
3. **Logout** when done
4. **Don't share** credentials
5. **Regular backups** of database

---

## 🆘 Support

### Getting Help

**Documentation:**
- User Manual (this document)
- Deployment Guide
- API Documentation

**Contact:**
- Email: support@yourcompany.com
- Phone: +91-XXXXXXXXXX

**Report Issues:**
- Describe the problem
- Include screenshots
- Mention steps to reproduce
- Note error messages

---

## 📝 Keyboard Shortcuts

- **Ctrl + K:** Global search
- **Ctrl + R:** Refresh page
- **Esc:** Close modals
- **Tab:** Navigate form fields

---

## 🔄 Updates & Maintenance

### Version History

**v1.0 (Current)**
- Initial release
- All core features
- Dashboard widgets
- Email notifications
- Critical safety features

### Upcoming Features
- Bulk product import
- Print invoices
- Mobile app
- Batch tracking

---

**End of User Manual**

For technical documentation, see:
- `DEPLOYMENT_GUIDE.md`
- `API_DOCUMENTATION.md`
- `DEVELOPER_GUIDE.md`
