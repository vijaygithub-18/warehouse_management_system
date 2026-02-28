# Warehouse WMS Backend - Complete Documentation

## Project Overview
RESTful API backend for warehouse management system built with Node.js, Express, and MySQL. Follows MVC architecture with professional folder structure.

---

## 📁 Project Structure

```
backend/
├── config/                        Configuration files
│   └── db.js                      MySQL database connection
│
├── controllers/                   Business logic (MVC)
│   ├── authController.js          Authentication logic
│   ├── productController.js       Product operations
│   ├── inwardController.js        Goods receiving
│   └── outwardController.js       Goods dispatch
│
├── database/                      Database management
│   ├── migrations/                Table creation & updates (9 files)
│   │   ├── create-users-table.js
│   │   ├── create-products-table.js
│   │   ├── create-categories-table.js
│   │   ├── create-customers-table.js
│   │   ├── create-suppliers-table.js
│   │   ├── create-racks-table.js
│   │   ├── create-inward-table.js
│   │   ├── create-outward-table.js
│   │   └── create-email-settings-table.js
│   └── scripts/                   Utility & testing (3 files)
│       ├── check-stock.js
│       ├── verify-tables.js
│       └── test-connection.js
│
├── routes/                        HTTP routing (15 files)
│   ├── authRoutes.js              Authentication endpoints
│   ├── productRoutes.js           Product CRUD
│   ├── categoryRoutes.js          Category management
│   ├── customerRoutes.js          Customer management
│   ├── supplierRoutes.js          Supplier management
│   ├── userRoutes.js              User management
│   ├── rackRoutes.js              Rack management
│   ├── inwardRoutes.js            Goods receiving
│   ├── outwardRoutes.js           Goods dispatch
│   ├── salesOrderRoutes.js        Sales orders
│   ├── purchaseOrderRoutes.js     Purchase orders
│   ├── inventoryRoutes.js         Inventory tracking
│   ├── adjustmentRoutes.js        Stock adjustments
│   ├── dashboardRoutes.js         Dashboard data
│   └── settingsRoutes.js          Settings & email config
│
├── utils/                         Helper functions
│   ├── activityLogger.js          Activity logging
│   └── emailService.js            Email notifications
│
├── .env                           Environment variables
├── package.json                   Dependencies
└── server.js                      Application entry point
```

---

## 🎯 Architecture: MVC Pattern

### Model-View-Controller Separation

**Controllers** (Business Logic):
- Handle data processing
- Database operations
- Validation
- Response formatting

**Routes** (HTTP Layer):
- Define endpoints
- Handle requests/responses
- Call controller methods
- Apply middleware

**Example:**
```javascript
// routes/productRoutes.js (Clean routing)
const productController = require("../controllers/productController");

router.post("/add", verifyToken, productController.addProduct);
router.get("/all", productController.getAllProducts);
router.put("/update/:id", verifyToken, productController.updateProduct);
router.delete("/delete/:id", verifyToken, productController.deleteProduct);

// controllers/productController.js (Business logic)
exports.addProduct = async (req, res) => {
  try {
    // Validation
    // Database operations
    // Response handling
  } catch (error) {
    res.status(500).json({ error });
  }
};
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
```bash
cd "warehouse-wms backend"
npm install
```

2. **Configure Environment**
Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=warehouse_wms
JWT_SECRET=your_secret_key_here
PORT=3000
```

3. **Create Database**
```sql
CREATE DATABASE warehouse_wms;
```

4. **Run Migrations**
```bash
node database/migrations/create-users-table.js
node database/migrations/create-products-table.js
node database/migrations/create-categories-table.js
node database/migrations/create-customers-table.js
node database/migrations/create-suppliers-table.js
node database/migrations/create-racks-table.js
node database/migrations/create-inward-table.js
node database/migrations/create-outward-table.js
node database/migrations/create-email-settings-table.js
```

5. **Start Server**
```bash
node server.js
```

