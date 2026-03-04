# Warehouse WMS - Backend

## New Features (Feb 2026)

- Added user registration endpoint (`POST /api/auth/register`)
- Forgot/reset password flow:
  - `POST /api/auth/forgot-password` sends reset link (via configured email service)
  - `POST /api/auth/reset-password` accepts token and new password
- Database migration added: `reset_password_token` and `reset_password_expires` fields on `users` table

RESTful API backend for warehouse management system built with Node.js, Express, and MySQL.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
# Create .env file (see below)

# Run migrations
node database/migrations/create-users-table.js
node database/migrations/create-products-table.js
# ... (run all migrations)

# Start server
node server.js
```

Server runs at: http://localhost:3000

## Environment Variables

Create `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=warehouse_wms
JWT_SECRET=your_secret_key_here
PORT=3000
```

## Features

✅ JWT Authentication  
✅ User Management (Admin/User roles)  
✅ Product & Category Management  
✅ Customer & Supplier Management  
✅ Rack Management  
✅ Inward/Outward Operations  
✅ Sales & Purchase Orders  
✅ Stock Adjustments  
✅ Inventory Tracking  
✅ Email Notifications  
✅ Activity Logging  
✅ Dashboard Statistics  
✅ MVC Architecture

## Tech Stack

- Node.js
- Express.js
- MySQL
- JWT (jsonwebtoken)
- Bcrypt (password hashing)
- Nodemailer (email)

## Architecture

**MVC Pattern:**

- **Controllers** - Business logic
- **Routes** - HTTP endpoints
- **Utils** - Helper functions
- **Database** - Migrations & scripts

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products/all` - Get all products
- `POST /api/products/add` - Add product
- `PUT /api/products/update/:id` - Update product
- `DELETE /api/products/delete/:id` - Delete product

### Categories, Customers, Suppliers, Users, Racks

- Similar CRUD endpoints for each resource

### Inward/Outward

- `GET /api/inward` - Get inward records
- `POST /api/inward` - Add inward (auto-updates stock)
- `GET /api/outward` - Get outward records
- `POST /api/outward` - Add outward (auto-updates stock)

### Orders

- Sales Orders: `/api/sales-orders`
- Purchase Orders: `/api/purchase-orders`

### Settings

- `GET /api/settings/email` - Get email settings
- `POST /api/settings/email` - Save email settings
- `POST /api/settings/test-email` - Send test email
- `POST /api/settings/check-low-stock` - Trigger low stock alerts

## Documentation

📖 **Complete Documentation:** See `PROJECT_DOCUMENTATION.md`

### Additional Guides

- `PROFILE_SETTINGS_UPDATE.md` - Profile & settings
- `QUICK_REFERENCE.md` - Quick API reference
- `SALES_PURCHASE_ORDERS_GUIDE.md` - Orders module
- `STOCK_VALIDATION_FEATURE.md` - Stock validation

## Database Scripts

```bash
# Verify tables
node database/scripts/verify-tables.js

# Check stock levels
node database/scripts/check-stock.js

# Test connection
node database/scripts/test-connection.js
```

## Security

- JWT token-based authentication
- Bcrypt password hashing
- Protected routes with middleware
- Role-based access control (Admin/User)

## Project Structure

```
backend/
├── config/              Database config
├── controllers/         Business logic
├── database/
│   ├── migrations/      Table creation
│   └── scripts/         Utility scripts
├── routes/              API endpoints
├── utils/               Helpers
├── .env                 Environment variables
├── package.json
└── server.js            Entry point
```

## Troubleshooting

**Database Connection:**

```bash
mysql -u root -p
# Verify credentials in .env
```

**Port Already in Use:**

```bash
npx kill-port 3000
# Or change PORT in .env
```

**JWT Errors:**

- Check JWT_SECRET in .env
- Verify token format: `Bearer <token>`

---

**Built with ❤️ using Node.js + Express + MySQL**