Server runs at: http://localhost:3000

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products/all` - Get all products
- `POST /api/products/add` - Add product (auth required)
- `PUT /api/products/update/:id` - Update product (auth required)
- `DELETE /api/products/delete/:id` - Delete product (auth required)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Add category (auth required)
- `PUT /api/categories/:id` - Update category (auth required)
- `DELETE /api/categories/:id` - Delete category (auth required)

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add customer (auth required)
- `PUT /api/customers/:id` - Update customer (auth required)
- `DELETE /api/customers/:id` - Delete customer (auth required)

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Add supplier (auth required)
- `PUT /api/suppliers/:id` - Update supplier (auth required)
- `DELETE /api/suppliers/:id` - Delete supplier (auth required)

### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Add user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Racks
- `GET /api/racks` - Get all racks
- `POST /api/racks` - Add rack (auth required)
- `PUT /api/racks/:id` - Update rack (auth required)
- `DELETE /api/racks/:id` - Delete rack (auth required)

### Inward (Goods Receiving)
- `GET /api/inward` - Get all inward records
- `POST /api/inward` - Add inward (auth required, auto-updates stock)

### Outward (Goods Dispatch)
- `GET /api/outward` - Get all outward records
- `POST /api/outward` - Add outward (auth required, auto-updates stock)

### Sales Orders
- `GET /api/sales-orders` - Get all sales orders
- `POST /api/sales-orders` - Create sales order (auth required)
- `DELETE /api/sales-orders/:id` - Delete sales order (auth required)

### Purchase Orders
- `GET /api/purchase-orders` - Get all purchase orders
- `POST /api/purchase-orders` - Create purchase order (auth required)
- `DELETE /api/purchase-orders/:id` - Delete purchase order (auth required)

### Inventory
- `GET /api/inventory` - Get inventory summary
- `GET /api/inventory/low-stock` - Get low stock items

### Stock Adjustments
- `GET /api/adjustments` - Get all adjustments
- `POST /api/adjustments` - Create adjustment (auth required)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Settings
- `GET /api/settings/email` - Get email settings (auth required)
- `POST /api/settings/email` - Save email settings (auth required)
- `POST /api/settings/test-email` - Send test email (auth required)
- `POST /api/settings/check-low-stock` - Trigger low stock alerts (auth required)

---

## 🔐 Authentication

### JWT Token-Based Authentication

**Login Flow:**
1. User sends credentials to `/api/auth/login`
2. Server validates and returns JWT token
3. Client stores token (localStorage)
4. Client sends token in Authorization header for protected routes

**Protected Route Example:**
```javascript
// Request header
Authorization: Bearer <your_jwt_token>
```

**Middleware:**
```javascript
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};
```

---

## 📧 Email Notifications

### Features
- SMTP configuration via API
- Test email functionality
- Low stock alerts
- Daily inventory reports
- Gmail integration support

### Email Service (`utils/emailService.js`)

**Functions:**
- `createTransporter(config)` - Create SMTP transporter
- `sendTestEmail(config)` - Send test email
- `sendLowStockAlert(config, products)` - Send low stock alert
- `sendDailyReport(config, data)` - Send daily report

### Database Table: `email_settings`
```sql
- id, enabled, smtp_host, smtp_port
- smtp_user, smtp_password
- from_email, from_name
- notification_emails
- low_stock_threshold
- send_daily_report, send_low_stock_alert
- created_at, updated_at
```

### Gmail Setup
1. Enable 2-Step Verification
2. Generate App Password
3. Configure in Settings:
   - SMTP Host: smtp.gmail.com
   - SMTP Port: 587
   - SMTP User: your-email@gmail.com
   - SMTP Password: [16-char app password]

**Detailed Guide:** See `EMAIL_BACKEND_SETUP.md`

---

## 🗄️ Database Schema

### Key Tables

**users**
- id, username, email, password (hashed)
- role (admin/user), is_active
- created_at, updated_at

**products**
- id, name, sku (auto-generated), category_id
- material, size, color, unit
- stock_quantity, min_stock_level
- supplier_id, rack_id
- created_at, updated_at

**categories**
- id, name, code, description
- created_at, updated_at

**customers**
- id, name, email, phone, address
- created_at, updated_at

**suppliers**
- id, name, email, phone, address
- created_at, updated_at

**racks**
- id, rack_number, location, capacity
- created_at, updated_at

**inward**
- id, product_id, quantity, supplier_id
- received_date, notes
- created_at

**outward**
- id, product_id, quantity, customer_id
- dispatch_date, notes
- created_at

**sales_orders**
- id, order_number, customer_id
- order_date, status, total_amount
- items (JSON), notes
- created_at, updated_at

**purchase_orders**
- id, order_number, supplier_id
- order_date, status, total_amount
- items (JSON), notes
- created_at, updated_at

**stock_adjustments**
- id, product_id, adjustment_type
- quantity, reason, adjusted_by
- created_at

**email_settings**
- id, enabled, smtp_host, smtp_port
- smtp_user, smtp_password
- from_email, from_name
- notification_emails
- low_stock_threshold
- send_daily_report, send_low_stock_alert
- created_at, updated_at

---

## 🔧 Utility Scripts

### Database Scripts

**Verify Tables:**
```bash
node database/scripts/verify-tables.js
```

**Check Stock Levels:**
```bash
node database/scripts/check-stock.js
```

**Test Connection:**
```bash
node database/scripts/test-connection.js
```

---

## 📊 Activity Logging

### Activity Logger (`utils/activityLogger.js`)

Automatically logs user actions:
- User login/logout
- Product CRUD operations
- Inward/Outward transactions
- Stock adjustments
- Order creation/deletion

**Usage:**
```javascript
const { logActivity } = require("../utils/activityLogger");

logActivity(userId, "CREATE_PRODUCT", "Added new product: Paper Cup");
```

---

## 🎯 Best Practices Implemented

1. **MVC Architecture** - Clear separation of concerns
2. **Security** - JWT authentication, password hashing (bcrypt)
3. **Error Handling** - Try-catch blocks, proper error responses
4. **Database Organization** - Migrations and scripts separated
5. **Code Quality** - Consistent naming, modular structure
6. **API Design** - RESTful endpoints, proper HTTP methods
7. **Environment Variables** - Sensitive data in .env
8. **Activity Logging** - Audit trail for all actions

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL service
mysql -u root -p

# Verify .env configuration
# Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
```

### Port Already in Use
```bash
# Change PORT in .env or kill process
npx kill-port 3000
```

### JWT Token Errors
- Verify JWT_SECRET in .env
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`

### Email Not Sending
- Verify SMTP credentials
- Check firewall settings
- Use App Password for Gmail
- Test with Mailtrap first

---

## 📈 Project Status

**Current Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** 2024

### Completed Features
- ✅ MVC Architecture
- ✅ JWT Authentication
- ✅ User Management
- ✅ Product Management
- ✅ Category Management
- ✅ Customer Management
- ✅ Supplier Management
- ✅ Rack Management
- ✅ Inward/Outward Operations
- ✅ Sales & Purchase Orders
- ✅ Stock Adjustments
- ✅ Inventory Tracking
- ✅ Dashboard Statistics
- ✅ Activity Logging
- ✅ Email Notifications
- ✅ Database Migrations
- ✅ Professional Structure

---

## 📝 Additional Documentation

- `EMAIL_BACKEND_SETUP.md` - Email notification setup
- `PROFILE_SETTINGS_UPDATE.md` - Profile & settings features
- `QUICK_REFERENCE.md` - Quick API reference
- `SALES_PURCHASE_ORDERS_GUIDE.md` - Orders module guide
- `STOCK_VALIDATION_FEATURE.md` - Stock validation details

---

## 🔄 Future Enhancements (Optional)

- [ ] Add Models layer for database operations
- [ ] Add Validation middleware
- [ ] Add Error handling middleware
- [ ] Implement rate limiting
- [ ] Add API documentation (Swagger)
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Implement caching (Redis)
- [ ] Add WebSocket for real-time updates
- [ ] Implement file upload for product images

---

## 👥 Support

For issues or questions:
1. Check this documentation
2. Review additional guides
3. Check server logs
4. Verify database connection
5. Test with Postman/Thunder Client

---

**Built with ❤️ using Node.js + Express + MySQL**
